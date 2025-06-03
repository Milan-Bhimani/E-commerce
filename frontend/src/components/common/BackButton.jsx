import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      <ArrowLeft size={20} className="mr-1" />
      Back
    </button>
  );
};

export default BackButton; 