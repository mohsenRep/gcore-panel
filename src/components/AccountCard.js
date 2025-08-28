'use client';

import Link from 'next/link';
import { formatBytes, formatUsagePercentage } from '../utils/formatters';

export default function AccountCard({ account, isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 animate-pulse hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-2 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            <div className="h-6 bg-gray-200 rounded w-14"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 hover:bg-red-100 transition-all duration-300 rounded-lg shadow-sm p-3 border border-red-200">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate" title={account.name}>
                {account.name}
              </h3>
              <p className="text-xs text-red-600 truncate" title={error}>
                {error}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-16 bg-gray-200 rounded-full h-2"></div>

            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
              <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500"></div>
              Error
            </div>

            <Link
              href="/manage-keys"
              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors font-medium"
            >
              Fix
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = formatUsagePercentage(account.trafficUsed, account.trafficLimit);
  const domain = account.accountInfo.origins[0].name.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)[1];
  const source = account.accountInfo.origins[0].sources[0].source.split(':')[0];

  return (
    <div className="bg-white hover:bg-gray-50 transition-all duration-300 rounded-lg shadow-sm p-3 m-2 border border-gray-100 group">
      <div className="flex items-center justify-between space-x-4">
        {/* Account Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${account.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
            <div className={`w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate" title={account.name}>
              {account.name}
            </h3>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-600 truncate" title={domain}>
              {domain}
            </h3>

          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-600 truncate" title={source}>
              {source}
            </h3>

          </div>
        </div>

        {/* Usage & Actions */}
        <div className="flex items-center space-x-4">
          {/* Usage */}

          <div className="text-right min-w-0">
            <div className="text-xs font-medium text-gray-900">
              {formatBytes(account.trafficUsed || 0)}
            </div>
            <div className="text-xs text-gray-500">
              of {formatBytes(account.trafficLimit || 0)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-16">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-red-500' :
                    usagePercentage > 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                  }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Usage Percentage */}
          <div className="text-xs font-medium text-gray-900 min-w-8 text-right">
            {usagePercentage}%
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href={`/account/${account.id}`}
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium"
            >
              View
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium"
              title="Refresh"
            >
              <svg className="w-3 h-3 hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}