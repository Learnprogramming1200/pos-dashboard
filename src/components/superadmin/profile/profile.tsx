"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaUser } from "react-icons/fa6";
import { Camera, Check, X } from 'lucide-react';
import { FaRegEdit } from "react-icons/fa";
import { type Profile } from '@/types/Profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Profile() {
  // Mock data matching the image
  const [profile, setProfile] = useState<Profile>({
    id: "1",
    firstName: "Christopher",
    lastName: "Tran",
    fullName: "Christopher Tran",
    email: "christopher@gmail.com",
    phoneNumber: "+1 256-652-5624",
    dateOfBirth: "1990-10-12",
    userRole: "Admin",
    location: "Leeds, United Kingdom",
    avatar: "",
    address: {
      country: "United Kingdom",
      state: "England",
      city: "Leeds",
      postalCode: "LS1 1AA"
    }
  });

  // Edit states for each section
  const [isPersonalInfoEditing, setIsPersonalInfoEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [editForm, setEditForm] = useState<Profile>({ ...profile });

  const startPersonalInfoEdit = () => {
    setEditForm({ ...profile });
    setIsPersonalInfoEditing(true);
  };

  const startAddressEdit = () => {
    setEditForm({ ...profile });
    setIsAddressEditing(true);
  };

  const savePersonalInfo = () => {
    setProfile((prev: Profile) => ({
      ...prev,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      fullName: `${editForm.firstName} ${editForm.lastName}`,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber,
      dateOfBirth: editForm.dateOfBirth
    }));
    setIsPersonalInfoEditing(false);
  };

  const saveAddress = () => {
    setProfile((prev: Profile) => ({
      ...prev,
      address: editForm.address
    }));
    setIsAddressEditing(false);
  };

  const cancelPersonalInfoEdit = () => {
    setIsPersonalInfoEditing(false);
    setEditForm({ ...profile });
  };

  const cancelAddressEdit = () => {
    setIsAddressEditing(false);
    setEditForm({ ...profile });
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage and configure your plans.</p>
      </div>

      {/* Main Content Wrapper */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Two Separate Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Profile Summary Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <div className="relative">
                <div data-testid="profile-avatar" className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      data-testid="profile-image"
                    />
                  ) : (
                    <FaUser className="w-6 h-6 text-gray-600 dark:text-gray-300" data-testid="profile-placeholder" />
                  )}
                </div>
                <button type="button" className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Camera className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-black">{profile.fullName}</h3>
                <p className="text-textSmall text-xs font-['Inter_Tight']">{profile.userRole}</p>
                <p className="text-textSmall text-xs font-['Inter_Tight']">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPersonalInfoEditing ? (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  onClick={startPersonalInfoEdit}
                >
                  <FaRegEdit className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={savePersonalInfo}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={cancelPersonalInfoEdit}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

          {/* Personal Information Details */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-black font-['Poppins']">Personal Information</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">First Name</span>
                  {isPersonalInfoEditing ? (
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm((prev: Profile) => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="text-black font-medium text-sm mt-1">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">Date of Birth</span>
                  {isPersonalInfoEditing ? (
                    <Input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm((prev: Profile) => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-1 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="text-black font-medium text-sm mt-1">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB').replace(/\//g, '-') : ''}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">Email Address</span>
                  {isPersonalInfoEditing ? (
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev: Profile) => ({ ...prev, email: e.target.value }))}
                      className="mt-1 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="text-black font-medium text-sm mt-1">{profile.email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">Last Name</span>
                  {isPersonalInfoEditing ? (
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm((prev: Profile) => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="text-black font-medium text-sm mt-1">{profile.lastName}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">Phone Number</span>
                  {isPersonalInfoEditing ? (
                    <Input
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm((prev: Profile) => ({ ...prev, phoneNumber: e.target.value }))}
                      className="mt-1 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="text-black font-medium text-sm mt-1">{profile.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-textSmall font-['Poppins']">User Role</span>
                  <p className="text-black font-medium text-sm mt-1">{profile.userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-black font-['Poppins']">Address</h4>
              {!isAddressEditing ? (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  onClick={startAddressEdit}
                >
                  <FaRegEdit className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={saveAddress}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={cancelAddressEdit}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-textSmall font-['Poppins']">Country</span>
                {isAddressEditing ? (
                  <Input
                    value={editForm.address.country}
                    onChange={(e) => setEditForm((prev: Profile) => ({ 
                      ...prev, 
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    className="mt-1 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="text-black font-medium text-sm mt-1">{profile.address.country}</p>
                )}
              </div>
              <div>
                <span className="text-xs text-textSmall font-['Poppins']">State</span>
                {isAddressEditing ? (
                  <Input
                    value={editForm.address.state}
                    onChange={(e) => setEditForm((prev: Profile) => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    className="mt-1 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="text-black font-medium text-sm mt-1">{profile.address.state}</p>
                )}
              </div>
              <div>
                <span className="text-xs text-textSmall font-['Poppins']">City</span>
                {isAddressEditing ? (
                  <Input
                    value={editForm.address.city}
                    onChange={(e) => setEditForm((prev: Profile) => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="mt-1 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="text-black font-medium text-sm mt-1">{profile.address.city}</p>
                )}
              </div>
              <div>
                <span className="text-xs text-textSmall font-['Poppins']">Postal Code</span>
                {isAddressEditing ? (
                  <Input
                    value={editForm.address.postalCode}
                    onChange={(e) => setEditForm((prev: Profile) => ({ 
                      ...prev, 
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    className="mt-1 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="text-black font-medium text-sm mt-1">{profile.address.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}