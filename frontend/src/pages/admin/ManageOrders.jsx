import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { IndianRupee } from 'lucide-react'; // Import Rupee icon

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/admin/orders');
        setOrders(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders.');
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to update order status (e.g., Paid or Delivered)
  const handleUpdateStatus = async (orderId, field, value) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { [field]: value });
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, [field]: value, [`${field}At`]: value ? new Date() : undefined } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No orders found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.user ? order.user.name : 'Guest'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    <IndianRupee size={14} className="mr-1" />{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.isPaid ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'isPaid', true)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {order.isDelivered ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>
                    ) : (
                       <button 
                        onClick={() => handleUpdateStatus(order._id, 'isDelivered', true)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add View Order Details button here if needed */}
                    {/* <button className="text-indigo-600 hover:text-indigo-900 mr-4">View</button> */}
                     {/* Add Delete button here if needed */}
                    {/* <button className="text-red-600 hover:text-red-900">Delete</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders; 