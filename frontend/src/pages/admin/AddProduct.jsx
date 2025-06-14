import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    image: null, // Store the actual file object here
    category: 'electronics' // Default category
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file object
      setFormData({ ...formData, image: file });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.description || !formData.stock || !formData.image) {
      toast.error('Please fill in all required fields (including image)');
      return;
    }
    
    setIsSubmitting(true);
    
    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('price', formData.price);
    productFormData.append('description', formData.description);
    productFormData.append('stock', formData.stock);
    productFormData.append('category', formData.category);
    productFormData.append('image', formData.image); // Append the actual image file

    try {
      // Send the form data as multipart/form-data
      await axios.post('/api/products', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Product added successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      // Check if the error response has a data object with a message
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Failed to add product: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <BackButton to="/admin/products" text="Back to Products" />
      </div>
      
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-[#2D3250] mb-6">Add New Product</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#7077A1] mb-1">
                Product Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-[#7077A1] mb-1">
                Price (₹)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="form-input"
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#7077A1] mb-1">
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Kitchen</option>
                <option value="books">Books</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-[#7077A1] mb-1">
                Stock*
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                className="form-input"
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-[#7077A1] mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="form-input"
            ></textarea>
          </div>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-[#7077A1] mb-1">
              Product Image*
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required // Make image required for submission
              className="form-input"
            />
            <p className="text-xs text-[#7077A1] mt-1">
              Recommended size: 800x600 pixels, max 5MB
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-secondary mr-4"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary hover-scale"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;