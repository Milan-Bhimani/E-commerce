import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshUser, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchShopkeeperRequests = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/users/shopkeeper/requests');
        setUsers(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching shopkeeper requests:', error);
        setError('Failed to load shopkeeper requests.');
        setIsLoading(false);
      }
    };

    fetchShopkeeperRequests();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        // Remove the deleted user from the state
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.'); // Basic error feedback
      }
    }
  };

  const handleApproveReject = async (userId, status) => {
    try {
      await axios.put(`/api/users/shopkeeper/${userId}/status`, { status });
      // Remove the approved/rejected user from the pending list
      setUsers(users.filter(user => user._id !== userId));
      toast.success(`Shopkeeper request ${status}ed successfully!`);
      
      // Refetch pending requests to update the list
      fetchShopkeeperRequests();

    } catch (error) {
      console.error(`Error ${status}ing shopkeeper request:`, error);
      alert(`Failed to ${status} shopkeeper request.`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Shopkeeper Requests</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No pending shopkeeper requests.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.shopkeeperDetails?.businessName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleApproveReject(user._id, 'approved')}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApproveReject(user._id, 'rejected')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers; 