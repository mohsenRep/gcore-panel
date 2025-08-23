'use client';

import { useState } from 'react';
import { GCoreAPI } from '../lib/gcore-api';

export default function ApiKeyForm({ onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    apiKey: initialData?.apiKey || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationResult(null);
  };

  const validateApiKey = async () => {
    if (!formData.apiKey.trim()) {
      setValidationResult({ success: false, error: 'API key is required' });
      return;
    }

    setIsValidating(true);
    try {
      const api = new GCoreAPI(formData.apiKey.trim());
      const result = await api.testConnection();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ success: false, error: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.apiKey.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate API key before saving
      const api = new GCoreAPI(formData.apiKey.trim());
      const validation = await api.testConnection();
      
      if (!validation.success) {
        setValidationResult(validation);
        setIsSubmitting(false);
        return;
      }

      onSave({
        name: formData.name.trim(),
        apiKey: formData.apiKey.trim()
      });
    } catch (error) {
      setValidationResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit API Key' : 'Add New API Key'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Account Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Production Account"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* API Key */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <div className="space-y-2">
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Enter your GCore API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={validateApiKey}
              disabled={!formData.apiKey.trim() || isValidating}
              className="text-sm text-primary-600 hover:text-primary-700 underline disabled:text-gray-400 disabled:no-underline"
            >
              {isValidating ? 'Validating...' : 'Test API Key'}
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-3 rounded-md ${
            validationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={validationResult.success ? 'text-green-600' : 'text-red-600'}>
                {validationResult.success ? '✅' : '❌'}
              </span>
              <span className={`text-sm ${
                validationResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {validationResult.success 
                  ? 'API key is valid!' 
                  : `Validation failed: ${validationResult.error}`
                }
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.apiKey.trim()}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}