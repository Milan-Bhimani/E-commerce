import { Link } from 'react-router-dom';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Twitter from 'lucide-react/dist/esm/icons/twitter';

const Footer = () => {
  return (
    <footer className="bg-[#2D3250] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB84C]">ShopEase</h3>
            <p className="text-[#7077A1] text-sm">
              Your one-stop shop for all your needs.
              Quality products at affordable prices.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB84C]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB84C]">Customer Service</h3>
            <ul className="space-y-2">
              <li className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm cursor-pointer">
                Contact Us
              </li>
              <li className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm cursor-pointer">
                FAQ
              </li>
              <li className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm cursor-pointer">
                Shipping Policy
              </li>
              <li className="text-[#7077A1] hover:text-[#F76E11] transition-colors text-sm cursor-pointer">
                Returns & Refunds
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB84C]">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-[#7077A1] hover:text-[#F76E11] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#7077A1]/20 mt-8 pt-6 text-center text-[#7077A1] text-sm">
          <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;