import { useContext } from 'react';
import { Link } from 'react-router-dom';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { IndianRupee } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000'; // Get backend URL from environment variables or use default

const ProductCard = ({ product, onDelete }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <Link to={`/product/${product._id}`}>
        <div className="h-48 overflow-hidden">
          <img 
            src={`${API_BASE_URL}${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h2 className="font-semibold text-lg mb-1 text-gray-800 hover:text-blue-600 transition-colors">
            {product.name}
          </h2>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <p className="text-blue-600 font-bold flex items-center">
            <IndianRupee size={16} className="mr-1" />{product.price.toFixed(2)}
          </p>
          
          <div className="flex space-x-2">
            {user?.isAdmin && onDelete ? (
              <>
                <Link 
                  to={`/admin/products/edit/${product._id}`}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => onDelete(product._id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <ShoppingCart size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;