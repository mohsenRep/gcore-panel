'use client';

import { useState, useEffect } from 'react';
import { storageUtils } from '../../lib/storage';
import ApiKeyForm from '../../components/ApiKeyForm';
import { formatDate } from '../../utils/formatters';

export default function ManageKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    const keys = storageUtils.getApiKeys();
    setApiKeys(keys);
  };

  const handleSaveKey = (keyData) => {
    if (editingKey) {
      storageUtils.updateApiKey(editingKey.id, keyData);
    } else {
      storageUtils.addApiKey(keyData);
    }
    
    loadApiKeys();
    setShowForm(false);
    setEditingKey(null);
  };

  const handleEditKey = (key) => {
    setEditingKey(key);
    setShowForm(true);
  };

  const handleDeleteKey = (id) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      storageUtils.deleteApiKey(id);
      loadApiKeys();
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingKey(null);
  };

  const toggleKeyStatus = (id) => {
    const key = apiKeys.find(k => k.id === id);
    if (key) {
      storageUtils.updateApiKey(id, { isActive: !key.isActive });
      loadApiKeys();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys Management</h1>
          <p className="text-gray-600 mt-1">Manage your GCore API keys</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Add API Key
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <ApiKeyForm
          onSave={handleSaveKey}
          onCancel={handleCancelForm}
          initialData={editingKey}
        />
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No API Keys</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven&apos;t added any API keys yet. Add your first API key to start monitoring your GCore accounts.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Add Your First API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleKeyStatus(key.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      key.isActive ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        key.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Key Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          key.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-500">
                        API Key: {key.apiKey.substring(0, 16)}...{key.apiKey.substring(key.apiKey.length - 4)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Added: {formatDate(key.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditKey(key)}
                    className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {apiKeys.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                💡 Tips for managing API keys
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use descriptive names to identify your accounts easily</li>
                  <li>Disable keys temporarily instead of deleting if you&apos;re troubleshooting</li>
                  <li>Regularly test your API keys to ensure they&apos;re still valid</li>
                  <li>Keep your API keys secure and don&apos;t share them</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}