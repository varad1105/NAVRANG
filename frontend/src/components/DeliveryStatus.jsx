// frontend/src/components/DeliveryStatus.jsx
import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const statusStages = [
  { id: 'pending', label: 'Order Placed', icon: Clock, color: 'bg-gray-400' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
  { id: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-yellow-500' },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' }
];

const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle
};

const DeliveryStatus = ({ order, isAdmin = false, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`/api/orders/${order._id}/status`, {
        status: newStatus,
        message
      });
      toast.success(`Order marked as ${newStatus}`);
      onStatusUpdate?.();
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusIndex = statusStages.findIndex(s => s.id === order.status);
  const StatusIcon = statusIcons[order.status === 'cancelled' ? 'error' : 'success'] || Clock;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-5 h-5 ${
            order.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
          }`} />
          <span className="font-medium capitalize">{order.status}</span>
        </div>
      </div>

      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${(currentStatusIndex + 1) * (100 / statusStages.length)}%` 
            }}
          ></div>
        </div>

        <div className="flex justify-between mt-4">
          {statusStages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white
                ${index <= currentStatusIndex ? stage.color : 'bg-gray-300'}
                ${index < currentStatusIndex ? 'ring-4 ring-blue-200' : ''}
              `}>
                <stage.icon className="w-4 h-4" />
              </div>
              <span className="text-xs mt-2 text-gray-600">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-8 border-t pt-4">
          <h4 className="font-medium mb-3">Update Status</h4>
          <div className="flex flex-wrap gap-3">
            {statusStages
              .filter(stage => stage.id !== order.status && stage.id !== 'pending')
              .map(stage => (
                <button
                  key={stage.id}
                  onClick={() => updateStatus(stage.id)}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 
                             disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    'Updating...'
                  ) : (
                    <>
                      <span>Mark as {stage.label}</span>
                      <stage.icon className="w-4 h-4" />
                    </>
                  )}
                </button>
              ))}
          </div>
          <div className="mt-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)"
              className="w-full p-2 border rounded-md text-sm"
              rows="2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;