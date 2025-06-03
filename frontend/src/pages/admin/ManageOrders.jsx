import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { IndianRupee } from 'lucide-react'; // Import Rupee icon
import BackButton from '../../components/common/BackButton';

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
      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/admin" text="Back to Dashboard" />
        <h1 className="text-3xl font-bold text-[#2D3250]">Manage Orders</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-[#7077A1] py-12">No orders found.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-[#7077A1]/20">
            <thead className="bg-[#F6F6F6]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Delivered</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Order Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7077A1]/20">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-[#F6F6F6] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3250]">{order.user ? order.user.name : 'Guest'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1] flex items-center">
                    <IndianRupee size={14} className="mr-1" />{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">
                    {order.isPaid ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'isPaid', true)}
                        className="text-[#2D3250] hover:text-[#F76E11] transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">
                     {order.isDelivered ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>
                    ) : (
                       <button 
                        onClick={() => handleUpdateStatus(order._id, 'isDelivered', true)}
                        className="text-[#2D3250] hover:text-[#F76E11] transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">
                    {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add View Order Details button here if needed */}
                    {/* <button className="text-[#2D3250] hover:text-[#F76E11] mr-4 transition-colors">View</button> */}
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