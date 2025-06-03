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
    <div className="card hover-lift">
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
          <h2 className="font-semibold text-lg mb-1 text-[#2D3250] hover:text-[#F76E11] transition-colors">
            {product.name}
          </h2>
        </Link>
        
        <p className="text-[#7077A1] text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <p className="text-[#F76E11] font-bold flex items-center">
            <IndianRupee size={16} className="mr-1" />{product.price.toFixed(2)}
          </p>
          
          <div className="flex space-x-2">
            {user?.isAdmin && onDelete ? (
              <>
                <Link 
                  to={`/admin/products/edit/${product._id}`}
                  className="p-2 text-[#7077A1] hover:text-[#F76E11] transition-colors"
                >
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => onDelete(product._id)}
                  className="p-2 text-[#7077A1] hover:text-[#FF5252] transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-[#F76E11] hover:bg-[#E65D00] text-white p-2 rounded-full transition-colors flex items-center justify-center"
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