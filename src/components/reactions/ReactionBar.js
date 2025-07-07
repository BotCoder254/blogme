import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiBookmark, FiShare2, FiSmile, FiTwitter, FiFacebook, FiLink } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Parse from '../../services/parseConfig';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Emoji reactions available
const REACTIONS = [
  { emoji: '👍', name: 'like', label: 'Like' },
  { emoji: '❤️', name: 'love', label: 'Love' },
  { emoji: '😂', name: 'laugh', label: 'Laugh' },
  { emoji: '😮', name: 'wow', label: 'Wow' },
  { emoji: '😢', name: 'sad', label: 'Sad' },
  { emoji: '👏', name: 'clap', label: 'Clap' },
];

const ReactionBar = ({ postId, initialLikes = 0, initialBookmarks = 0 }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [bookmarksCount, setBookmarksCount] = useState(initialBookmarks);
  
  // Query to check if user has liked or bookmarked the post
  const { data: userReactions } = useQuery({
    queryKey: ['userReactions', postId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return { liked: false, bookmarked: false, reaction: null };
      
      // Check if user has liked the post
      const UserLike = Parse.Object.extend('UserLike');
      const likeQuery = new Parse.Query(UserLike);
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      likeQuery.equalTo('post', post);
      likeQuery.equalTo('user', currentUser);
      
      const likeResult = await likeQuery.first();
      
      // Check if user has bookmarked the post
      const UserBookmark = Parse.Object.extend('UserBookmark');
      const bookmarkQuery = new Parse.Query(UserBookmark);
      
      bookmarkQuery.equalTo('post', post);
      bookmarkQuery.equalTo('user', currentUser);
      
      const bookmarkResult = await bookmarkQuery.first();
      
      // Check if user has reacted to the post
      const UserReaction = Parse.Object.extend('UserReaction');
      const reactionQuery = new Parse.Query(UserReaction);
      
      reactionQuery.equalTo('post', post);
      reactionQuery.equalTo('user', currentUser);
      
      const reactionResult = await reactionQuery.first();
      
      return { 
        liked: !!likeResult, 
        bookmarked: !!bookmarkResult,
        reaction: reactionResult ? reactionResult.get('reaction') : null
      };
    },
    enabled: !!currentUser,
    staleTime: 60000 // 1 minute
  });
  
  // Query to get reaction counts
  const { data: reactionCounts } = useQuery({
    queryKey: ['reactionCounts', postId],
    queryFn: async () => {
      const UserReaction = Parse.Object.extend('UserReaction');
      const query = new Parse.Query(UserReaction);
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      query.equalTo('post', post);
      
      // Count reactions by type
      const results = await query.find();
      const counts = {};
      
      REACTIONS.forEach(reaction => {
        counts[reaction.name] = 0;
      });
      
      results.forEach(result => {
        const reaction = result.get('reaction');
        if (counts[reaction] !== undefined) {
          counts[reaction]++;
        }
      });
      
      return counts;
    },
    staleTime: 60000 // 1 minute
  });
  
  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to like posts');
      }
      
      const UserLike = Parse.Object.extend('UserLike');
      const likeQuery = new Parse.Query(UserLike);
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      likeQuery.equalTo('post', post);
      likeQuery.equalTo('user', currentUser);
      
      const existingLike = await likeQuery.first();
      
      if (existingLike) {
        // Unlike the post
        await existingLike.destroy();
        
        // Update like count on the post
        post.increment('likes', -1);
        await post.save(null, { useMasterKey: true });
        
        return { liked: false };
      } else {
        // Like the post
        const like = new UserLike();
        like.set('post', post);
        like.set('user', currentUser);
        await like.save();
        
        // Update like count on the post
        post.increment('likes');
        await post.save(null, { useMasterKey: true });
        
        return { liked: true };
      }
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['userReactions', postId, currentUser?.id], old => ({
        ...old,
        liked: data.liked
      }));
      
      // Invalidate blog post query to update like count
      queryClient.invalidateQueries(['blog', postId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update like');
    }
  });
  
  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to bookmark posts');
      }
      
      const UserBookmark = Parse.Object.extend('UserBookmark');
      const bookmarkQuery = new Parse.Query(UserBookmark);
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      bookmarkQuery.equalTo('post', post);
      bookmarkQuery.equalTo('user', currentUser);
      
      const existingBookmark = await bookmarkQuery.first();
      
      if (existingBookmark) {
        // Remove bookmark
        await existingBookmark.destroy();
        
        // Update bookmark count on the post
        post.increment('bookmarks', -1);
        await post.save(null, { useMasterKey: true });
        
        return { bookmarked: false };
      } else {
        // Add bookmark
        const bookmark = new UserBookmark();
        bookmark.set('post', post);
        bookmark.set('user', currentUser);
        await bookmark.save();
        
        // Update bookmark count on the post
        post.increment('bookmarks');
        await post.save(null, { useMasterKey: true });
        
        return { bookmarked: true };
      }
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['userReactions', postId, currentUser?.id], old => ({
        ...old,
        bookmarked: data.bookmarked
      }));
      
      // Invalidate blog post query to update bookmark count
      queryClient.invalidateQueries(['blog', postId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update bookmark');
    }
  });
  
  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (reactionName) => {
      if (!currentUser) {
        throw new Error('You must be logged in to react to posts');
      }
      
      const UserReaction = Parse.Object.extend('UserReaction');
      const reactionQuery = new Parse.Query(UserReaction);
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const post = new BlogPost();
      post.id = postId;
      
      reactionQuery.equalTo('post', post);
      reactionQuery.equalTo('user', currentUser);
      
      const existingReaction = await reactionQuery.first();
      
      if (existingReaction) {
        // If same reaction, remove it
        if (existingReaction.get('reaction') === reactionName) {
          await existingReaction.destroy();
          return { reaction: null };
        } else {
          // Update to new reaction
          existingReaction.set('reaction', reactionName);
          await existingReaction.save();
          return { reaction: reactionName };
        }
      } else {
        // Add new reaction
        const reaction = new UserReaction();
        reaction.set('post', post);
        reaction.set('user', currentUser);
        reaction.set('reaction', reactionName);
        await reaction.save();
        
        return { reaction: reactionName };
      }
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['userReactions', postId, currentUser?.id], old => ({
        ...old,
        reaction: data.reaction
      }));
      
      // Invalidate reaction counts
      queryClient.invalidateQueries(['reactionCounts', postId]);
      
      // Close emoji picker
      setShowEmojiPicker(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update reaction');
    }
  });
  
  // Handle like button click
  const handleLike = () => {
    toggleLikeMutation.mutate();
  };
  
  // Handle bookmark button click
  const handleBookmark = () => {
    toggleBookmarkMutation.mutate();
  };
  
  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = document.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => toast.success('Link copied to clipboard!'))
          .catch(() => toast.error('Failed to copy link'));
        break;
      default:
        break;
    }
    
    setShowShareMenu(false);
  };
  
  // Find user's current reaction emoji
  const userReactionEmoji = userReactions?.reaction 
    ? REACTIONS.find(r => r.name === userReactions.reaction)?.emoji
    : null;

  return (
    <div className="flex items-center justify-center space-x-8 py-4 border-t border-b border-gray-200 my-8">
      <button 
        onClick={handleLike}
        className={`flex flex-col items-center ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
        disabled={toggleLikeMutation.isLoading}
      >
        <FiHeart className={`h-6 w-6 mb-1 ${liked ? 'fill-current' : ''}`} />
        <span className="text-sm">{likesCount}</span>
      </button>
      
      <button 
        onClick={handleBookmark}
        className={`flex flex-col items-center ${bookmarked ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'} transition-colors`}
        disabled={toggleBookmarkMutation.isLoading}
      >
        <FiBookmark className={`h-6 w-6 mb-1 ${bookmarked ? 'fill-current' : ''}`} />
        <span className="text-sm">{bookmarksCount}</span>
      </button>
      
      <div className="relative">
        <button 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`flex flex-col items-center text-gray-500 hover:text-primary-500 transition-colors`}
        >
          {userReactionEmoji ? (
            <span className="text-xl">{userReactionEmoji}</span>
          ) : (
            <FiSmile className="h-6 w-6 mb-1" />
          )}
          <span className="text-sm">React</span>
        </button>
        
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 flex space-x-2 z-10 border border-gray-100"
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.name}
                  onClick={() => addReactionMutation.mutate(reaction.name)}
                  className={`w-8 h-8 text-xl flex items-center justify-center rounded-full hover:bg-gray-100 ${
                    userReactions?.reaction === reaction.name ? 'bg-gray-100' : ''
                  }`}
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowShareMenu(!showShareMenu)}
          className={`flex flex-col items-center text-gray-500 hover:text-primary-500 transition-colors`}
        >
          <FiShare2 className="h-6 w-6 mb-1" />
          <span className="text-sm">Share</span>
        </button>
        
        {showShareMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 flex space-x-2">
            <button 
              onClick={() => handleShare('twitter')}
              className="p-2 text-blue-400 hover:bg-blue-50 rounded-full"
              title="Share on Twitter"
            >
              <FiTwitter className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => handleShare('facebook')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="Share on Facebook"
            >
              <FiFacebook className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => handleShare('copy')}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
              title="Copy Link"
            >
              <FiLink className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionBar; 