const STORAGE_KEY = 'gcore_api_keys';

export const storageUtils = {
  // Get all API keys from localStorage
  getApiKeys: () => {
    if (typeof window === 'undefined') return [];
    try {
      const keys = localStorage.getItem(STORAGE_KEY);
      return keys ? JSON.parse(keys) : [];
    } catch (error) {
      console.error('Error reading API keys from localStorage:', error);
      return [];
    }
  },

  // Save API keys to localStorage
  saveApiKeys: (keys) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Error saving API keys to localStorage:', error);
    }
  },

  // Add a new API key
  addApiKey: (keyData) => {
    const keys = storageUtils.getApiKeys();
    const newKey = {
      id: Date.now().toString(),
      name: keyData.name,
      apiKey: keyData.apiKey,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    keys.push(newKey);
    storageUtils.saveApiKeys(keys);
    return newKey;
  },

  // Update an existing API key
  updateApiKey: (id, updates) => {
    const keys = storageUtils.getApiKeys();
    const index = keys.findIndex(key => key.id === id);
    if (index !== -1) {
      keys[index] = { ...keys[index], ...updates };
      storageUtils.saveApiKeys(keys);
      return keys[index];
    }
    return null;
  },

  // Delete an API key
  deleteApiKey: (id) => {
    const keys = storageUtils.getApiKeys();
    const filtered = keys.filter(key => key.id !== id);
    storageUtils.saveApiKeys(filtered);
  },

  // Get a specific API key by ID
  getApiKey: (id) => {
    const keys = storageUtils.getApiKeys();
    return keys.find(key => key.id === id) || null;
  }
};