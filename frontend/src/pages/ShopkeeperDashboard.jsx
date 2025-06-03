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
          <AlertCircle size={48} className="mx-auto text-[#7077A1] mb-4" />
          <h2 className="text-2xl font-bold text-[#2D3250] mb-2">Please Log In</h2>
          <p className="text-[#7077A1] mb-4">You need to be logged in to access the shopkeeper dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
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
          <div className="h-8 bg-[#7077A1]/10 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-[#7077A1]/10 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Shopkeeper Dashboard</h1>
        <BackButton to="/" text="Back to Home" />
      </div>

      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D3250] flex items-center">
            <Package size={24} className="mr-2" />
            My Products
          </h2>
          <button
            onClick={() => setShowAddProduct(true)}
            className="btn-primary flex items-center hover-scale"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card p-4 hover-scale">
                <img
                  src={`${api.defaults.baseURL}${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="font-bold text-lg text-[#2D3250] mb-2">{product.name}</h3>
                <p className="text-[#F76E11] font-medium mb-2">₹{product.price}</p>
                <p className="text-sm text-[#7077A1] mb-2">{product.description}</p>
                <p className="text-sm text-[#7077A1] mb-4">
                  Stock: {product.stock} {product.stock <= 5 ? (
                    <span className="text-red-500">(Low stock!)</span>
                  ) : null}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                    className="text-[#2D3250] hover:text-[#F76E11] flex items-center transition-colors"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-[#7077A1] hover:text-red-500 flex items-center transition-colors"
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
            <AlertCircle size={48} className="mx-auto text-[#7077A1] mb-4" />
            <p className="text-[#7077A1]">No products added yet.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-[#2D3250] mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#7077A1] mb-1">Product Name*</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7077A1] mb-1">Price (₹)*</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7077A1] mb-1">Category*</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="form-input"
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
                  <label className="block text-sm font-medium text-[#7077A1] mb-1">Stock*</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#7077A1] mb-1">Description*</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="form-input"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#7077A1] mb-1">Product Image*</label>
                <input
                  type="file"
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                  className="form-input"
                  accept="image/*"
                  required
                />
                <p className="text-xs text-[#7077A1] mt-1">
                  Recommended size: 800x600 pixels, max 2MB
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary hover-scale"
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