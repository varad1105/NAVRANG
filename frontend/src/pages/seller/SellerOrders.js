import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
} from "lucide-react";

const SellerOrders = () => {
  const { api, isSeller } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState({});

  // 🟢 fetchOrders wrapped inside useCallback
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sellers/orders");
      setOrders(response.data.data.orders);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // 🟢 useEffect with correct dependency
  useEffect(() => {
    if (isSeller) {
      fetchOrders();
    }
  }, [isSeller, fetchOrders]);

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    setError("");

    try {
      await api.put(`/sellers/orders/${orderId}`, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "confirmed":
        return <Package size={16} className="text-blue-500" />;
      case "shipped":
        return <Truck size={16} className="text-purple-500" />;
      case "delivered":
        return <CheckCircle size={16} className="text-green-500" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Package size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Search + Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Access protection
  if (!isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">Only sellers can access this page</p>
          <Link to="/" className="btn-festive">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Orders</h1>
          <p className="text-gray-600">Manage orders for your products</p>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        {/* Search + Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                className="form-input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                className="form-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="festive-spinner"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {orders.length === 0 ? "No Orders Yet" : "No Orders Found"}
            </h2>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {order.user.name} • {order.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items
                    </p>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image || "https://via.placeholder.com/60x60"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x {item.size}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Payment: {order.paymentMethod}</p>
                    <p>
                      Shipping: {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </p>
                  </div>

                  <div className="flex space-x-3 items-center">
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </Link>

                    {/* Status Buttons */}
                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "confirmed")
                        }
                        disabled={updating[order._id]}
                        className="btn-festive px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {updating[order._id] ? "Updating..." : "Confirm Order"}
                      </button>
                    )}

                    {order.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "shipped")
                        }
                        disabled={updating[order._id]}
                        className="btn-festive px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {updating[order._id] ? "Updating..." : "Mark Shipped"}
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "delivered")
                        }
                        disabled={updating[order._id]}
                        className="btn-festive px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {updating[order._id] ? "Updating..." : "Delivered"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
