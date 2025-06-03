import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Package, Store, MapPin, Phone, Mail, Building2, Receipt, Edit2, Save, XCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import BackButton from '../components/common/BackButton';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

const Profile = () => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShopForm, setShowShopForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Initialize profileDetails state directly from user context
  const [profileDetails, setProfileDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [shopDetails, setShopDetails] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    gstNumber: '',
    shopDescription: '',
    businessType: '',
    openingHours: '',
    documents: null
  });

  useEffect(() => {
    const fetchAdditionalUserData = async () => {
      if (!user?._id) return; // Ensure user and user._id are available
      try {
        // Fetch additional data like shopkeeper status and details
        const response = await api.get(`/api/users/${user._id}`);
        
        if (response.data.shopkeeperDetails) {
          setShopDetails(response.data.shopkeeperDetails);
        }
        
        // Fetch purchase history if available
        try {
          const historyResponse = await api.get(`/api/orders/user/${user._id}`);
          setPurchaseHistory(historyResponse.data);
        } catch (error) {
          console.error('Error fetching purchase history:', error);
          // Don't show error toast for purchase history as it might not be implemented yet
        }

      } catch (error) {
        console.error('Error fetching additional user data:', error);
        toast.error('Failed to load additional user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdditionalUserData();
  }, [user]);

  // Update profileDetails if user context changes
  useEffect(() => {
    if (user) {
      setProfileDetails({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?._id) return;
    try {
      // Only send allowed fields
      const allowedUpdates = {
        name: profileDetails.name,
        phone: profileDetails.phone,
        address: profileDetails.address
      };
      await api.put(`/api/users/${user._id}`, allowedUpdates);
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setProfileDetails({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditingProfile(false);
  };

  const handleShopFormChange = (e) => {
    const { name, value, files } = e.target;
    setShopDetails(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleBecomeShopkeeper = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      const formData = new FormData();
      Object.keys(shopDetails).forEach(key => {
        formData.append(key, shopDetails[key]);
      });

      await api.post(`/api/users/${user._id}/become-shopkeeper`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowShopForm(false);
      toast.success('Shopkeeper request submitted successfully! Awaiting admin approval.');
      refreshUser();
    } catch (error) {
      console.error('Error becoming shopkeeper:', error);
      toast.error('Failed to submit shopkeeper request');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{profileDetails.name}</h2>
                <p className="text-gray-600">{profileDetails.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail size={20} className="mr-2" />
                {isEditingProfile ? (
                  <input
                    type="email"
                    name="email"
                    value={profileDetails.email}
                    onChange={handleProfileChange}
                    className="border rounded-md px-2 py-1 w-full text-gray-800"
                  />
                ) : (
                  <span>{profileDetails.email}</span>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={20} className="mr-2" />
                {isEditingProfile ? (
                   <input
                    type="tel"
                    name="phone"
                    value={profileDetails.phone}
                    onChange={handleProfileChange}
                    className="border rounded-md px-2 py-1 w-full text-gray-800"
                   />
                ) : (
                  <span>{profileDetails.phone || 'Not provided'}</span>
                )}
              </div>
              <div className="flex items-start text-gray-600">
                <MapPin size={20} className="mr-2 mt-1" />
                {isEditingProfile ? (
                   <textarea
                    name="address"
                    value={profileDetails.address}
                    onChange={handleProfileChange}
                    className="border rounded-md px-2 py-1 w-full text-gray-800"
                    rows="3"
                   />
                ) : (
                  <span>{profileDetails.address || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="mt-6 text-right">
              {isEditingProfile ? (
                <div className="space-x-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
                  >
                    <XCircle size={20} className="inline mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                     <Save size={20} className="inline mr-1" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
                >
                   <Edit2 size={20} className="inline mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Package size={24} className="mr-2" />
              Purchase History
            </h3>
            {purchaseHistory.length > 0 ? (
              <div className="space-y-4">
                {purchaseHistory.map((order) => (
                  <div key={order._id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Order #{order._id}</span>
                      <span className="text-green-600">₹{order.totalAmount}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No purchase history yet.</p>
            )}
          </div>
        </div>

        {/* Shopkeeper Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Store size={24} className="mr-2" />
              Shopkeeper Status
            </h3>
            
            {user?.shopkeeperStatus === 'pending' ? (
              <div className="space-y-4">
                <p className="text-orange-600 font-medium">Your shopkeeper request is pending approval.</p>
                <p className="text-gray-600 text-sm">We will notify you once your request has been reviewed.</p>
              </div>
            ) : user?.isShopkeeper ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">You are a verified shopkeeper!</p>
                <Link
                  to="/shopkeeper/dashboard"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-center"
                >
                  Go to Shopkeeper Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Become a shopkeeper to start selling your products on our platform.
                </p>
                <button
                  onClick={() => setShowShopForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Register as Shopkeeper
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Registration Modal */}
      {showShopForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Register Your Shop</h3>
              <button
                onClick={() => setShowShopForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleBecomeShopkeeper} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={shopDetails.businessName}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={shopDetails.businessType}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Business Type</option>
                    <option value="retail">Retail Store</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="service">Service Provider</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address *
                  </label>
                  <textarea
                    name="businessAddress"
                    value={shopDetails.businessAddress}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={shopDetails.businessPhone}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={shopDetails.businessEmail}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={shopDetails.gstNumber}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={shopDetails.openingHours}
                    onChange={handleShopFormChange}
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Description *
                  </label>
                  <textarea
                    name="shopDescription"
                    value={shopDetails.shopDescription}
                    onChange={handleShopFormChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Documents (GST Certificate, Business License, etc.) *
                  </label>
                  <input
                    type="file"
                    name="documents"
                    onChange={handleShopFormChange}
                    className="w-full"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload relevant business documents (PDF, JPG, PNG)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowShopForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 