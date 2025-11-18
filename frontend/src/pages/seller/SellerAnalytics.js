import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  BarChart3,
  Calendar
} from 'lucide-react';

const SellerAnalytics = () => {
  const { api, isSeller } = useAuth();
  
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0
    },
    salesData: [],
    topProducts: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    if (!isSeller()) {
      return;
    }
    
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sellers/analytics?range=${timeRange}`);
      setAnalytics(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!isSeller()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only sellers can access this page</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, change, changeType, color = 'orange' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' && value > 1000 
              ? value > 1000000 
                ? `₹${(value / 1000000).toFixed(1)}M`
                : `₹${(value / 1000).toFixed(0)}k`
              : value
            }
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              {change}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
            <p className="text-gray-600">Track your business performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-input"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={analytics.overview.totalRevenue}
            icon={<DollarSign className="w-6 h-6 text-orange-500" />}
            change={12}
            changeType="positive"
          />
          <StatCard
            title="Total Orders"
            value={analytics.overview.totalOrders}
            icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
            change={8}
            changeType="positive"
          />
          <StatCard
            title="Active Products"
            value={analytics.overview.totalProducts}
            icon={<Package className="w-6 h-6 text-green-500" />}
            change={5}
            changeType="positive"
          />
          <StatCard
            title="Total Customers"
            value={analytics.overview.totalCustomers}
            icon={<Users className="w-6 h-6 text-purple-500" />}
            change={15}
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <BarChart3 size={20} className="inline mr-2" />
              Sales Overview
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Sales chart would be displayed here</p>
                <p className="text-sm text-gray-500">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <TrendingUp size={20} className="inline mr-2" />
              Top Performing Products
            </h2>
            {analytics.topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'product' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart size={16} /> :
                       activity.type === 'product' ? <Package size={16} /> :
                       <BarChart3 size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
