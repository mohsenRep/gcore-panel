'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storageUtils } from '../../../lib/storage';
import { GCoreAPI } from '../../../lib/gcore-api';
import { formatBytes, formatDate, formatUsagePercentage } from '../../../utils/formatters';

export default function AccountDetail() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccountDetail = async () => {
    try {
      const apiKey = storageUtils.getApiKey(params.id);
      
      if (!apiKey) {
        setError('API key not found');
        setLoading(false);
        return;
      }

      const api = new GCoreAPI(apiKey.apiKey);
      
      const [accountInfo, monthlyTraffic, detailedTraffic] = await Promise.all([
        api.getAccountInfo(),
        api.getMonthlyTraffic(),
        api.getDetailedTraffic(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ).catch(() => null) // Optional detailed traffic
      ]);

      setAccount({
        ...apiKey,
        accountInfo,
        monthlyTraffic,
        detailedTraffic,
        trafficUsed: monthlyTraffic.used || 0,
        trafficLimit: monthlyTraffic.limit || 0
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadAccountDetail();
    }
  }, [params.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    loadAccountDetail();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">❌</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Account</h2>
        <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
        <div className="space-x-4">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const usagePercentage = formatUsagePercentage(account.trafficUsed, account.trafficLimit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-gray-600 mt-1">Account details and traffic analysis</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Traffic Usage Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Traffic Usage</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Current Usage</span>
                <span className="text-sm text-gray-500">{usagePercentage}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    usagePercentage > 90 ? 'bg-red-500' : 
                    usagePercentage > 75 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{formatBytes(account.trafficUsed)}</p>
                  <p className="text-sm text-gray-600">Used This Month</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{formatBytes(account.trafficLimit)}</p>
                  <p className="text-sm text-gray-600">Monthly Limit</p>
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{formatBytes(account.trafficLimit - account.trafficUsed)}</p>
                <p className="text-sm text-blue-600">Remaining This Month</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Account Name</label>
                <p className="text-gray-900 font-medium">{account.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account ID</label>
                <p className="text-gray-900 font-mono text-sm">{account.accountInfo?.id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Added Date</label>
                <p className="text-gray-900">{formatDate(account.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {account.detailedTraffic && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Breakdown</h3>
              <div className="text-sm text-gray-600">
                <p>Detailed traffic information would be displayed here based on the API response structure.</p>
                <p className="mt-2 text-xs bg-gray-100 p-2 rounded">
                  Note: This section will be populated with actual traffic breakdown data from the GCore API.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/manage-keys"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Edit API Key
              </Link>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Average</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatBytes(account.trafficUsed / new Date().getDate())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Monthly</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatBytes((account.trafficUsed / new Date().getDate()) * 30)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic History */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic History</h3>
            {account.detailedTraffic && account.detailedTraffic.daily ? (
              <div className="space-y-3">
                {account.detailedTraffic.daily.slice(-7).map((day, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                    <span className="text-sm font-medium text-gray-900">{formatBytes(day.usage)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                <p>📊 Traffic history data will be displayed here</p>
                <p className="text-xs mt-1">Available when detailed traffic API is integrated</p>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Peak Usage Day</span>
                <span className="text-sm font-medium text-gray-900">
                  {account.detailedTraffic?.peakDay ? formatDate(account.detailedTraffic.peakDay) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Daily Usage</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatBytes((account.trafficUsed || 0) / Math.max(new Date().getDate(), 1))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usage Trend</span>
                <span className={`text-sm font-medium flex items-center ${
                  account.detailedTraffic?.trend === 'up' ? 'text-red-600' : 
                  account.detailedTraffic?.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {account.detailedTraffic?.trend === 'up' ? '📈 Increasing' : 
                   account.detailedTraffic?.trend === 'down' ? '📉 Decreasing' : '➡️ Stable'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efficiency Score</span>
                <span className="text-sm font-medium text-gray-900">
                  {account.trafficLimit && account.trafficUsed ? 
                    `${Math.max(0, Math.min(100, Math.round((1 - (account.trafficUsed / account.trafficLimit)) * 100)))}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* API Key Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Key</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Key Preview</label>
                <p className="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded mt-1">
                  {account.apiKey.substring(0, 16)}...{account.apiKey.substring(account.apiKey.length - 4)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={`text-sm font-medium mt-1 ${account.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {account.isActive ? '✅ Active' : '⭕ Inactive'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Added</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(account.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {account.updatedAt ? formatDate(account.updatedAt) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Card */}
          {usagePercentage > 80 && (
            <div className={`rounded-lg p-4 ${
              usagePercentage > 90 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className={`text-lg ${usagePercentage > 90 ? 'text-red-600' : 'text-yellow-600'}`}>
                    ⚠️
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    usagePercentage > 90 ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {usagePercentage > 90 ? 'Critical Usage Warning' : 'High Usage Alert'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    usagePercentage > 90 ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    You&apos;ve used {usagePercentage}% of your monthly traffic limit. 
                    {usagePercentage > 90 ? 
                      ' You may exceed your limit soon. Consider upgrading your plan or optimizing usage.' : 
                      ' Monitor your usage to avoid exceeding the limit.'}
                  </p>
                  {usagePercentage > 95 && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs text-red-600">
                        💡 Projected to exceed limit in {Math.max(1, Math.round((account.trafficLimit - account.trafficUsed) / (account.trafficUsed / new Date().getDate())))} days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Card for Low Usage */}
          {usagePercentage <= 50 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-lg text-green-600">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Excellent Usage</h3>
                  <p className="text-sm mt-1 text-green-700">
                    Great job! You&apos;ve only used {usagePercentage}% of your monthly limit. 
                    You&apos;re well within your traffic allowance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-gray-600">Days in Month</p>
            <p className="text-lg font-bold text-gray-900">
              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">⏰</div>
            <p className="text-sm text-gray-600">Days Passed</p>
            <p className="text-lg font-bold text-gray-900">{new Date().getDate()}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="text-lg font-bold text-gray-900">
              {formatBytes((account.trafficUsed || 0) / Math.max(new Date().getDate(), 1))}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm text-gray-600">Efficiency</p>
            <p className="text-lg font-bold text-gray-900">
              {account.trafficLimit > 0 ? 
                `${Math.round(((account.trafficLimit - account.trafficUsed) / account.trafficLimit) * 100)}%` : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">📈 Monitor Usage Trends</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Check daily usage patterns</li>
              <li>• Identify peak usage periods</li>
              <li>• Set up alerts for high usage</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚡ Optimize Performance</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Enable caching mechanisms</li>
              <li>• Compress large files</li>
              <li>• Use CDN efficiently</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔧 Best Practices</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Regular usage reviews</li>
              <li>• Plan for traffic spikes</li>
              <li>• Monitor all accounts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🚨 Alert Settings</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Set 80% usage alerts</li>
              <li>• Monitor daily increases</li>
              <li>• Track monthly trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}