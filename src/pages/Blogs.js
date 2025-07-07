import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Parse from '../services/parseConfig';

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
  const categoryName = getCategoryName();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card card-hover h-full flex flex-col"
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
        <div className="flex items-center text-xs text-dark-400 mb-2">
          <span>{authorName}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(createdAt)}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 hover:text-primary-600 transition-colors">
          <Link to={`/blogs/${blog.id}`}>{title}</Link>
        </h3>
        <p className="text-dark-500 mb-4 text-sm">{excerpt}</p>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <div className="flex justify-between items-center">
          <span className="text-xs text-dark-400 flex items-center">
            {readTime}
          </span>
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

const Blogs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'All');
  const [selectedTag, setSelectedTag] = useState(queryParams.get('tag') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const blogsPerPage = 9;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [searchTerm, selectedCategory, selectedTag, sortBy, currentPage, navigate, location.pathname]);

  // Fetch available categories
  const { data: availableCategories = ['All'] } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: async () => {
      try {
        const Category = Parse.Object.extend('Category');
        const query = new Parse.Query(Category);
        query.ascending('name');
        const results = await query.find();
        
        // Map to simple objects with id and name
        const categories = results.map(category => ({
          id: category.id,
          name: category.get('name')
        }));
        
        return ['All', ...categories];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return ['All'];
      }
    }
  });

  // Fetch blog posts
  const { data: blogPosts, isLoading, error } = useQuery({
    queryKey: ['blogs', selectedCategory, selectedTag, sortBy, currentPage, searchTerm],
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Include the author data
      query.include('createdBy');
      
      // Apply category filter
      if (selectedCategory !== 'All') {
        // Find the category object by name
        const Category = Parse.Object.extend('Category');
        const categoryQuery = new Parse.Query(Category);
        categoryQuery.equalTo('name', selectedCategory);
        const categoryObject = await categoryQuery.first();
        
        if (categoryObject) {
          query.equalTo('category', categoryObject);
        }
      }
      
      // Apply tag filter
      if (selectedTag) {
        query.equalTo('tags', selectedTag);
      }
      
      // Apply search filter
      if (searchTerm) {
        const titleQuery = new Parse.Query(BlogPost);
        titleQuery.matches('title', new RegExp(searchTerm, 'i'));
        
        const contentQuery = new Parse.Query(BlogPost);
        contentQuery.matches('content', new RegExp(searchTerm, 'i'));
        
        query._orQuery([titleQuery, contentQuery]);
      }
      
      // Apply sorting
      if (sortBy === 'newest') {
        query.descending('createdAt');
      } else if (sortBy === 'oldest') {
        query.ascending('createdAt');
      }
      
      // Apply pagination
      const skip = (currentPage - 1) * blogsPerPage;
      query.skip(skip);
      query.limit(blogsPerPage);
      
      // Execute query
      const results = await query.find();
      
      // Get total count for pagination
      const countQuery = new Parse.Query(BlogPost);
      
      // Apply same filters to count query
      if (selectedCategory !== 'All') {
        // Find the category object by name
        const Category = Parse.Object.extend('Category');
        const categoryQuery = new Parse.Query(Category);
        categoryQuery.equalTo('name', selectedCategory);
        const categoryObject = await categoryQuery.first();
        
        if (categoryObject) {
          countQuery.equalTo('category', categoryObject);
        }
      }
      
      if (selectedTag) {
        countQuery.equalTo('tags', selectedTag);
      }
      
      if (searchTerm) {
        const titleCountQuery = new Parse.Query(BlogPost);
        titleCountQuery.matches('title', new RegExp(searchTerm, 'i'));
        
        const contentCountQuery = new Parse.Query(BlogPost);
        contentCountQuery.matches('content', new RegExp(searchTerm, 'i'));
        
        countQuery._orQuery([titleCountQuery, contentCountQuery]);
      }
      
      const count = await countQuery.count();
      
      return {
        blogs: results,
        totalCount: count,
        totalPages: Math.ceil(count / blogsPerPage)
      };
    }
  });

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedTag(''); // Clear tag filter when changing category
    setCurrentPage(1); // Reset to first page
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedTag('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Generate pagination items
  const generatePaginationItems = (totalPages) => {
    const items = [];
    
    // Previous page button
    items.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'border border-gray-300 text-dark-500 hover:bg-gray-100'
        }`}
      >
        &lt;
      </button>
    );
    
    // Page numbers
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      items.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-dark-500 hover:bg-gray-100"
        >
          1
        </button>
      );
      
      // Ellipsis if needed
      if (startPage > 2) {
        items.push(
          <span key="ellipsis1" className="text-dark-500">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            i === currentPage
              ? 'bg-primary-500 text-white'
              : 'border border-gray-300 text-dark-500 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <span key="ellipsis2" className="text-dark-500">...</span>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      items.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-dark-500 hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next page button
    items.push(
      <button
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'border border-gray-300 text-dark-500 hover:bg-gray-100'
        }`}
      >
        &gt;
      </button>
    );
    
    return items;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Blogs</h1>
          <p className="text-lg max-w-2xl">
            Discover insightful articles, tutorials, and stories from our community of writers.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white py-6 shadow-sm sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 py-2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md text-dark-600 text-sm py-2 px-3"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden flex items-center text-dark-600 border border-gray-300 rounded-md py-2 px-3"
              >
                <FiFilter className="mr-2" /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-t border-gray-200 py-4 md:hidden"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-dark-400"
              >
                <FiX />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-600 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md text-dark-600 text-sm py-2 px-3"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(typeof category === 'object' ? category.name : category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === (typeof category === 'object' ? category.name : category)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                    }`}
                  >
                    {typeof category === 'object' ? category.name : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Desktop Category Filters */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(typeof category === 'object' ? category.name : category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === (typeof category === 'object' ? category.name : category)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
              }`}
            >
              {typeof category === 'object' ? category.name : category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          {isLoading ? (
            <p className="text-dark-500">Loading blogs...</p>
          ) : error ? (
            <p className="text-red-500">Error loading blogs. Please try again.</p>
          ) : (
            <p className="text-dark-500">
              Showing <span className="font-semibold">{blogPosts?.blogs.length || 0}</span> of <span className="font-semibold">{blogPosts?.totalCount || 0}</span> results
              {selectedCategory !== 'All' && (
                <> in <span className="font-semibold">{selectedCategory}</span></>
              )}
              {selectedTag && (
                <> tagged with <span className="font-semibold">"{selectedTag}"</span></>
              )}
              {searchTerm && (
                <> for "<span className="font-semibold">{searchTerm}</span>"</>
              )}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading blogs</h3>
            <p className="text-dark-500 mb-6">
              Something went wrong. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && !error && blogPosts && (
          <>
            {blogPosts.blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
                <p className="text-dark-500 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {blogPosts.blogs.length > 0 && blogPosts.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  {generatePaginationItems(blogPosts.totalPages)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blogs; 