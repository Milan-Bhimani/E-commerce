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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-700">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="max-w-md overflow-hidden rounded-lg">
              <img 
                src={`${API_BASE_URL}${product.image}`}
                alt={product.name} 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    size={18} 
                    className={index < 4 ? "text-yellow-400 fill-current" : "text-gray-300"} 
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600 text-sm">128 reviews</span>
            </div>
            
            <div className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
              <IndianRupee size={24} className="mr-1" />{product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-700 mb-6">
              {product.description}
            </p>
            
            <div className="mb-6">
              <div className="flex items-center border rounded-md inline-flex">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 border-r text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 border-l text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {product.stock} items available
              </p>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center hover-scale"
            >
              <ShoppingCart className="mr-2" size={20} />
              Add to Cart
            </button>
            
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center text-gray-700 mb-2">
                <TruckIcon size={18} className="mr-2 text-blue-600" />
                <span>Free shipping on orders over ₹50</span>
              </div>
              <p className="text-sm text-gray-600">
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