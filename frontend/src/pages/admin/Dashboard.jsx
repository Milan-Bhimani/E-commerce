import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Users from 'lucide-react/dist/esm/icons/users';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import BackButton from '../../components/common/BackButton';
import api from '../../utils/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [errorRecent, setErrorRecent] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
        setIsLoadingStats(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setErrorStats('Failed to load dashboard statistics.');
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const res = await api.get('/api/admin/recent-activity');
        setRecentActivities(res.data);
        setIsLoadingRecent(false);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setErrorRecent('Failed to load recent activity.');
        setIsLoadingRecent(false);
      }
    };

    fetchRecentActivity();
  }, []);
  
  const StatCard = ({ title, value, icon, color }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-[#7077A1] text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-[#2D3250]">{value}</h3>
        </div>
      </div>
    </div>
  );
  
  const renderActivityItem = (activity) => {
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
    
    switch (activity.type) {
      case 'user_registered':
        return (
          <div key={activity._id} className="flex items-start border-b border-[#7077A1]/20 pb-4">
            <div className="bg-[#7077A1]/10 p-2 rounded-full text-[#2D3250] mr-4">
              <Users size={18} />
            </div>
            <div>
              <p className="font-medium text-[#2D3250]">New user registered</p>
              <p className="text-sm text-[#7077A1]">{activity.user ? activity.user.name : 'A user'} created an account</p>
              <p className="text-xs text-[#7077A1]/70 mt-1">{timeAgo}</p>
            </div>
          </div>
        );
      case 'order_created':
        return (
          <div key={activity._id} className="flex items-start border-b border-[#7077A1]/20 pb-4">
            <div className="bg-[#7077A1]/10 p-2 rounded-full text-[#2D3250] mr-4">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="font-medium text-[#2D3250]">New order #{activity.order ? activity.order._id.slice(-6) : 'N/A'}</p>
              <p className="text-sm text-[#7077A1]">{activity.user ? activity.user.name : 'Guest'} placed an order {activity.order ? `- ₹${activity.order.totalPrice.toFixed(2)}` : ''}</p>
              <p className="text-xs text-[#7077A1]/70 mt-1">{timeAgo}</p>
            </div>
          </div>
        );
      case 'product_stock_updated':
        return (
          <div key={activity._id} className="flex items-start border-b border-[#7077A1]/20 pb-4">
            <div className="bg-[#7077A1]/10 p-2 rounded-full text-[#2D3250] mr-4">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="font-medium text-[#2D3250]">Product stock update</p>
              <p className="text-sm text-[#7077A1]">{activity.description}</p>
              <p className="text-xs text-[#7077A1]/70 mt-1">{timeAgo}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Admin Dashboard</h1>
        <BackButton to="/" text="Back to Home" />
      </div>
      
      {isLoadingStats ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      ) : errorStats ? (
        <div className="text-center text-red-500 py-12">{errorStats}</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts} 
              icon={<ShoppingBag size={24} />} 
              color="bg-[#2D3250]" 
            />
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<Users size={24} />} 
              color="bg-[#424769]" 
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={<ShoppingBag size={24} />}
              color="bg-[#7077A1]" 
            />
            <StatCard 
              title="Total Revenue" 
              value={`₹${stats.totalRevenue.toFixed(2)}`}
              icon={<IndianRupee size={24} />}
              color="bg-[#F76E11]" 
            />
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/admin/products" className="card p-6 hover:shadow-lg transition-shadow hover-scale">
              <h3 className="text-xl font-semibold text-[#2D3250] mb-2">Manage Products</h3>
              <p className="text-[#7077A1] mb-4">Add, edit, or remove products from your inventory</p>
              <div className="text-[#F76E11] font-medium">View Products →</div>
            </Link>
            
            <Link to="/admin/orders" className="card p-6 hover:shadow-lg transition-shadow hover-scale">
              <h3 className="text-xl font-semibold text-[#2D3250] mb-2">Manage Orders</h3>
              <p className="text-[#7077A1] mb-4">View and process customer orders</p>
              <div className="text-[#F76E11] font-medium">View Orders →</div>
            </Link>
            
            <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-shadow hover-scale">
              <h3 className="text-xl font-semibold text-[#2D3250] mb-2">Manage Users</h3>
              <p className="text-[#7077A1] mb-4">View and manage user accounts</p>
              <div className="text-[#F76E11] font-medium">View Users →</div>
            </Link>

            {/* Link to Manage Shopkeeper Requests */}
            <Link to="/admin/shopkeeper-requests" className="card p-6 hover:shadow-lg transition-shadow hover-scale">
              <h3 className="text-xl font-semibold text-[#2D3250] mb-2">Manage Shopkeeper Requests</h3>
              <p className="text-[#7077A1] mb-4">Review and manage pending shopkeeper applications.</p>
              <div className="text-[#F76E11] font-medium">View Requests →</div>
            </Link>
          </div>
          
          {/* Recent Activity */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Recent Activity</h2>
            
            {isLoadingRecent ? (
               <div className="flex justify-center py-6">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F76E11]"></div>
               </div>
            ) : errorRecent ? (
              <div className="text-center text-red-500 py-6">{errorRecent}</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center text-[#7077A1] py-6">No recent activity.</div>
            ) : (
              <div className="space-y-4">
                {/* Render Recent Activities */}
                {recentActivities.map(activity => renderActivityItem(activity))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;