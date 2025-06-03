import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PlusCircle from 'lucide-react/dist/esm/icons/plus-circle';
import Search from 'lucide-react/dist/esm/icons/search';
import ProductCard from '../../components/product/ProductCard';
import BackButton from '../../components/common/BackButton';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);
  
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/products?search=${searchTerm}&limit=100`);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/admin" text="Back to Dashboard" />
          <h1 className="text-3xl font-bold text-[#2D3250]">Manage Products</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full sm:w-64"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7077A1]" />
          </div>
          
          <Link
            to="/admin/products/add"
            className="btn-primary flex items-center justify-center hover-scale"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Product
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-xl text-[#7077A1] mb-4">No products found.</p>
          {searchTerm ? (
            <p className="text-[#7077A1]">Try changing your search term.</p>
          ) : (
            <Link
              to="/admin/products/add"
              className="btn-primary inline-block hover-scale"
            >
              Add Your First Product
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;