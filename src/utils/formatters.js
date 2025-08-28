// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format date to readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format traffic usage percentage for progress bars
export const formatUsagePercentage = (used, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((used / total) * 100), 100);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Get current month name
export const getCurrentMonthName = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};