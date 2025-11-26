import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Plus,
  Store,
  BarChart3
} from 'lucide-react';

const SellerDashboard = () => {
  const { api, user, isSeller } = useAuth(); // <-- Added isSeller
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0
    },
    recentOrders: [],
    lowStockProducts: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // fetchDashboardData declared before useEffect
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sellers/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED useEffect with dependencies
  useEffect(() => {
    if (isSeller) {
      fetchDashboardData();
    }
  }, [isSeller]); // fetchDashboardData removed to avoid infinite loop

  const StatCard = ({ title, value, icon, change, changeType, color = 'orange' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' && value > 1000 
              ? `₹${(value / 1000).toFixed(1)}k` 
              : value
            }
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <ArrowUp size={16} className="mr-1" />
              ) : (
                <ArrowDown size={16} className="mr-1" />
              )}
              {change}% from last month
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your business overview.
          </p>
        </div>

        {error && (
          <div className="alert-error mb-6">{error}</div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={dashboardData.stats.totalProducts}
            icon={<Package className="w-6 h-6 text-orange-500" />}
            change={12}
            changeType="positive"
          />
          <StatCard
            title="Total Orders"
            value={dashboardData.stats.totalOrders}
            icon={<ShoppingBag className="w-6 h-6 text-orange-500" />}
            change={8}
            changeType="positive"
          />
          <StatCard
            title="Total Revenue"
            value={dashboardData.stats.totalRevenue}
            icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
            change={15}
            changeType="positive"
          />
          <StatCard
            title="Pending Orders"
            value={dashboardData.stats.pendingOrders}
            icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
            change={5}
            changeType="negative"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/seller/products/add" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-orange-50">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium">Add Product</span>
            </Link>

            <Link to="/seller/products" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-orange-50">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">Manage Products</span>
            </Link>

            <Link to="/seller/orders" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-orange-50">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">View Orders</span>
            </Link>

            <Link to="/seller/analytics" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-orange-50">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Link to="/seller/orders" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>

            <div className="p-6">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.user.name}</p>
                        <p className="text-sm text-gray-500">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Low Stock Alert</h2>
                <Link to="/seller/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  Manage
                </Link>
              </div>
            </div>

            <div className="p-6">
              {dashboardData.lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p>All products are well stocked</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images[0]?.url || 'https://via.placeholder.com/50x50'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                        </div>
                      </div>

                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerDashboard;
