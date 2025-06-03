import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/products?limit=8');
        setFeaturedProducts(res.data.products || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        // Handle both possible response structures
        const productsData = response.data.products || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setProducts([]); // Set empty array on error
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
              Welcome to ShopEase
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 animate-slide-up" style={{animationDelay: '0.1s'}}>
              Discover amazing products at unbeatable prices. Shop with ease, confidence, and style.
            </p>
            <Link
              to="/products"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block animate-slide-up hover-scale"
              style={{animationDelay: '0.2s'}}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
          <p className="text-gray-600">Check out our most popular items</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products available at the moment.</p>
        )}

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-block px-6 py-3 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-600 hover:text-white transition-colors hover-scale"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose ShopEase?</h2>
            <p className="text-gray-600">We offer the best shopping experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover-scale">
              <div className="text-blue-600 text-3xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Quality Products</h3>
              <p className="text-gray-600">We source only the best quality products for our customers.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover-scale">
              <div className="text-blue-600 text-3xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Secure Shopping</h3>
              <p className="text-gray-600">Your privacy and security are our top priorities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover-scale">
              <div className="text-blue-600 text-3xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your orders quickly with our reliable delivery service.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;