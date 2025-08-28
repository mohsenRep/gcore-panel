'use client';

import Link from 'next/link';
import { formatBytes, formatUsagePercentage } from '../utils/formatters';

export default function AccountCard({ account, isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600">❌</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-red-600 mt-1">Error loading data: {error}</p>
            <Link
              href="/manage-keys"
              className="text-sm text-primary-600 hover:text-primary-700 underline mt-2 inline-block"
            >
              Check API key
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = formatUsagePercentage(account.trafficUsed, account.trafficLimit);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Account Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-between space-x-3">
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-500">{account.accountInfo.origins[0].name.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)[1]}</h3>
            </div>

          </div>

          <div className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {account.status || 'Unknown'}
          </div>
        </div>
        <div className="flex  flex-col items-center justify-between mb-4">
          <div className="flex flex-col  items-center space-x-3">
            <div className="flex flex-col items-center space-x-2">
              <h3 className="text-lg font-semibold text-blue-500">{account.accountInfo.origins[0].sources[0].source.split(':')[0]}</h3>

            </div>
          </div>
        </div>
        {/* Traffic Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Traffic Usage</span>
            <span className="text-sm text-gray-500">{usagePercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${usagePercentage > 90 ? 'bg-red-500' :
                usagePercentage > 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>

          {/* Usage Stats */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatBytes(account.trafficUsed || 0)}</span>
            <span>{formatBytes(account.trafficLimit || 0)} limit</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <Link
            href={`/account/${account.id}`}
            className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
          >
            View Details
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}