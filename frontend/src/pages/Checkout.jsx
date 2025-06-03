import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { IndianRupee } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import { api } from '../utils/api';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: formData,
        totalPrice: orderTotal
      };
      
      const order = await api.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const gstRate = 0.28; // 28% GST
  const subtotal = totalPrice || 0;
  const gstAmount = subtotal * gstRate;
  const orderTotal = subtotal + gstAmount;
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Checkout</h1>
        <BackButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <form onSubmit={handleCreateOrder}>
              {/* Shipping Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[#7077A1] mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[#7077A1] mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#7077A1] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-[#7077A1] mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-[#7077A1] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-[#7077A1] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-[#7077A1] mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {cart.map((item) => (
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
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#7077A1]">
                <span>GST (28%)</span>
                <span className="flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {gstAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-[#2D3250]">
                <span>Total</span>
                <span className="flex items-center text-[#F76E11]">
                  <IndianRupee size={20} className="mr-1" />
                  {orderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;