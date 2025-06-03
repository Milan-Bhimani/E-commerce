import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, UserCheck, UserX, AlertCircle } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshUser, user } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users.');
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user.');
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success(`User role updated to ${newRole}!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role.');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success(`User status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/admin" text="Back to Dashboard" />
        <h1 className="text-3xl font-bold text-[#2D3250]">Manage Users</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-[#7077A1] mb-4" />
          <p className="text-[#7077A1]">No users found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-[#7077A1]/20">
            <thead className="bg-[#F6F6F6]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#7077A1] uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7077A1]/20">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-[#F6F6F6] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3250]">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7077A1]">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      className="form-input py-1 px-2 text-sm"
                    >
                      <option value="user">User</option>
                      <option value="shopkeeper">Shopkeeper</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleToggleStatus(user._id, user.status)}
                      className="text-[#2D3250] hover:text-[#F76E11] mr-4 transition-colors"
                      title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-[#7077A1] hover:text-red-500 transition-colors"
                      title="Delete User"
                    >
                      <User size={16} />
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