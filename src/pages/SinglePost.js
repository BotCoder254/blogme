import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import DOMPurify from 'dompurify';
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock, FiCalendar, FiTag, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parseConfig';
import CommentSection from '../components/comments/CommentSection';
import ReactionBar from '../components/reactions/ReactionBar';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch blog post data
  const { data: blog, isLoading, isError, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Include author and category information
      query.include('author');
      query.include('category');
      
      const result = await query.get(id);
      
      // Increment view count
      result.increment('views');
      await result.save(null, { useMasterKey: true });
      
      return result;
    },
    retry: false,
    onError: (error) => {
      console.error('Error fetching blog post:', error);
    }
  });
  
  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ['relatedPosts', blog?.get('category')?.id],
    queryFn: async () => {
      if (!blog) return [];
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Get posts from the same category, excluding current post
      const blogCategory = blog.get('category');
      if (blogCategory) {
        query.equalTo('category', blogCategory);
      }
      query.notEqualTo('objectId', id);
      query.include('author');
      query.limit(3);
      
      const results = await query.find();
      return results;
    },
    enabled: !!blog
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a post');
      }
      
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      const post = await query.get(id);
      
      // Check if current user is the author
      const author = post.get('author');
      if (!author || author.id !== currentUser.id) {
        throw new Error('You can only delete your own posts');
      }
      
      await post.destroy();
      return id;
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');
      navigate('/dashboard');
      queryClient.invalidateQueries(['userBlogs']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete post');
    }
  });
  
  // Handle delete confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };
  
  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
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
  
  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // If error, show error message
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Post</h2>
        <p className="text-gray-600 mb-6">{error?.message || 'The post could not be found or has been removed.'}</p>
        <Button variant="primary" onClick={() => navigate('/blogs')}>
          <FiArrowLeft className="mr-2" /> Back to Blogs
        </Button>
      </div>
    );
  }
  
  // Extract blog data
  const title = blog.get('title');
  const content = blog.get('content');
  const coverImage = blog.get('coverImage')?.url();
  const category = blog.get('category');
  const createdAt = blog.get('createdAt');
  const author = blog.get('author');
  const tags = blog.get('tags') || [];
  const likes = blog.get('likes') || 0;
  const bookmarks = blog.get('bookmarks') || 0;
  const views = blog.get('views') || 0;
  
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
  
  // Check if current user is the author
  const isAuthor = currentUser && author && author.id === currentUser.id;
  
  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 
      'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
  });
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{title} | BlogMe</title>
        <meta name="description" content={`${content.substring(0, 160)}...`} />
        {coverImage && <meta property="og:image" content={coverImage} />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`${content.substring(0, 160)}...`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={`${content.substring(0, 160)}...`} />
        {coverImage && <meta name="twitter:image" content={coverImage} />}
      </Helmet>
      
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-500"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
      </div>
      
      {/* Blog Header */}
      <header className="mb-8">
        {category && (
          <Link 
            to={`/blogs?category=${category.id}`}
            className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-4"
          >
            {categoryName}
          </Link>
        )}
        
        <h1 className="text-4xl font-bold text-dark-900 mb-4">{title}</h1>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {/* Author info */}
            <div className="flex items-center">
              {author?.get('profileImage') ? (
                <img 
                  src={author.get('profileImage').url()} 
                  alt={author.get('username')}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                  <FiUser className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-medium text-dark-800">
                  {author ? author.get('username') : 'Unknown Author'}
                </p>
                <div className="flex items-center text-xs text-dark-500">
                  <FiCalendar className="mr-1" /> {formatDate(createdAt)}
                  <span className="mx-2">•</span>
                  <FiClock className="mr-1" /> {calculateReadTime(content)} min read
                  <span className="mx-2">•</span>
                  <span>{views} views</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit/Delete buttons for author */}
          {isAuthor && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/edit-post/${id}`)}
                className="flex items-center"
              >
                <FiEdit2 className="mr-2" /> Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex items-center"
                isLoading={deleteMutation.isLoading}
              >
                <FiTrash2 className="mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Cover Image */}
      {coverImage && (
        <div className="mb-8">
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-auto rounded-lg object-cover max-h-96"
          />
        </div>
      )}
      
      {/* Blog Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <FiTag className="text-dark-400" />
          {tags.map((tag, index) => (
            <Link
              key={index}
              to={`/blogs?tag=${tag}`}
              className="bg-gray-100 text-dark-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      
      {/* Reaction Bar */}
      <ReactionBar postId={id} initialLikes={likes} initialBookmarks={bookmarks} />
      
      {/* Author Bio */}
      {author && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-start sm:items-center flex-col sm:flex-row">
            {author.get('profileImage') ? (
              <img 
                src={author.get('profileImage').url()} 
                alt={author.get('username')}
                className="w-16 h-16 rounded-full object-cover mr-4 mb-4 sm:mb-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4 mb-4 sm:mb-0">
                <FiUser className="w-8 h-8" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {author.get('username')}
              </h3>
              <p className="text-dark-600 mb-3">
                {author.get('bio') || 'No bio available'}
              </p>
              <Link 
                to={`/blogs?author=${author.id}`}
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                View all posts by this author
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection postId={id} />
      </div>
      
      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">Related Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(post => (
              <Link 
                to={`/blog/${post.id}`} 
                key={post.id}
                className="group"
              >
                <div className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {post.get('coverImage') && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={post.get('coverImage').url()} 
                        alt={post.get('title')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-dark-800 mb-2 line-clamp-2 group-hover:text-primary-600">
                      {post.get('title')}
                    </h4>
                    <div className="flex items-center text-xs text-dark-500">
                      <span>{post.get('author')?.get('username') || 'Unknown'}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(post.get('createdAt'))}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SinglePost; 