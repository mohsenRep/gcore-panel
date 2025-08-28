'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AccountCard from '../components/AccountCard';
import { storageUtils } from '../lib/storage';
import { GCoreAPI } from '../lib/gcore-api';
import { formatBytes, getCurrentMonthName } from '../utils/formatters';

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = async () => {
    const apiKeys = storageUtils.getApiKeys();

    if (apiKeys.length === 0) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    const accountPromises = apiKeys.map(async (keyData) => {
      try {
        const api = new GCoreAPI(keyData.apiKey);
        const [accountInfo, trafficInfo] = await Promise.all([
          api.getAccountInfo(),
          api.getMonthlyTraffic()
        ]);

        return {
          id: keyData.id,
          name: accountInfo.account[0].email,
          status: 'active',
          trafficUsed: trafficInfo.used || 0,
          trafficLimit: trafficInfo.limit || 0,
          accountInfo: accountInfo,
          error: null
        };
      } catch (error) {
        return {
          id: keyData.id,
          name: keyData.name,
          status: 'error',
          trafficUsed: 0,
          trafficLimit: 0,
          accountInfo: null,
          error: error.message
        };
      }
    });

    const accountsData = await Promise.all(accountPromises);
    const sortedDesc = [...accountsData].sort((a, b) => b.trafficUsed - a.trafficUsed);
    setAccounts(sortedDesc);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Traffic usage for {getCurrentMonthName()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <AccountCard key={i} account={{}} isLoading={true} />
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔑</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No API Keys Found</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven&apos;t added any GCore API keys yet. Add your first API key to start monitoring your accounts.
        </p>
        <Link
          href="/manage-keys"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-200"
        >
          Add API Key
        </Link>
      </div>
    );
  }

  const totalTrafficUsed = accounts.reduce((sum, acc) => sum + (acc.trafficUsed || 0), 0);
  const totalTrafficLimit = accounts.reduce((sum, acc) => sum + (acc.trafficLimit || 0), 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const errorAccounts = accounts.filter(acc => acc.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Traffic usage for {getCurrentMonthName()}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
          >
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
          <Link
            href="/manage-keys"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Manage Keys
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">{errorAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usage %</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(totalTrafficUsed)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              error={account.error}
            />
          ))}
        </div>
      </div>
    </div>
  );
}