import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiMoreHorizontal, FiX, FiUser } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Parse from '../../services/parseConfig';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

// Single comment component
const Comment = ({ comment, onDelete, currentUserId }) => {
  const [showOptions, setShowOptions] = useState(false);
  const author = comment.get('author');
  const authorName = author ? author.get('username') : 'Anonymous';
  const authorAvatar = author && author.get('profileImage') ? author.get('profileImage').url() : null;
  const content = comment.get('content');
  const createdAt = comment.get('createdAt');
  const commentId = comment.id;
  const isAuthor = currentUserId && author && currentUserId === author.id;
  const isAdmin = currentUserId && comment.get('isAdmin');
  const canDelete = isAuthor || isAdmin;
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 py-6 border-b border-gray-100"
    >
      {/* Author avatar */}
      {authorAvatar ? (
        <img 
          src={authorAvatar} 
          alt={authorName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
          <FiUser className="w-5 h-5" />
        </div>
      )}
      
      {/* Comment content */}
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="font-medium text-dark-700">{authorName}</h4>
            <p className="text-xs text-dark-400">{formatDate(createdAt)}</p>
          </div>
          
          {canDelete && (
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 text-dark-400 hover:text-dark-600 rounded-full"
              >
                <FiMoreHorizontal />
              </button>
              
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onDelete(commentId);
                          setShowOptions(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FiTrash2 className="mr-2" /> Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <p className="text-dark-600">{content}</p>
      </div>
    </motion.div>
  );
};

const CommentSection = ({ postId }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  
  // Fetch comments for this post
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const Comment = Parse.Object.extend('Comment');
      const query = new Parse.Query(Comment);
      
      // Get comments for this post
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      query.equalTo('post', post);
      query.include('author');
      query.descending('createdAt');
      
      const results = await query.find();
      return results;
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const Comment = Parse.Object.extend('Comment');
      const comment = new Comment();
      
      // Set up the post reference
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      // Set comment data
      comment.set('post', post);
      comment.set('author', currentUser);
      comment.set('content', content);
      
      // Save the comment
      await comment.save();
      
      // Update comment count on the post
      post.increment('comments');
      await post.save(null, { useMasterKey: true });
      
      return comment;
    },
    onSuccess: () => {
      // Clear the comment text
      setCommentText('');
      
      // Invalidate and refetch comments
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['blog', postId]);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a comment');
      }
      
      const Comment = Parse.Object.extend('Comment');
      const query = new Parse.Query(Comment);
      const comment = await query.get(commentId);
      
      // Check if the current user is the author or an admin
      const author = comment.get('author');
      const isAuthor = author && author.id === currentUser.id;
      const isAdmin = currentUser.get('isAdmin');
      
      if (!isAuthor && !isAdmin) {
        throw new Error('You can only delete your own comments');
      }
      
      // Get the post to update comment count
      const post = comment.get('post');
      
      // Delete the comment
      await comment.destroy();
      
      // Decrement comment count on the post
      post.increment('comments', -1);
      await post.save(null, { useMasterKey: true });
      
      return commentId;
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['blog', postId]);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Handle comment submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    setError('');
    addCommentMutation.mutate(commentText);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Comments ({comments?.length || 0})</h3>
      
      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            {currentUser.get('profileImage') ? (
              <img 
                src={currentUser.get('profileImage').url()} 
                alt={currentUser.get('username')}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                {currentUser.get('username').charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
              ></textarea>
              
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center"
                  isLoading={addCommentMutation.isLoading}
                >
                  <FiSend className="mr-2" /> Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
          <p className="text-dark-500 mb-2">You must be logged in to comment.</p>
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Log in to comment
          </Link>
        </div>
      )}
      
      {/* Comments list */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : comments?.length > 0 ? (
          comments.map((comment) => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              onDelete={deleteCommentMutation.mutate}
              currentUserId={currentUser?.id}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-dark-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 