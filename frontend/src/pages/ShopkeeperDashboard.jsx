import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Package, Edit, Trash2, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import BackButton from '../components/common/BackButton';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

const ShopkeeperDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user?._id) {
      toast.error('Please log in to view your products');
      return;
    }

    try {
      const response = await api.get(`/api/products/shopkeeper/${user._id}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error('Please log in to add products');
      return;
    }

    try {
      const formData = new FormData();
      
      // Validate required fields
      if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.stock || !newProduct.image) {
        toast.error('All fields are required');
        return;
      }

      // Convert and validate stock
      const stock = parseInt(newProduct.stock, 10);
      if (isNaN(stock) || stock < 0) {
        toast.error('Please enter a valid stock quantity');
        return;
      }

      // Convert and validate price
      const price = parseFloat(newProduct.price);
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Validate category
      const validCategories = ['electronics', 'clothing', 'home', 'books', 'other'];
      if (!validCategories.includes(newProduct.category.toLowerCase())) {
        toast.error('Please select a valid category');
        return;
      }

      // Add all fields to formData
      formData.append('name', newProduct.name.trim());
      formData.append('description', newProduct.description.trim());
      formData.append('price', price);
      formData.append('category', newProduct.category.toLowerCase());
      formData.append('stock', stock);
      formData.append('shopkeeperId', user._id.toString());
      formData.append('image', newProduct.image);

      const response = await api.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Check if the response indicates success
      if (response.status === 201 || response.status === 200) {
        toast.success('Product added successfully!');
        setShowAddProduct(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image: null
        });
        fetchProducts(); // Refresh the product list
      } else {
        throw new Error('Unexpected response status');
      }

    } catch (error) {
      console.error('Error adding product:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .map(err => err.message)
          .join(', ');
        toast.error(errorMessages);
      } else {
        toast.error('Failed to add product. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!user?._id) {
      toast.error('Please log in to delete products');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the shopkeeper dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Shopkeeper Dashboard</h1>
        <BackButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package size={24} className="mr-2" />
            My Products
          </h2>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <img
                  src={`${api.defaults.baseURL}${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">₹{product.price}</p>
                <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Stock: {product.stock} {product.stock <= 5 ? (
                    <span className="text-red-500">(Low stock!)</span>
                  ) : null}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No products added yet.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                    className="w-full"
                    accept="image/*"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperDashboard; 