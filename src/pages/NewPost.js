import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiImage, FiX, FiTag, FiPlus, FiVideo, FiFile, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parseConfig';
import { useMutation, useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import { toast } from 'react-hot-toast';
import QuillEditor from '../components/editor/QuillEditor';
import createTestCategories from '../utils/createTestCategories';

const NewPost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    excerpt: '',
  });
  
  const [errors, setErrors] = useState({});
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUploads, setMediaUploads] = useState({});
  
  // Ensure categories exist
  useEffect(() => {
    const ensureCategories = async () => {
      try {
        await createTestCategories();
      } catch (error) {
        console.error("Error ensuring categories exist:", error);
      }
    };
    
    ensureCategories();
  }, []);
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const Category = Parse.Object.extend('Category');
      const query = new Parse.Query(Category);
      query.ascending('name');
      query.limit(100); // Ensure we get all categories
      const results = await query.find();
      console.log('Categories fetched:', results.length);
      return results.map(category => ({
        id: category.id,
        name: category.get('name')
      }));
    },
    staleTime: 300000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please refresh the page.");
    }
  });

  // Log categories for debugging
  useEffect(() => {
    console.log("Categories loaded:", categories);
    if (categories.length === 0 && !isLoadingCategories) {
      // If no categories loaded, try to refetch
      refetchCategories();
    }
  }, [categories, isLoadingCategories, refetchCategories]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle rich text editor changes
  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
    
    // Clear error when user starts typing
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: '' }));
    }
  };

  // Handle image drop for cover image
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size
      if (file.size > 5242880) { // 5MB
        setErrors((prev) => ({ 
          ...prev, 
          coverImage: 'Image size should be less than 5MB' 
        }));
        return;
      }
      
      // Sanitize filename to remove invalid characters
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileWithSanitizedName = new File([file], sanitizedFileName, { type: file.type });
      
      setCoverImage(fileWithSanitizedName);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if exists
      if (errors.coverImage) {
        setErrors((prev) => ({ ...prev, coverImage: '' }));
      }
    }
  }, [errors]);

  // Configure dropzone for cover image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });
  
  // Handle media file upload for content
  const handleMediaUpload = async (file) => {
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      toast.error('Only images (JPG, PNG, GIF, WEBP) and videos (MP4, WEBM, OGG) are allowed');
      return;
    }
    
    // Validate file size
    const maxSize = 20971520; // 20MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 20MB');
      return;
    }
    
    // Create unique ID for tracking this upload
    const uploadId = Date.now().toString();
    
    // Sanitize filename to remove invalid characters
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileWithSanitizedName = new File([file], sanitizedFileName, { type: file.type });
    
    // Add to media files with pending status
    setMediaFiles(prev => [
      ...prev, 
      { 
        id: uploadId, 
        file: fileWithSanitizedName,
        name: sanitizedFileName, 
        type: file.type, 
        status: 'pending',
        url: URL.createObjectURL(file)
      }
    ]);
    
    // Initialize progress tracking
    setMediaUploads(prev => ({
      ...prev,
      [uploadId]: { progress: 0 }
    }));
    
    try {
      // Create Parse file with sanitized name
      const parseFile = new Parse.File(sanitizedFileName, fileWithSanitizedName);
      
      // Upload with progress tracking
      await parseFile.save({
        progress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMediaUploads(prev => ({
            ...prev,
            [uploadId]: { progress: percentCompleted }
          }));
        },
      });
      
      // Update media file status and URL
      setMediaFiles(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { 
                ...item, 
                status: 'complete', 
                parseFile,
                parseUrl: parseFile.url()
              } 
            : item
        )
      );
      
      // Insert into editor
      const isImage = validImageTypes.includes(file.type);
      const insertText = isImage 
        ? `![${sanitizedFileName}](${parseFile.url()})`
        : `<video controls width="100%"><source src="${parseFile.url()}" type="${file.type}"></video>`;
        
      // Append to content
      setFormData(prev => ({
        ...prev,
        content: prev.content + (prev.content ? '\n\n' : '') + insertText
      }));
      
      toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
    } catch (error) {
      // Update status to error
      setMediaFiles(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'error' } 
            : item
        )
      );
      
      toast.error(`Failed to upload file: ${error.message}`);
    }
  };
  
  // Handle file input change for media uploads
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleMediaUpload(files[0]);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle adding tags
  const handleAddTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setCurrentTag('');
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle key press for adding tags
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Generate excerpt from content
  const generateExcerpt = () => {
    // Strip HTML tags and get plain text
    const plainText = formData.content.replace(/<[^>]+>/g, '');
    // Limit to 150 characters
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    
    setFormData(prev => ({
      ...prev,
      excerpt
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create blog post mutation
  const createBlogMutation = useMutation({
    mutationFn: async (blogData) => {
      setIsUploading(true);
      
      // Create a new instance of the BlogPost class
      const BlogPost = Parse.Object.extend('BlogPost');
      const blogPost = new BlogPost();
      
      // Set the blog post properties
      blogPost.set('title', blogData.title);
      blogPost.set('content', blogData.content);
      blogPost.set('tags', blogData.tags);
      blogPost.set('excerpt', blogData.excerpt || '');
      blogPost.set('author', Parse.User.current());
      blogPost.set('likes', 0);
      blogPost.set('views', 0);
      blogPost.set('comments', 0);
      blogPost.set('bookmarks', 0);
      
      // Set category as pointer
      if (blogData.category) {
        const Category = Parse.Object.extend('Category');
        const category = new Category();
        category.id = blogData.category;
        blogPost.set('category', category);
      }
      
      // Upload the cover image if exists
      if (blogData.coverImage) {
        // Sanitize filename to remove invalid characters
        const originalName = blogData.coverImage.name;
        const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileWithSanitizedName = new File([blogData.coverImage], sanitizedFileName, { type: blogData.coverImage.type });
        
        const parseFile = new Parse.File(sanitizedFileName, fileWithSanitizedName);
        
        // Upload the file with progress tracking
        await parseFile.save({
          progress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });
        
        blogPost.set('coverImage', parseFile);
      }
      
      // Save the blog post
      return await blogPost.save();
    },
    onSuccess: (data) => {
      // Show success message
      toast.success('Blog post created successfully!');
      
      // Navigate to the blog post page
      navigate(`/blog/${data.id}`);
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || 'Failed to create blog post');
      setErrors({
        general: error.message || 'Failed to create blog post. Please try again.',
      });
    },
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    // Generate excerpt if not provided
    if (!formData.excerpt) {
      generateExcerpt();
    }
    
    await createBlogMutation.mutate({
      ...formData,
      coverImage,
    });
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All your changes will be lost.')) {
      navigate('/dashboard');
    }
  };
  
  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-700 mb-2">Create New Blog Post</h1>
            <p className="text-dark-500">Share your knowledge and insights with the world</p>
          </div>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
            >
              {errors.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
            {/* Title */}
            <FormInput
              id="title"
              label="Title"
              type="text"
              placeholder="Enter your blog post title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-dark-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.category 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-primary-200 focus:border-primary-400'
                }`}
                required
              >
                <option value="">Select a category</option>
                {isLoadingCategories ? (
                  <option value="" disabled>Loading categories...</option>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
              {categories.length === 0 && !isLoadingCategories && (
                <button 
                  type="button" 
                  onClick={() => refetchCategories()}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  Refresh categories
                </button>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-600 mb-1">
                Cover Image <span className="text-red-500">*</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                } ${errors.coverImage ? 'border-red-500' : ''}`}
              >
                <input {...getInputProps()} />
                
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="mx-auto max-h-64 rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage(null);
                        setCoverImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-dark-500">
                      {isDragActive
                        ? 'Drop the image here'
                        : 'Drag & drop a cover image, or click to select'}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {errors.coverImage && (
                <p className="mt-1 text-sm text-red-500">{errors.coverImage}</p>
              )}
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-600 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              
              <div className="mb-4">
                <div className="flex space-x-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <FiImage className="mr-1" /> Add Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <FiVideo className="mr-1" /> Add Video
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                    className="hidden"
                  />
                </div>
                
                {/* Media uploads progress */}
                {mediaFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {mediaFiles.map(file => (
                      <div key={file.id} className="flex items-center space-x-2 text-sm">
                        <span className="flex-shrink-0">
                          {file.status === 'complete' ? (
                            <FiCheck className="text-green-500" />
                          ) : file.status === 'error' ? (
                            <FiX className="text-red-500" />
                          ) : (
                            <FiFile className="text-gray-500" />
                          )}
                        </span>
                        <span className="truncate flex-grow">{file.name}</span>
                        {file.status === 'pending' && mediaUploads[file.id] && (
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${mediaUploads[file.id].progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <QuillEditor
                  value={formData.content}
                  onChange={handleEditorChange}
                  className={`${errors.content ? 'border-red-500' : ''}`}
                  placeholder="Write your blog post content here..."
                  modules={modules}
                  formats={formats}
                />
              </div>
              
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-600 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-primary-600 text-white px-3 py-2 rounded-r-lg hover:bg-primary-700"
                >
                  <FiPlus />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add relevant tags to help readers find your post
              </p>
            </div>
            
            {/* Excerpt (optional) */}
            <div className="mb-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-dark-600 mb-1">
                Excerpt (optional)
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Write a short excerpt for your post or leave blank to generate automatically"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none"
              ></textarea>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={generateExcerpt}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Generate from content
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              
              <div className="flex items-center space-x-4">
                {isUploading && (
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUploading}
                  isLoading={createBlogMutation.isLoading}
                >
                  Publish Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPost; 