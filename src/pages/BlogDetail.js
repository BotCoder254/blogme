import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiCalendar, FiUser, FiTag, FiShare2, FiHeart, FiMessageSquare, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parseConfig';
import Button from '../components/ui/Button';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);

  // Fetch blog post data
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Include the author data
      query.include('createdBy');
      
      const post = await query.get(id);
      
      // Check if the current user has liked this post
      if (currentUser) {
        const Like = Parse.Object.extend('Like');
        const likeQuery = new Parse.Query(Like);
        likeQuery.equalTo('user', currentUser);
        likeQuery.equalTo('blog', post);
        const userLike = await likeQuery.first();
        setLiked(!!userLike);
      }
      
      return post;
    }
  });

  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ['relatedPosts', blog?.get('category')],
    enabled: !!blog,
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Get posts with the same category, excluding the current post
      const blogCategory = blog.get('category');
      if (blogCategory) {
        query.equalTo('category', blogCategory);
      }
      query.notEqualTo('objectId', id);
      query.include('createdBy');
      query.limit(2);
      
      const posts = await query.find();
      return posts;
    }
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a post');
      }
      
      const Like = Parse.Object.extend('Like');
      const likeQuery = new Parse.Query(Like);
      likeQuery.equalTo('user', currentUser);
      likeQuery.equalTo('blog', blog);
      const userLike = await likeQuery.first();
      
      if (userLike) {
        // Unlike
        await userLike.destroy();
        return false;
      } else {
        // Like
        const like = new Like();
        like.set('user', currentUser);
        like.set('blog', blog);
        await like.save();
        return true;
      }
    },
    onSuccess: (isLiked) => {
      setLiked(isLiked);
      queryClient.invalidateQueries(['blog', id]);
    }
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a post');
      }
      
      // Check if the current user is the author
      const author = blog.get('createdBy');
      if (author.id !== currentUser.id) {
        throw new Error('You can only delete your own posts');
      }
      
      await blog.destroy();
    },
    onSuccess: () => {
      navigate('/dashboard');
      queryClient.invalidateQueries(['userBlogs']);
    }
  });

  // Handle like/unlike
  const handleLike = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    likeMutation.mutate();
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deleteBlogMutation.mutate();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate read time (1 min per 200 words)
  const calculateReadTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-dark-700 mb-4">Blog not found</h2>
        <p className="text-dark-500 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blogs" className="btn btn-primary">
          Back to Blogs
        </Link>
      </div>
    );
  }

  // Extract blog data
  const title = blog.get('title');
  const content = blog.get('content');
  const coverImage = blog.get('coverImage') ? blog.get('coverImage').url() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  const category = blog.get('category');
  const tags = blog.get('tags') || [];
  const createdAt = blog.get('createdAt');
  const author = blog.get('createdBy');
  const authorName = author ? author.get('username') : 'Unknown Author';
  const authorAvatar = author && author.get('profileImage') 
    ? author.get('profileImage').url() 
    : null;
  const readTime = calculateReadTime(content);
  
  // Get category name safely
  const getCategoryName = () => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object') {
      // If it's a Parse object, try to get the name
      return category.get ? category.get('name') || 'Uncategorized' : 'Uncategorized';
    }
    return 'Uncategorized';
  };
  
  const categoryName = getCategoryName();
  
  // Check if the current user is the author
  const isAuthor = currentUser && author && currentUser.id === author.id;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-dark-900/40 z-10"></div>
        <img 
          src={coverImage} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <Link to="/blogs" className="inline-flex items-center text-white mb-6 hover:text-primary-300 transition-colors">
              <FiArrowLeft className="mr-2" /> Back to Blogs
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">{title}</h1>
            <div className="flex flex-wrap items-center mt-6 text-white/80 text-sm gap-4">
              <div className="flex items-center">
                <FiUser className="mr-1" /> {authorName}
              </div>
              <div className="flex items-center">
                <FiCalendar className="mr-1" /> {formatDate(createdAt)}
              </div>
              <div className="flex items-center">
                <FiClock className="mr-1" /> {readTime}
              </div>
              <div className="flex items-center">
                <FiTag className="mr-1" /> {categoryName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              {authorAvatar ? (
                <img 
                  src={authorAvatar} 
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-medium text-dark-700">{authorName}</h3>
                <p className="text-sm text-dark-500">Author</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className={`flex items-center ${liked ? 'text-red-500' : 'text-dark-400'} hover:text-red-500 transition-colors`}
                onClick={handleLike}
              >
                <FiHeart className={`mr-1 ${liked ? 'fill-current' : ''}`} /> 
                <span>{blog.get('likes') || 0}</span>
              </button>
              <button className="flex items-center text-dark-400 hover:text-primary-500 transition-colors">
                <FiMessageSquare className="mr-1" /> 
                <span>{blog.get('comments') || 0}</span>
              </button>
              <button className="flex items-center text-dark-400 hover:text-primary-500 transition-colors">
                <FiShare2 className="mr-1" /> 
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Author actions */}
          {isAuthor && (
            <div className="mb-8 flex space-x-4">
              <Link to={`/edit-post/${id}`} className="btn btn-outline flex items-center">
                <FiEdit className="mr-2" /> Edit Post
              </Link>
              <Button
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={handleDelete}
                isLoading={deleteBlogMutation.isLoading}
              >
                <FiTrash2 className="mr-2" /> Delete Post
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/blogs?tag=${tag}`}
                    className="bg-gray-100 hover:bg-gray-200 text-dark-600 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-6">You might also like</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((post) => (
                  <div key={post.id} className="card card-hover">
                    <div className="h-40 rounded-t-xl overflow-hidden">
                      <img 
                        src={post.get('coverImage') ? post.get('coverImage').url() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                        alt={post.get('title')} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold mb-2">{post.get('title')}</h4>
                      <p className="text-dark-500 text-sm mb-2">{post.get('excerpt') || post.get('content').substring(0, 100) + '...'}</p>
                      <Link to={`/blogs/${post.id}`} className="text-primary-600 text-sm font-medium hover:text-primary-700">
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 