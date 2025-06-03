import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { IndianRupee, CheckCircle2, Package, Truck, Home } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import { api } from '../utils/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error(error.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2D3250] mb-4">Order Not Found</h1>
          <p className="text-[#7077A1] mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Order Confirmation</h1>
        <BackButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-[#2D3250] mb-2">Thank You for Your Order!</h2>
                <p className="text-[#7077A1]">Your order has been successfully placed and confirmed.</p>
              </div>
            </div>
            
            <div className="border-t border-[#7077A1]/20 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-[#F76E11] mx-auto mb-2" />
                  <h3 className="font-medium text-[#2D3250] mb-1">Order Placed</h3>
                  <p className="text-sm text-[#7077A1]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 text-[#F76E11] mx-auto mb-2" />
                  <h3 className="font-medium text-[#2D3250] mb-1">Processing</h3>
                  <p className="text-sm text-[#7077A1]">Your order is being prepared</p>
                </div>
                <div className="text-center">
                  <Home className="w-8 h-8 text-[#F76E11] mx-auto mb-2" />
                  <h3 className="font-medium text-[#2D3250] mb-1">Delivery</h3>
                  <p className="text-sm text-[#7077A1]">Estimated 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Order Details</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-[#2D3250]">{item.name}</h3>
                      <p className="text-sm text-[#7077A1]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#2D3250] flex items-center">
                    <IndianRupee size={16} className="mr-1" />
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#7077A1]/20 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-[#7077A1]">
                <span>Subtotal</span>
                <span className="flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {order.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#7077A1]">
                <span>GST (28%)</span>
                <span className="flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {(order.totalPrice * 0.28).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-[#2D3250]">
                <span>Total</span>
                <span className="flex items-center text-[#F76E11]">
                  <IndianRupee size={20} className="mr-1" />
                  {(order.totalPrice * 1.28).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Shipping Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#7077A1] mb-1">Name</h3>
                <p className="text-[#2D3250]">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[#7077A1] mb-1">Email</h3>
                <p className="text-[#2D3250]">{order.shippingAddress.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[#7077A1] mb-1">Address</h3>
                <p className="text-[#2D3250]">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[#7077A1] mb-1">Order Number</h3>
                <p className="text-[#2D3250]">{order._id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-[#7077A1] mb-1">Payment Method</h3>
                <p className="text-[#2D3250]">Cash on Delivery</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#7077A1]/20">
              <Link to="/" className="btn-primary w-full flex items-center justify-center">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 