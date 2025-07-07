import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiTrendingUp, FiClock, FiThumbsUp, FiHeart, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Parse from '../services/parseConfig';
import Slider from 'react-slick';
import Masonry from 'react-masonry-css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Featured blog card component
const FeaturedBlogCard = ({ blog }) => {
  // Extract blog data
  const title = blog.get('title');
  const content = blog.get('content');
  const coverImage = blog.get('coverImage') ? blog.get('coverImage').url() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const category = blog.get('category');
  const createdAt = blog.get('createdAt');
  const author = blog.get('createdBy');
  const authorName = author ? author.get('username') : 'Unknown Author';
  const authorAvatar = author && author.get('profileImage') ? author.get('profileImage').url() : null;
  const likes = blog.get('likes') || 0;
  const comments = blog.get('comments') || 0;
  
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate read time (1 min per 200 words)
  const calculateReadTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const readTime = calculateReadTime(content);
  const excerpt = blog.get('excerpt') || content.substring(0, 150) + '...';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card card-hover h-full flex flex-col"
    >
      <div className="relative h-64 mb-4 overflow-hidden rounded-t-xl">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Featured
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full mr-2 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-dark-700">{authorName}</p>
            <p className="text-xs text-dark-400">{formatDate(createdAt)}</p>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors">
          <Link to={`/blogs/${blog.id}`}>{title}</Link>
        </h3>
        <p className="text-dark-500 mb-4">{excerpt}</p>
        <div className="flex items-center text-xs text-dark-400 mb-4">
          <span className="bg-gray-100 text-dark-500 px-2 py-1 rounded-full">{categoryName}</span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <FiClock className="mr-1" /> {readTime}
          </span>
        </div>
      </div>
      <div className="p-4 pt-0 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-dark-400 text-sm">
              <FiHeart className="mr-1 text-red-500" /> {likes}
            </span>
            <span className="flex items-center text-dark-400 text-sm">
              <FiMessageSquare className="mr-1 text-blue-500" /> {comments}
            </span>
          </div>
          <Link
            to={`/blogs/${blog.id}`}
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
          >
            Read More <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Blog card component
const BlogCard = ({ blog }) => {
  // Extract blog data
  const title = blog.get('title');
  const content = blog.get('content');
  const coverImage = blog.get('coverImage') ? blog.get('coverImage').url() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const category = blog.get('category');
  const createdAt = blog.get('createdAt');
  const author = blog.get('createdBy');
  const authorName = author ? author.get('username') : 'Unknown Author';
  const authorAvatar = author && author.get('profileImage') ? author.get('profileImage').url() : null;
  const likes = blog.get('likes') || 0;
  const comments = blog.get('comments') || 0;
  
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate read time (1 min per 200 words)
  const calculateReadTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const readTime = calculateReadTime(content);
  const excerpt = blog.get('excerpt') || content.substring(0, 100) + '...';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card card-hover h-full flex flex-col mb-6"
    >
      <div className="relative h-48 mb-4 overflow-hidden rounded-t-xl">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/80 backdrop-blur-sm text-dark-600 text-xs font-semibold px-2 py-1 rounded-full">
            {categoryName}
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-6 h-6 rounded-full mr-2 object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-xs text-dark-500">{authorName}</p>
          <span className="mx-2 text-dark-400">•</span>
          <p className="text-xs text-dark-400">{formatDate(createdAt)}</p>
        </div>
        <h3 className="text-lg font-bold mb-2 hover:text-primary-600 transition-colors">
          <Link to={`/blogs/${blog.id}`}>{title}</Link>
        </h3>
        <p className="text-dark-500 mb-4 text-sm">{excerpt}</p>
      </div>
      <div className="p-4 pt-0 mt-auto border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-dark-400 text-xs">
              <FiClock className="mr-1" /> {readTime}
            </span>
            <span className="flex items-center text-dark-400 text-xs">
              <FiHeart className="mr-1 text-red-500" /> {likes}
            </span>
          </div>
          <Link
            to={`/blogs/${blog.id}`}
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 text-sm"
          >
            Read <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Hero Slider Blog Card
const HeroSliderBlogCard = ({ blog }) => {
  const title = blog.get('title');
  const content = blog.get('content');
  const coverImage = blog.get('coverImage') ? blog.get('coverImage').url() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  const category = blog.get('category');
  const author = blog.get('createdBy');
  const authorName = author ? author.get('username') : 'Unknown Author';
  
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
  
  // Calculate read time
  const calculateReadTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };
  
  const readTime = calculateReadTime(content);
  const excerpt = blog.get('excerpt') || content.substring(0, 120) + '...';

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-dark-900/30 z-10"></div>
      <img 
        src={coverImage} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl">
            <span className="inline-block bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {categoryName}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              <Link to={`/blogs/${blog.id}`} className="hover:text-primary-300 transition-colors">
                {title}
              </Link>
            </h2>
            <p className="text-white/80 mb-6 text-lg">
              {excerpt}
            </p>
            <div className="flex items-center text-white/70 mb-6">
              <span className="flex items-center">
                <FiUser className="mr-1" /> {authorName}
              </span>
              <span className="mx-3">•</span>
              <span className="flex items-center">
                <FiClock className="mr-1" /> {readTime}
              </span>
            </div>
            <Link 
              to={`/blogs/${blog.id}`} 
              className="btn bg-primary-500 hover:bg-primary-600 text-white"
            >
              Read Article <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch hero slider blogs (featured + recent)
  const { data: heroBlogs, isLoading: isHeroBlogsLoading } = useQuery({
    queryKey: ['heroBlogs'],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      
      // First get featured blogs
      const featuredQuery = new Parse.Query(BlogPost);
      featuredQuery.equalTo('featured', true);
      featuredQuery.include('createdBy');
      featuredQuery.descending('createdAt');
      featuredQuery.limit(3);
      
      // Then get recent blogs
      const recentQuery = new Parse.Query(BlogPost);
      recentQuery.notEqualTo('featured', true);
      recentQuery.include('createdBy');
      recentQuery.descending('createdAt');
      recentQuery.limit(2);
      
      const [featuredResults, recentResults] = await Promise.all([
        featuredQuery.find(),
        recentQuery.find()
      ]);
      
      // Combine and ensure we have at least 5 blogs for the slider
      const combined = [...featuredResults, ...recentResults];
      return combined.slice(0, 5);
    }
  });

  // Fetch latest blogs
  const { data: latestBlogs, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latestBlogs'],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      query.include('createdBy');
      query.descending('createdAt');
      query.limit(9);
      
      const results = await query.find();
      return results;
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['homeCategories'],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      query.distinct('category');
      const results = await query.find();
      return results.slice(0, 5); // Get top 5 categories
    }
  });

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      // Get total blog count
      const BlogPost = Parse.Object.extend('BlogPost');
      const blogQuery = new Parse.Query(BlogPost);
      const blogCount = await blogQuery.count();
      
      // Get total user count
      const userQuery = new Parse.Query(Parse.User);
      const userCount = await userQuery.count();
      
      // Get total comment count
      const Comment = Parse.Object.extend('Comment');
      const commentQuery = new Parse.Query(Comment);
      const commentCount = await commentQuery.count();
      
      return {
        blogs: blogCount,
        users: userCount,
        comments: commentCount
      };
    }
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/blogs?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    adaptiveHeight: true,
    appendDots: dots => (
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-3 h-3 mx-1 rounded-full bg-white/50 hover:bg-white transition-colors"></div>
    )
  };

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div>
      {/* Hero Slider Section */}
      {!isHeroBlogsLoading && heroBlogs && heroBlogs.length > 0 ? (
        <section className="relative">
          <Slider {...sliderSettings}>
            {heroBlogs.map((blog) => (
              <HeroSliderBlogCard key={blog.id} blog={blog} />
            ))}
          </Slider>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Share Your Stories with the World
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg mb-8"
                >
                  Create, publish, and share your thoughts on our modern blogging platform.
                  Join our community of writers and readers today!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                >
                  <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                    Get Started
                  </Link>
                  <Link to="/blogs" className="btn bg-transparent border border-white hover:bg-white/10">
                    Explore Blogs
                  </Link>
                </motion.div>
              </div>
              <div className="md:w-1/2">
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Blogging"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12 py-4 shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  to={`/blogs?category=${category}`}
                  className="bg-white text-dark-500 px-4 py-1 rounded-full text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      {!isLatestLoading && latestBlogs && latestBlogs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Featured Post</h2>
              <Link
                to="/blogs"
                className="text-primary-600 font-medium flex items-center hover:text-primary-700"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            <FeaturedBlogCard blog={latestBlogs[0]} />
          </div>
        </section>
      )}

      {/* Latest Blogs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Posts</h2>
            <div className="flex items-center space-x-2">
              <span className="text-dark-500">Sort by:</span>
              <select className="border border-gray-300 rounded-md text-dark-600 text-sm py-1 px-2">
                <option>Newest</option>
                <option>Popular</option>
                <option>Trending</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLatestLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Masonry Layout */}
          {!isLatestLoading && latestBlogs && latestBlogs.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {latestBlogs.slice(1).map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </Masonry>
          ) : !isLatestLoading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
              <p className="text-dark-500 mb-6">
                Be the first to create a blog post on our platform!
              </p>
              <Link to="/new-post" className="btn btn-primary">
                Create a Post
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/blogs" className="btn btn-primary">
              Load More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose BlogMe?</h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              Join thousands of content creators who trust our platform for sharing their stories with the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-soft"
            >
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Growing Community</h3>
              <p className="text-dark-500">
                Join our thriving community of {stats?.users || '1,000+'} writers and readers from around the world.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-soft"
            >
              <div className="bg-secondary-100 text-secondary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Setup</h3>
              <p className="text-dark-500">
                Get started in minutes with our easy-to-use platform and intuitive interface.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center p-6 bg-gray-50 rounded-xl shadow-soft"
            >
              <div className="bg-accent-100 text-accent-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiThumbsUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Modern Experience</h3>
              <p className="text-dark-500">
                Enjoy a beautiful, responsive design that looks great on any device.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Blogging?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Create your account today and start sharing your stories with our community.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 