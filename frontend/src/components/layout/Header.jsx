import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-[#2D3250] flex items-center hover:text-[#F76E11] transition-colors">
            Cartzy
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
              Products
            </Link>
            
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
                Admin
              </Link>
            )}

            {isAuthenticated && user?.shopkeeperStatus === 'approved' && (
              <Link to="/shopkeeper/dashboard" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
                Shopkeeper Dashboard
              </Link>
            )}
          </nav>
          
          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-[#7077A1]">
                  Hi, {user?.name}
                </span>
                <Link
                  to="/profile"
                  className="text-[#7077A1] hover:text-[#F76E11] transition-colors"
                  title="Profile"
                >
                  <User size={20} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-[#7077A1] hover:text-[#FF5252] transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center text-[#7077A1] hover:text-[#F76E11] transition-colors"
              >
                <User size={20} className="mr-1" />
                Login
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="flex items-center text-[#7077A1] hover:text-[#F76E11] transition-colors relative"
              title="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F76E11] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#7077A1] hover:text-[#F76E11]"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-[#7077A1]/10">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-[#7077A1] hover:text-[#F76E11] transition-colors"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-[#7077A1] hover:text-[#F76E11] transition-colors"
                onClick={toggleMenu}
              >
                Products
              </Link>
              
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-[#7077A1] hover:text-[#F76E11] transition-colors"
                  onClick={toggleMenu}
                >
                  Admin
                </Link>
              )}

              {isAuthenticated && user?.shopkeeperStatus === 'approved' && (
                <Link 
                  to="/shopkeeper/dashboard" 
                  className="text-[#7077A1] hover:text-[#F76E11] transition-colors"
                  onClick={toggleMenu}
                >
                  Shopkeeper Dashboard
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <span className="text-[#7077A1]">Hi, {user?.name}</span>
                  <Link
                    to="/profile"
                    className="flex items-center text-[#7077A1] hover:text-[#F76E11] transition-colors"
                    onClick={toggleMenu}
                  >
                    <User size={18} className="mr-2" />
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-[#FF5252] flex items-center hover:text-[#FF5252]/80"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-[#7077A1] hover:text-[#F76E11] transition-colors flex items-center"
                  onClick={toggleMenu}
                >
                  <User size={18} className="mr-2" />
                  Login
                </Link>
              )}
              
              <Link 
                to="/cart" 
                className="flex items-center text-[#7077A1] hover:text-[#F76E11] transition-colors relative"
                onClick={toggleMenu}
              >
                <ShoppingCart size={18} className="mr-2" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;