import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiMoreHorizontal, FiX, FiUser, FiMessageSquare, FiMoreVertical, FiFlag, FiCornerDownRight } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Parse from '../../services/parseConfig';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

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

const CommentForm = ({ postId, parentId = null, onSuccess }) => {
  const [commentText, setCommentText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content, parentId }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }

      const Comment = Parse.Object.extend('Comment');
      const comment = new Comment();
      
      // Set comment data
      comment.set('content', content);
      comment.set('user', currentUser);
      
      // Set post reference
      const BlogPost = Parse.Object.extend('BlogPost');
      const postPointer = new BlogPost();
      postPointer.id = postId;
      comment.set('post', postPointer);
      
      // Set parent comment if this is a reply
      if (parentId) {
        const parentComment = new Comment();
        parentComment.id = parentId;
        comment.set('parentComment', parentComment);
      }
      
      const result = await comment.save();
      return result;
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries(['comments', postId]);
      if (onSuccess) onSuccess();
      toast.success(parentId ? 'Reply added successfully' : 'Comment added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    createCommentMutation.mutate({
      postId,
      content: commentText,
      parentId
    });
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="mb-4">You need to be logged in to comment</p>
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-medium">
            {parentId ? 'Write a reply' : 'Leave a comment'}
          </h3>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1 text-sm rounded ${
                isPreviewMode ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        
        {isPreviewMode ? (
          <div className="border rounded-lg p-4 min-h-[100px] prose prose-sm max-w-none">
            {commentText ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(commentText) }} />
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        ) : (
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
            placeholder="Write your comment here..."
            required
          />
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createCommentMutation.isLoading || !commentText.trim()}
          className={`btn btn-primary ${createCommentMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {createCommentMutation.isLoading ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

const CommentActions = ({ comment, isAuthor, isPostAuthor }) => {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const Comment = Parse.Object.extend('Comment');
      const query = new Parse.Query(Comment);
      const comment = await query.get(commentId);
      await comment.destroy();
      return commentId;
    },
    onSuccess: (commentId) => {
      const postId = comment.get('post').id;
      queryClient.invalidateQueries(['comments', postId]);
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    }
  });
  
  const reportCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      // In a real app, you'd create a Report object in Parse
      // For now, we'll just simulate a report
      await new Promise(resolve => setTimeout(resolve, 500));
      return commentId;
    },
    onSuccess: () => {
      toast.success('Comment reported. Our team will review it.');
    }
  });
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(comment.id);
    }
    setShowMenu(false);
  };
  
  const handleReport = () => {
    reportCommentMutation.mutate(comment.id);
    setShowMenu(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-500 hover:text-gray-700"
      >
        <FiMoreVertical />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-40">
          {(isAuthor || isPostAuthor) && (
            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              disabled={deleteCommentMutation.isLoading}
            >
              <FiTrash2 className="mr-2" />
              {deleteCommentMutation.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          )}
          
          {!isAuthor && (
            <button
              onClick={handleReport}
              className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              disabled={reportCommentMutation.isLoading}
            >
              <FiFlag className="mr-2" />
              {reportCommentMutation.isLoading ? 'Reporting...' : 'Report'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CommentItem = ({ comment, postAuthorId, currentUser, postId, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 2); // Auto-expand first two levels
  
  const user = comment.get('user');
  const content = comment.get('content');
  const createdAt = comment.get('createdAt');
  const commentId = comment.id;
  
  const { data: replies = [] } = useQuery({
    queryKey: ['replies', commentId],
    queryFn: async () => {
      const Comment = Parse.Object.extend('Comment');
      const query = new Parse.Query(Comment);
      query.equalTo('parentComment', comment);
      query.include('user');
      query.ascending('createdAt');
      const results = await query.find();
      return results;
    },
    enabled: !!commentId
  });
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const isAuthor = currentUser && user && currentUser.id === user.id;
  const isPostAuthor = currentUser && currentUser.id === postAuthorId;
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
    setShowReplies(true);
  };
  
  // Don't nest replies too deeply
  const maxNestingLevel = 3;
  
  return (
    <div className={`mb-4 ${level > 0 ? 'ml-6 pl-4 border-l border-gray-200' : ''}`}>
      <div className="flex items-start">
        {/* User Avatar */}
        {user && user.get('profileImage') ? (
          <img 
            src={user.get('profileImage').url()} 
            alt={user.get('username')}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
            <FiUser />
          </div>
        )}
        
        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-800">
                {user ? user.get('username') : 'Anonymous'}
                {isAuthor && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                {isPostAuthor && !isAuthor && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Author</span>}
              </h4>
              <CommentActions 
                comment={comment} 
                isAuthor={isAuthor} 
                isPostAuthor={isPostAuthor} 
              />
            </div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>{formatDate(createdAt)}</span>
            {level < maxNestingLevel && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="ml-4 flex items-center hover:text-primary-600"
              >
                <FiCornerDownRight className="mr-1" />
                {showReplyForm ? 'Cancel' : 'Reply'}
              </button>
            )}
            {replies.length > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="ml-4 flex items-center hover:text-primary-600"
              >
                <FiMessageSquare className="mr-1" />
                {showReplies ? `Hide ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm 
                postId={postId} 
                parentId={commentId} 
                onSuccess={handleReplySuccess} 
              />
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
            <div className="mt-3">
              {replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  postAuthorId={postAuthorId} 
                  currentUser={currentUser} 
                  postId={postId} 
                  level={level + 1} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ postId }) => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;
  
  // Get post author for highlighting author comments
  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      query.include('author');
      const result = await query.get(postId);
      return result;
    }
  });
  
  // Fetch top-level comments (no parent)
  const { 
    data: commentsData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['comments', postId, currentPage],
    queryFn: async () => {
      const Comment = Parse.Object.extend('Comment');
      const query = new Parse.Query(Comment);
      query.equalTo('post', { __type: 'Pointer', className: 'BlogPost', objectId: postId });
      query.doesNotExist('parentComment'); // Only top-level comments
      query.include('user');
      query.descending('createdAt');
      
      // Apply pagination
      query.skip((currentPage - 1) * commentsPerPage);
      query.limit(commentsPerPage);
      
      const results = await query.find();
      
      // Get total count for pagination
      const countQuery = new Parse.Query(Comment);
      countQuery.equalTo('post', { __type: 'Pointer', className: 'BlogPost', objectId: postId });
      countQuery.doesNotExist('parentComment');
      const count = await countQuery.count();
      
      return {
        comments: results,
        totalCount: count,
        totalPages: Math.ceil(count / commentsPerPage)
      };
    }
  });
  
  const postAuthorId = post?.get('author')?.id;
  
  // Generate pagination controls
  const renderPagination = () => {
    if (!commentsData || commentsData.totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= commentsData.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 mx-1 rounded-full ${
            i === currentPage
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 mx-1 rounded-full ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          &lt;
        </button>
        
        {pages}
        
        <button
          onClick={() => setCurrentPage(Math.min(commentsData.totalPages, currentPage + 1))}
          disabled={currentPage === commentsData.totalPages}
          className={`w-8 h-8 mx-1 rounded-full ${
            currentPage === commentsData.totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          &gt;
        </button>
      </div>
    );
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      <CommentForm postId={postId} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-500">
          Error loading comments. Please try again.
        </div>
      ) : commentsData?.comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              {commentsData.totalCount} {commentsData.totalCount === 1 ? 'Comment' : 'Comments'}
            </h3>
          </div>
          
          {commentsData.comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postAuthorId={postAuthorId} 
              currentUser={currentUser} 
              postId={postId} 
            />
          ))}
          
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default CommentSection; 