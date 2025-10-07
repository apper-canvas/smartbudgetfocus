import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import Sidebar from '@/components/organisms/Sidebar';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailAddress: user.emailAddress || '',
        phoneNumber: user.phoneNumber || '',
        companyName: user.accounts?.[0]?.companyName || ''
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.emailAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Note: This is prepared for future backend integration
      // When user update endpoint is available through ApperClient,
      // implement the actual API call here
      
      // Simulated save for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error?.response?.data?.message || error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      emailAddress: user.emailAddress || '',
      phoneNumber: user.phoneNumber || '',
      companyName: user.accounts?.[0]?.companyName || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Loading user information...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
              <p className="text-slate-600 mt-1">Manage your personal information and account settings</p>
            </div>

            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-slate-600">{formData.emailAddress}</p>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Edit" size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <Label htmlFor="emailAddress">
                      Email Address <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="emailAddress"
                      name="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={true}
                      className="bg-slate-50"
                      placeholder="Company name"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Company information is managed by your organization administrator
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <ApperIcon name="Loader2" size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="Save" size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Information */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">User ID</span>
                  <span className="text-slate-800 font-medium">{user.userId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Company ID</span>
                  <span className="text-slate-800 font-medium">{user.companyId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Account Type</span>
                  <span className="text-slate-800 font-medium">
                    {user.accounts?.[0]?.accountType || 'Standard'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;