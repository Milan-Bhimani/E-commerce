import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import Star from 'lucide-react/dist/esm/icons/star';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import TruckIcon from 'lucide-react/dist/esm/icons/truck';
import CartContext from '../context/CartContext';
import { IndianRupee } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-[#7077A1]">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-[#F76E11] hover:text-[#E65D00] transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <Link to="/products" className="inline-flex items-center text-[#F76E11] hover:text-[#E65D00] transition-colors">
          <ChevronLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>
      
      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="max-w-md overflow-hidden rounded-xl">
              <img 
                src={`${API_BASE_URL}${product.image}`}
                alt={product.name} 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-[#2D3250] mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    size={18} 
                    className={index < 4 ? "text-[#F76E11] fill-current" : "text-[#7077A1]/30"} 
                  />
                ))}
              </div>
              <span className="ml-2 text-[#7077A1] text-sm">128 reviews</span>
            </div>
            
            <div className="text-2xl font-bold text-[#F76E11] mb-4 flex items-center">
              <IndianRupee size={24} className="mr-1" />{product.price.toFixed(2)}
            </div>
            
            <p className="text-[#7077A1] mb-6">
              {product.description}
            </p>
            
            <div className="mb-6">
              <div className="flex items-center border border-[#7077A1]/20 rounded-md inline-flex">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 border-r border-[#7077A1]/20 text-[#7077A1] hover:bg-[#7077A1]/5 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1 text-[#2D3250]">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 border-l border-[#7077A1]/20 text-[#7077A1] hover:bg-[#7077A1]/5 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-[#7077A1]/80 mt-2">
                {product.stock} items available
              </p>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="btn-primary flex items-center justify-center"
            >
              <ShoppingCart className="mr-2" size={20} />
              Add to Cart
            </button>
            
            <div className="mt-8 border-t border-[#7077A1]/20 pt-6">
              <div className="flex items-center text-[#7077A1] mb-2">
                <TruckIcon size={18} className="mr-2 text-[#F76E11]" />
                <span>Free shipping on orders over ₹50</span>
              </div>
              <p className="text-sm text-[#7077A1]/80">
                Usually ships within 2-3 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;