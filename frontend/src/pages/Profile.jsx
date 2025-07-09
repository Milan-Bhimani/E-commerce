import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Package, Store, MapPin, Phone, Mail, Building2, Receipt, Edit2, Save, XCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import BackButton from '../components/common/BackButton';
import api from '../utils/axiosInstance';

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
      if (!user?._id) return;
      try {
        const response = await api.get(`/api/users/${user._id}`);
        
        if (response.data.shopkeeperDetails) {
          setShopDetails(response.data.shopkeeperDetails);
        }
        
        try {
          const historyResponse = await api.get('/api/orders/my-orders');
          setPurchaseHistory(historyResponse.data);
        } catch (error) {
          console.error('Error fetching purchase history:', error);
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
    const newValue = files ? files[0] : value;
    console.log(`Updating ${name} to:`, newValue);
    setShopDetails(prev => ({
      ...prev,
      [name]: newValue
    }));
    console.log('Shop details state after update:', { ...shopDetails, [name]: newValue });
  };

  const handleBecomeShopkeeper = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      const formData = new FormData();
      
      // Add each field directly to formData
      formData.append('businessName', shopDetails.businessName);
      formData.append('businessAddress', shopDetails.businessAddress);
      formData.append('businessPhone', shopDetails.businessPhone);
      formData.append('businessEmail', shopDetails.businessEmail);
      formData.append('gstNumber', shopDetails.gstNumber);
      formData.append('shopDescription', shopDetails.shopDescription);
      formData.append('businessType', shopDetails.businessType || ''); // Ensure it's not undefined
      formData.append('openingHours', shopDetails.openingHours);
      
      // Add documents separately if they exist
      if (shopDetails.documents) {
        formData.append('documents', shopDetails.documents);
      }

      // Log the form data for debugging
      console.log('Form data being sent:', {
        businessName: shopDetails.businessName,
        businessType: shopDetails.businessType,
        businessAddress: shopDetails.businessAddress,
        businessPhone: shopDetails.businessPhone,
        businessEmail: shopDetails.businessEmail,
        gstNumber: shopDetails.gstNumber,
        shopDescription: shopDetails.shopDescription,
        openingHours: shopDetails.openingHours
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
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit shopkeeper request');
      }
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
          <div className="h-8 bg-[#7077A1]/20 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-[#7077A1]/20 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Profile</h1>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-[#7077A1]/10 rounded-full flex items-center justify-center mr-4">
                <User size={32} className="text-[#F76E11]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D3250]">{profileDetails.name}</h2>
                <p className="text-[#7077A1]">{profileDetails.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-[#7077A1]">
                <Mail size={20} className="mr-2" />
                {isEditingProfile ? (
                  <input
                    type="email"
                    name="email"
                    value={profileDetails.email}
                    onChange={handleProfileChange}
                    className="form-input"
                    disabled
                  />
                ) : (
                  <span>{profileDetails.email}</span>
                )}
              </div>
              <div className="flex items-center text-[#7077A1]">
                <Phone size={20} className="mr-2" />
                {isEditingProfile ? (
                   <input
                    type="tel"
                    name="phone"
                    value={profileDetails.phone}
                    onChange={handleProfileChange}
                    className="form-input"
                   />
                ) : (
                  <span>{profileDetails.phone || 'Not provided'}</span>
                )}
              </div>
              <div className="flex items-start text-[#7077A1]">
                <MapPin size={20} className="mr-2 mt-1" />
                {isEditingProfile ? (
                   <textarea
                    name="address"
                    value={profileDetails.address}
                    onChange={handleProfileChange}
                    className="form-input"
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
                    className="px-4 py-2 text-[#7077A1] hover:text-[#2D3250] rounded-md transition-colors"
                  >
                    <XCircle size={20} className="inline-block mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary"
                  >
                    <Save size={20} className="inline-block mr-1" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-primary"
                >
                  <Edit2 size={20} className="inline-block mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Purchase History */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Purchase History</h2>
            {purchaseHistory.length > 0 ? (
              <div className="space-y-4">
                {purchaseHistory.map((order) => (
                  <div key={order._id} className="border border-[#7077A1]/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[#2D3250] font-medium">Order #{order._id}</p>
                        <p className="text-sm text-[#7077A1]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#7077A1]/10 text-[#7077A1]">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-[#7077A1]">
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#7077A1] text-center py-4">No purchase history available</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Account Actions</h2>
            <div className="space-y-4">
              {!user?.isShopkeeper && !showShopForm && (
                <button
                  onClick={() => setShowShopForm(true)}
                  className="w-full btn-primary"
                >
                  <Store size={20} className="inline-block mr-1" />
                  Become a Shopkeeper
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-[#7077A1] hover:text-[#2D3250] rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {showShopForm && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-[#2D3250] mb-4">Shopkeeper Application</h2>
              <form onSubmit={handleBecomeShopkeeper} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={shopDetails.businessName}
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={shopDetails.businessAddress}
                    onChange={handleShopFormChange}
                    className="form-input"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={shopDetails.businessPhone}
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={shopDetails.businessEmail}
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={shopDetails.gstNumber}
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={shopDetails.businessType}
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Business Type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Shop Description
                  </label>
                  <textarea
                    name="shopDescription"
                    value={shopDetails.shopDescription}
                    onChange={handleShopFormChange}
                    className="form-input"
                    rows="4"
                    placeholder="Describe your shop, products, and services..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={shopDetails.openingHours}
                    onChange={handleShopFormChange}
                    className="form-input"
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3250] mb-1">
                    Business Documents
                  </label>
                  <input
                    type="file"
                    name="documents"
                    onChange={handleShopFormChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowShopForm(false)}
                    className="flex-1 px-4 py-2 text-[#7077A1] hover:text-[#2D3250] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;