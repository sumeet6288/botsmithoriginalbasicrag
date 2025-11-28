import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Calendar, CheckCircle, Clock, TrendingUp, 
  History, RefreshCw, AlertCircle, Crown, Zap, ArrowUpCircle,
  BarChart3, FileText, Globe, MessageSquare, Upload, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SubscriptionDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/plans/subscription-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptionData(response.data);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'subscription_started': 'Subscription Started',
      'plan_upgraded': 'Plan Upgraded',
      'subscription_renewed': 'Subscription Renewed',
      'plan_downgraded': 'Plan Downgraded',
      'subscription_expired': 'Subscription Expired',
      'subscription_cancelled': 'Subscription Cancelled'
    };
    return labels[action] || action;
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'plan_upgraded':
        return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'subscription_renewed':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'subscription_started':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">Failed to fetch subscription details</p>
          <Button onClick={fetchSubscriptionDetails}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { current_subscription, current_plan, history, usage, status } = subscriptionData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Subscription Details
          </h1>
          <p className="text-gray-600">Manage your subscription and view your usage history</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{current_plan.name}</h2>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(current_subscription.status)} mt-1`}>
                    <div className={`w-2 h-2 rounded-full ${current_subscription.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    {current_subscription.status.charAt(0).toUpperCase() + current_subscription.status.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Start Date</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{formatDate(current_subscription.started_at)}</p>
                </div>
                
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium text-gray-600">Expires On</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{formatDate(current_subscription.expires_at)}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Days Remaining</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {status.days_remaining !== null ? `${status.days_remaining} days` : 'Unlimited'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RefreshCw className="w-4 h-4" />
                  <span>Auto-Renew: <strong>{current_subscription.auto_renew ? 'Enabled' : 'Disabled'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Billing Cycle: <strong>{current_subscription.billing_cycle || 'Monthly'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/subscription')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button
                onClick={fetchSubscriptionDetails}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Usage Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                Subscription History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Current Usage</h3>
                
                {/* Usage Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Chatbots */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Chatbots</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {usage.usage.chatbots.current} / {usage.usage.chatbots.limit}
                          </p>
                        </div>
                      </div>
                      {usage.usage.chatbots.is_custom && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${Math.min(usage.usage.chatbots.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{usage.usage.chatbots.percentage}% used</p>
                  </div>

                  {/* Messages */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Messages</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {usage.usage.messages.current} / {usage.usage.messages.limit}
                          </p>
                        </div>
                      </div>
                      {usage.usage.messages.is_custom && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min(usage.usage.messages.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{usage.usage.messages.percentage}% used</p>
                  </div>

                  {/* File Uploads */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">File Uploads</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {usage.usage.file_uploads.current} / {usage.usage.file_uploads.limit}
                          </p>
                        </div>
                      </div>
                      {usage.usage.file_uploads.is_custom && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500"
                        style={{ width: `${Math.min(usage.usage.file_uploads.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{usage.usage.file_uploads.percentage}% used</p>
                  </div>

                  {/* Website Sources */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Website Sources</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {usage.usage.website_sources.current} / {usage.usage.website_sources.limit}
                          </p>
                        </div>
                      </div>
                      {usage.usage.website_sources.is_custom && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${Math.min(usage.usage.website_sources.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{usage.usage.website_sources.percentage}% used</p>
                  </div>

                  {/* Text Sources */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Text Sources</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {usage.usage.text_sources.current} / {usage.usage.text_sources.limit}
                          </p>
                        </div>
                      </div>
                      {usage.usage.text_sources.is_custom && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="relative w-full h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                        style={{ width: `${Math.min(usage.usage.text_sources.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{usage.usage.text_sources.percentage}% used</p>
                  </div>
                </div>

                {/* Billing Period Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mt-8">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Billing Period</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Days Elapsed</p>
                      <p className="text-2xl font-bold text-purple-600">{usage.subscription.days_elapsed} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {usage.subscription.days_remaining !== null ? `${usage.subscription.days_remaining} days` : 'Unlimited'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Days</p>
                      <p className="text-2xl font-bold text-blue-600">{usage.subscription.total_days} days</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative w-full h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${(usage.subscription.days_elapsed / usage.subscription.total_days) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Subscription History</h3>
                
                {history && history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((record, index) => (
                      <div
                        key={record._id || index}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                              {getActionIcon(record.action)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-800">{getActionLabel(record.action)}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Plan:</strong> {record.plan_name}
                              </p>
                              {record.metadata && record.metadata.old_plan_name && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Upgraded from <strong>{record.metadata.old_plan_name}</strong> to <strong>{record.metadata.new_plan_name}</strong>
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                                <span>Started: {formatDate(record.started_at)}</span>
                                {record.expires_at && <span>Expires: {formatDate(record.expires_at)}</span>}
                                <span>Billing: {record.billing_cycle}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(record.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No subscription history available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
