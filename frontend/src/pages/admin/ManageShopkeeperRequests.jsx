import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance'; // Assuming the configured axios instance is here
import BackButton from '../../components/common/BackButton';
import { toast } from 'react-hot-toast';

const ManageShopkeeperRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetch function outside useEffect
  const fetchShopkeeperRequests = async () => {
    try {
      const response = await api.get('/api/users/shopkeeper/requests');
      setRequests(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching shopkeeper requests:', err);
      setError('Failed to load shopkeeper requests.');
      setIsLoading(false);
      toast.error('Failed to load shopkeeper requests.');
    }
  };

  useEffect(() => {
    fetchShopkeeperRequests(); // Call the function inside useEffect
  }, []);

  // Handle approving or rejecting a request
  const handleUpdateStatus = async (id, status) => {
    // You might want to add a confirmation dialog here
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) {
      return;
    }

    try {
      // If rejecting, you might want to prompt for a rejection reason
      let rejectionReason = null;
      if (status === 'rejected') {
         rejectionReason = prompt('Please provide a reason for rejection (optional):');
         // User might cancel the prompt
         if (rejectionReason === null) {
            return; 
         }
      }

      await api.put(`/api/users/shopkeeper/${id}/status`, { status, rejectionReason });
      toast.success(`Request ${status} successfully!`);
      // Refresh the list after updating
      fetchShopkeeperRequests(); // Re-fetch all requests
    } catch (err) {
      console.error(`Error updating request status to ${status}:`, err);
      toast.error(`Failed to ${status} request.`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2D3250]">Manage Shopkeeper Requests</h1>
        <BackButton />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F76E11]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-[#7077A1] py-12">No pending shopkeeper requests.</div>
      ) : (
        <div className="space-y-6">
          {/* Render list of requests here */}
          {requests.map(request => (
            <div key={request._id} className="card p-6">
              <h2 className="text-xl font-semibold text-[#2D3250] mb-2">{request.name}</h2>
              <p className="text-[#7077A1] mb-1">Email: {request.email}</p>
              <p className="text-[#7077A1] mb-1">Status: {request.shopkeeperStatus}</p>
              
              {/* Display more shopkeeper details */}
              <div className="mt-4 space-y-2 text-sm text-[#7077A1]">
                <p><strong>Business Name:</strong> {request.shopkeeperDetails?.businessName}</p>
                <p><strong>Business Type:</strong> {request.shopkeeperDetails?.businessType}</p>
                <p><strong>Business Address:</strong> {request.shopkeeperDetails?.businessAddress}</p>
                <p><strong>Business Phone:</strong> {request.shopkeeperDetails?.businessPhone}</p>
                <p><strong>Business Email:</strong> {request.shopkeeperDetails?.businessEmail}</p>
                <p><strong>GST Number:</strong> {request.shopkeeperDetails?.gstNumber}</p>
                <p><strong>Opening Hours:</strong> {request.shopkeeperDetails?.openingHours}</p>
                <p><strong>Shop Description:</strong> {request.shopkeeperDetails?.shopDescription}</p>
                {/* You might want to add a link to view documents if applicable */}
              </div>

              {/* Action Buttons */}
              {request.shopkeeperStatus === 'pending' && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'approved')}
                    className="btn-primary flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'rejected')}
                    className="px-4 py-2 text-[#FF5252] border border-[#FF5252] rounded-md flex-1 hover:bg-[#FF5252] hover:text-white transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageShopkeeperRequests; 