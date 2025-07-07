import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiBarChart2, FiUsers, FiMessageSquare, FiHeart, FiLoader, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parseConfig';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  
  // Fetch user's blogs
  const { data: userBlogs, isLoading, error } = useQuery({
    queryKey: ['userBlogs', currentUser?.id],
    enabled: !!currentUser,
    queryFn: async () => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      
      // Get blogs created by the current user
      query.equalTo('createdBy', currentUser);
      query.descending('createdAt');
      query.include('category');
      
      const results = await query.find();
      return results;
    }
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats', currentUser?.id],
    enabled: !!currentUser,
    queryFn: async () => {
      // Get total views, likes, comments
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      query.equalTo('createdBy', currentUser);
      
      const blogs = await query.find();
      
      // Calculate stats
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      
      for (const blog of blogs) {
        totalViews += blog.get('views') || 0;
        totalLikes += blog.get('likes') || 0;
        totalComments += blog.get('comments') || 0;
      }
      
      // Get follower count
      const Follower = Parse.Object.extend('Follower');
      const followerQuery = new Parse.Query(Follower);
      followerQuery.equalTo('following', currentUser);
      const followerCount = await followerQuery.count();
      
      return {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        followers: followerCount
      };
    }
  });

  // Fetch engagement trend data
  const { data: engagementTrend } = useQuery({
    queryKey: ['engagementTrend', currentUser?.id, timeRange],
    enabled: !!currentUser,
    queryFn: async () => {
      // In a real app, you would fetch this data from the server
      // For now, we'll generate some sample data
      
      // Generate dates for the selected time range
      const dates = [];
      const today = new Date();
      let daysToGenerate = 7;
      
      if (timeRange === 'month') {
        daysToGenerate = 30;
      } else if (timeRange === 'year') {
        daysToGenerate = 12; // For year, we'll do months instead of days
      }
      
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        if (timeRange === 'year') {
          // For year, generate months
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          dates.push(date.toLocaleDateString('en-US', { month: 'short' }));
        } else {
          // For week and month, generate days
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
      }
      
      // Generate random data for views, likes, comments
      return dates.map(date => {
        const viewsBase = Math.floor(Math.random() * 50) + 10;
        return {
          date,
          views: viewsBase,
          likes: Math.floor(viewsBase * 0.4),
          comments: Math.floor(viewsBase * 0.2)
        };
      });
    }
  });

  // Generate category distribution data
  const categoryData = React.useMemo(() => {
    if (!userBlogs) return [];
    
    const categories = {};
    userBlogs.forEach(blog => {
      const category = blog.get('category') || 'Uncategorized';
      if (categories[category]) {
        categories[category]++;
      } else {
        categories[category] = 1;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [userBlogs]);

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId) => {
      const BlogPost = Parse.Object.extend('BlogPost');
      const query = new Parse.Query(BlogPost);
      const blog = await query.get(blogId);
      
      // Check if the current user is the author
      const author = blog.get('createdBy');
      if (author.id !== currentUser.id) {
        throw new Error('You can only delete your own posts');
      }
      
      await blog.destroy();
      return blogId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['userBlogs']);
      queryClient.invalidateQueries(['userStats']);
      queryClient.invalidateQueries(['engagementTrend']);
    }
  });

  // Handle blog deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deleteBlogMutation.mutate(id);
    }
  };

  // Filter blogs based on active tab
  const filteredBlogs = userBlogs?.filter(blog => {
    if (activeTab === 'all') return true;
    const status = blog.get('status') || 'draft';
    if (activeTab === 'published') return status === 'published';
    if (activeTab === 'drafts') return status === 'draft';
    return true;
  }) || [];

  // Calculate stats
  const publishedCount = userBlogs?.filter(blog => blog.get('status') === 'published').length || 0;
  const draftCount = userBlogs?.filter(blog => blog.get('status') !== 'published').length || 0;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate recent performance
  const recentPerformance = React.useMemo(() => {
    if (!engagementTrend || engagementTrend.length < 2) return { views: 0, likes: 0, comments: 0 };
    
    const latest = engagementTrend[engagementTrend.length - 1];
    const previous = engagementTrend[engagementTrend.length - 2];
    
    return {
      views: latest.views - previous.views,
      likes: latest.likes - previous.likes,
      comments: latest.comments - previous.comments
    };
  }, [engagementTrend]);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" />
          <p className="text-dark-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft p-6 text-center">
            <h2 className="text-2xl font-bold text-dark-700 mb-4">Error</h2>
            <p className="text-dark-500 mb-6">Failed to load dashboard data. Please try again.</p>
            <Button
              variant="primary"
              onClick={() => queryClient.invalidateQueries(['userBlogs'])}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-700 mb-2">
            Welcome back, {currentUser ? currentUser.get('username') : 'User'}
          </h1>
          <p className="text-dark-500">
            Manage your blog posts and see how they're performing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-600">Total Views</h3>
              <div className="bg-primary-100 text-primary-600 p-2 rounded-lg">
                <FiEye className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-700">{userStats?.views.toLocaleString() || 0}</p>
            <div className="flex items-center mt-2">
              {recentPerformance.views > 0 ? (
                <>
                  <FiTrendingUp className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{recentPerformance.views}</span>
                </>
              ) : recentPerformance.views < 0 ? (
                <>
                  <FiTrendingDown className="text-red-500 mr-1" />
                  <span className="text-sm text-red-500">{recentPerformance.views}</span>
                </>
              ) : (
                <span className="text-sm text-dark-400">No change</span>
              )}
              <span className="text-xs text-dark-400 ml-1">since yesterday</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-600">Total Likes</h3>
              <div className="bg-secondary-100 text-secondary-600 p-2 rounded-lg">
                <FiHeart className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-700">{userStats?.likes.toLocaleString() || 0}</p>
            <div className="flex items-center mt-2">
              {recentPerformance.likes > 0 ? (
                <>
                  <FiTrendingUp className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{recentPerformance.likes}</span>
                </>
              ) : recentPerformance.likes < 0 ? (
                <>
                  <FiTrendingDown className="text-red-500 mr-1" />
                  <span className="text-sm text-red-500">{recentPerformance.likes}</span>
                </>
              ) : (
                <span className="text-sm text-dark-400">No change</span>
              )}
              <span className="text-xs text-dark-400 ml-1">since yesterday</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-600">Comments</h3>
              <div className="bg-accent-100 text-accent-600 p-2 rounded-lg">
                <FiMessageSquare className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-700">{userStats?.comments.toLocaleString() || 0}</p>
            <div className="flex items-center mt-2">
              {recentPerformance.comments > 0 ? (
                <>
                  <FiTrendingUp className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{recentPerformance.comments}</span>
                </>
              ) : recentPerformance.comments < 0 ? (
                <>
                  <FiTrendingDown className="text-red-500 mr-1" />
                  <span className="text-sm text-red-500">{recentPerformance.comments}</span>
                </>
              ) : (
                <span className="text-sm text-dark-400">No change</span>
              )}
              <span className="text-xs text-dark-400 ml-1">since yesterday</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-600">Followers</h3>
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <FiUsers className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-700">{userStats?.followers.toLocaleString() || 0}</p>
            <p className="text-sm text-dark-500 mt-2">People following your work</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Engagement Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-600">Engagement Trend</h3>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button 
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timeRange === 'week' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timeRange === 'month' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timeRange === 'year' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            
            <div className="h-72">
              {engagementTrend && engagementTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={engagementTrend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FFBB28" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#0088FE" 
                      fillOpacity={1}
                      fill="url(#colorViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="likes" 
                      stroke="#00C49F" 
                      fillOpacity={1}
                      fill="url(#colorLikes)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="comments" 
                      stroke="#FFBB28" 
                      fillOpacity={1}
                      fill="url(#colorComments)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-400">No engagement data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-dark-600 mb-6">Content Categories</h3>
            <div className="h-72">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} posts`, props.payload.name]}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-dark-400">No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Management Section */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold text-dark-700 mb-4 sm:mb-0">Your Blog Posts</h2>
            <Link to="/new-post" className="btn btn-primary flex items-center">
              <FiPlus className="mr-2" /> New Post
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Posts ({userBlogs?.length || 0})
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'published'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
              onClick={() => setActiveTab('published')}
            >
              Published ({publishedCount})
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'drafts'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
              onClick={() => setActiveTab('drafts')}
            >
              Drafts ({draftCount})
            </button>
          </div>

          {/* Blog List */}
          <div className="overflow-x-auto">
            {filteredBlogs.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-dark-500 text-sm">
                    <th className="pb-3 pl-4">Title</th>
                    <th className="pb-3 hidden md:table-cell">Date</th>
                    <th className="pb-3 hidden md:table-cell">Status</th>
                    <th className="pb-3 hidden md:table-cell">Views</th>
                    <th className="pb-3 hidden md:table-cell">Engagement</th>
                    <th className="pb-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 pl-4">
                        <div className="flex items-center">
                          {blog.get('coverImage') ? (
                            <img
                              src={blog.get('coverImage').url()}
                              alt={blog.get('title')}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                              <FiBarChart2 className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-dark-700">{blog.get('title')}</h4>
                            <p className="text-xs text-dark-500 truncate max-w-xs">
                              {blog.get('excerpt') || blog.get('content').substring(0, 100) + '...'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 hidden md:table-cell">{formatDate(blog.get('createdAt'))}</td>
                      <td className="py-4 hidden md:table-cell">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            blog.get('status') === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {blog.get('status') || 'draft'}
                        </span>
                      </td>
                      <td className="py-4 hidden md:table-cell">{(blog.get('views') || 0).toLocaleString()}</td>
                      <td className="py-4 hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-xs">
                            <FiHeart className="text-red-500 mr-1" /> {blog.get('likes') || 0}
                          </span>
                          <span className="flex items-center text-xs">
                            <FiMessageSquare className="text-blue-500 mr-1" /> {blog.get('comments') || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/blogs/${blog.id}`}
                            className="p-2 text-dark-500 hover:text-primary-600 transition-colors"
                            title="View"
                          >
                            <FiEye />
                          </Link>
                          <Link
                            to={`/edit-post/${blog.id}`}
                            className="p-2 text-dark-500 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <FiEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 text-dark-500 hover:text-red-600 transition-colors"
                            title="Delete"
                            disabled={deleteBlogMutation.isLoading}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-dark-600 mb-2">No posts found</h3>
                <p className="text-dark-500 mb-6">
                  {activeTab === 'all'
                    ? "You haven't created any posts yet."
                    : activeTab === 'published'
                    ? "You don't have any published posts."
                    : "You don't have any draft posts."}
                </p>
                <Link to="/new-post" className="btn btn-primary">
                  Create Your First Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 