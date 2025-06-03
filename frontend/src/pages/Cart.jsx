import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { IndianRupee } from 'lucide-react';
import CartContext from '../context/CartContext';
import BackButton from '../components/common/BackButton';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useContext(CartContext);
  
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-[#7077A1] flex justify-center mb-4">
            <ShoppingBag size={64} />
          </div>
          <h2 className="text-2xl font-bold text-[#2D3250] mb-2">Your cart is empty</h2>
          <p className="text-[#7077A1] mb-6">Looks like you haven't added any products to your cart yet.</p>
          <div className="flex flex-col gap-4 items-center">
            <Link 
              to="/products" 
              className="btn-primary hover-scale"
            >
              Browse Products
            </Link>
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  const gstRate = 0.28; // 28% GST
  const subtotal = totalPrice || 0;
  const gstAmount = subtotal * gstRate;
  const orderTotal = subtotal + gstAmount;
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Your Cart</h1>
        <BackButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Cart Items ({cart.length})</h2>
              
              <div className="divide-y divide-[#7077A1]/10">
                {cart.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="sm:w-20 sm:h-20 w-full h-32 flex-shrink-0 mb-4 sm:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="sm:ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-[#2D3250]">{item.name}</h3>
                      <p className="text-[#F76E11] font-semibold flex items-center">
                         <IndianRupee size={14} className="mr-1" />{item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4 sm:mt-0">
                      <div className="flex items-center border border-[#7077A1]/20 rounded-md mr-4">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2 py-1 border-r border-[#7077A1]/20 text-[#7077A1] hover:bg-[#7077A1]/5 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-[#2D3250]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2 py-1 border-l border-[#7077A1]/20 text-[#7077A1] hover:bg-[#7077A1]/5 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-[#FF5252] hover:text-[#FF5252]/80 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#7077A1]">
                <span>Subtotal</span>
                <span className="flex items-center"><IndianRupee size={14} className="mr-1" />{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#7077A1]">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-[#7077A1]">
                <span>Tax (assuming 28% GST)</span>
                <span className="flex items-center"><IndianRupee size={14} className="mr-1" />{gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#7077A1]/20 pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg text-[#2D3250]">
                  <span>Total</span>
                  <span className="flex items-center"><IndianRupee size={16} className="mr-1" />{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="w-full bg-[#F76E11] hover:bg-[#E65D00] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center hover-scale transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="ml-2" />
            </Link>
            
            <div className="mt-6 text-center">
              <Link 
                to="/products" 
                className="text-[#F76E11] hover:text-[#E65D00] inline-flex items-center transition-colors"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;