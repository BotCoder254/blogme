/**
 * Sanitizes a filename to remove invalid characters
 * @param {string} filename - The original filename
 * @returns {string} - The sanitized filename
 */
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Creates a new File object with a sanitized filename
 * @param {File} file - The original file
 * @returns {File} - A new File object with a sanitized filename
 */
export const createSanitizedFile = (file) => {
  const sanitizedFileName = sanitizeFilename(file.name);
  return new File([file], sanitizedFileName, { type: file.type });
};

/**
 * Validates if a file is an allowed image type
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is a valid image
 */
export const isValidImage = (file) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validImageTypes.includes(file.type);
};

/**
 * Validates if a file is an allowed video type
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is a valid video
 */
export const isValidVideo = (file) => {
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  return validVideoTypes.includes(file.type);
};

/**
 * Validates if a file is within the size limit
 * @param {File} file - The file to validate
 * @param {number} maxSizeInBytes - The maximum file size in bytes
 * @returns {boolean} - Whether the file is within the size limit
 */
export const isValidFileSize = (file, maxSizeInBytes) => {
  return file.size <= maxSizeInBytes;
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - The file size in bytes
 * @returns {string} - The formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
}; 