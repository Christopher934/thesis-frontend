'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Edit3, Save, X, User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  occupation: string;
  bio: string;
  avatar: string | null;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [tempData, setTempData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Gagal memuat profil');
        const data = await res.json();
        setProfileData(data);
        setTempData(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi Kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (): void => {
    if (profileData) {
      setIsEditing(true);
      setTempData({ ...profileData });
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!tempData) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tempData),
      });
      if (!res.ok) throw new Error('Gagal menyimpan profil');
      const data = await res.json();
      setProfileData(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Terjadi Kesalahan Saat Menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    if (profileData) {
      setTempData({ ...profileData });
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string): void => {
    setTempData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempData(prev => prev ? { ...prev, avatar: result } : prev);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className=" w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex justify-center items-start py-8 px-2 sm:px-4">
      <div className="w-full max-w-5xl">
        {/* Loading & Error */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}
        {!loading && !profileData && (
          <div className="text-center text-gray-500 py-8">Data profil tidak ditemukan.</div>
        )}
        {/* Header */}
        {profileData && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-8 py-8 sm:py-12 text-white relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                      {(isEditing ? tempData?.avatar : profileData?.avatar) ? (
                        <Image 
                          src={isEditing ? tempData?.avatar! : profileData?.avatar!} 
                          alt="Profile" 
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold mb-1 truncate drop-shadow-sm">
                      {isEditing ? tempData?.name : profileData?.name}
                    </h1>
                    <p className="text-blue-100 text-lg font-semibold tracking-wide truncate uppercase">
                      {isEditing ? tempData?.occupation : profileData?.occupation}
                    </p>
                  </div>
                </div>
                {/* Edit Button */}
                <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all backdrop-blur-sm text-base font-semibold shadow-md"
                      type="button"
                      disabled={loading}
                    >
                      <Edit3 className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="bg-red-500/80 hover:bg-red-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all text-base font-semibold shadow-md"
                        type="button"
                        disabled={loading}
                      >
                        <X className="w-5 h-5" />
                        <span>Batal</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-green-500/80 hover:bg-green-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all text-base font-semibold shadow-md disabled:opacity-60"
                        type="button"
                        disabled={loading}
                      >
                        <Save className="w-5 h-5" />
                        <span>Simpan</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Profile Details */}
        {profileData && (
          <div className="">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                Informasi Pribadi
              </h2>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nama Lengkap
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData?.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50"
                      required
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {profileData.name}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData?.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50"
                      required
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {profileData.email}
                    </p>
                  )}
                </div>
                {/* Phone */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    Nomor Telepon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {profileData.phone}
                    </p>
                  )}
                </div>
                {/* Birth Date */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Tanggal Lahir
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tempData?.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {formatDate(profileData.birthDate)}
                    </p>
                  )}
                </div>
                {/* Occupation */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Pekerjaan
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData?.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {profileData.occupation}
                    </p>
                  )}
                </div>
                {/* Address */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    Alamat
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData?.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-base bg-gray-50"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold py-3 px-4 bg-gray-50 rounded-xl">
                      {profileData.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Stats Section */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;