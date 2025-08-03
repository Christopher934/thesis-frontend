'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Star, CheckCircle, XCircle, Users, MapPin } from 'lucide-react';

interface AvailablePartner {
  userId: number;
  name: string;
  employeeId: string;
  role: string;
  currentShifts: ShiftInfo[];
  availability: {
    isAvailable: boolean;
    reason?: string;
    nextAvailableDate?: string;
  };
  compatibility: {
    score: number;
    skillMatch: boolean;
    locationPreference: boolean;
    workloadBalance: number;
  };
  suggestedSwaps: {
    shiftId: number;
    date: string;
    time: string;
    location: string;
    mutualBenefit: string;
  }[];
}

interface ShiftInfo {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
}

interface SmartPartnerSelectorProps {
  selectedShiftId: number;
  onPartnerSelect: (partnerId: number, suggestedSwapId?: number) => void;
  onClose: () => void;
}

const SmartPartnerSelector: React.FC<SmartPartnerSelectorProps> = ({
  selectedShiftId,
  onPartnerSelect,
  onClose,
}) => {
  const [partners, setPartners] = useState<AvailablePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (selectedShiftId) {
      fetchAvailablePartners();
    }
  }, [selectedShiftId]);

  const fetchAvailablePartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/smart-swap/available-partners?shiftId=${selectedShiftId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Finding available partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="mr-2" />
            Smart Partner Selection
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex bg-blue-500 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white text-blue-600' : 'text-white'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-white text-blue-600' : 'text-white'}`}
              >
                Calendar
              </button>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {partners.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No available partners found</p>
                </div>
              ) : (
                partners.map((partner) => (
                  <div
                    key={partner.userId}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPartner === partner.userId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!partner.availability.isAvailable ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedPartner(partner.userId)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{partner.name}</h3>
                          <p className="text-gray-600">{partner.employeeId} • {partner.role}</p>
                        </div>
                      </div>
                      
                      {/* Availability Status */}
                      <div className="flex items-center space-x-2">
                        {partner.availability.isAvailable ? (
                          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            Busy
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compatibility Score */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Compatibility: {partner.compatibility.score}%</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(partner.compatibility.score)}`}>
                          {getCompatibilityText(partner.compatibility.score)}
                        </span>
                      </div>
                    </div>

                    {/* Compatibility Details */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {partner.compatibility.skillMatch && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          🎯 Skill Match
                        </span>
                      )}
                      {partner.compatibility.locationPreference && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          📍 Location Familiar
                        </span>
                      )}
                      {partner.compatibility.workloadBalance > 5 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          ⚖️ Balanced Workload
                        </span>
                      )}
                    </div>

                    {/* Current Shifts */}
                    {partner.currentShifts.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Upcoming Shifts:</p>
                        <div className="space-y-1">
                          {partner.currentShifts.slice(0, 3).map((shift) => (
                            <div key={shift.id} className="text-xs bg-gray-50 p-2 rounded flex items-center space-x-2">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span>{shift.date}</span>
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span>{shift.startTime}-{shift.endTime}</span>
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span>{shift.location}</span>
                            </div>
                          ))}
                          {partner.currentShifts.length > 3 && (
                            <p className="text-xs text-gray-500">+ {partner.currentShifts.length - 3} more shifts</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Suggested Swaps */}
                    {partner.suggestedSwaps.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">💡 Suggested Mutual Swaps:</p>
                        <div className="space-y-1">
                          {partner.suggestedSwaps.map((swap) => (
                            <div
                              key={swap.shiftId}
                              className="text-xs bg-yellow-50 border border-yellow-200 p-2 rounded cursor-pointer hover:bg-yellow-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPartnerSelect(partner.userId, swap.shiftId);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{swap.date} • {swap.time} • {swap.location}</span>
                                <span className="text-yellow-600">→</span>
                              </div>
                              <p className="text-yellow-700 mt-1">{swap.mutualBenefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unavailability Reason */}
                    {!partner.availability.isAvailable && partner.availability.reason && (
                      <div className="bg-red-50 border border-red-200 p-2 rounded">
                        <p className="text-sm text-red-700">
                          <strong>Unavailable:</strong> {partner.availability.reason}
                        </p>
                        {partner.availability.nextAvailableDate && (
                          <p className="text-xs text-red-600 mt-1">
                            Next available: {partner.availability.nextAvailableDate}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {partner.availability.isAvailable && selectedPartner === partner.userId && (
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPartnerSelect(partner.userId);
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                          Select {partner.name} as Swap Partner
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <AvailabilityCalendar />
          )}
        </div>
      </div>
    </div>
  );
};

// Calendar view component
const AvailabilityCalendar: React.FC = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-center text-gray-600">Calendar view coming soon...</p>
      <p className="text-center text-sm text-gray-500 mt-2">
        This will show a visual calendar with color-coded availability for all staff members
      </p>
    </div>
  );
};

export default SmartPartnerSelector;
