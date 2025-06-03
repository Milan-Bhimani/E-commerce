import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = ({ to, text = 'Back' }) => {
  const navigate = useNavigate();

  if (!to) {
    return (
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-[#7077A1] hover:text-[#2D3250] transition-colors"
      >
        <ChevronLeft size={16} />
        <span>{text}</span>
      </button>
    );
  }

  return (
    <Link 
      to={to} 
      className="inline-flex items-center text-[#7077A1] hover:text-[#2D3250] transition-colors"
    >
      <ChevronLeft size={16} />
      <span>{text}</span>
    </Link>
  );
};

export default BackButton; 