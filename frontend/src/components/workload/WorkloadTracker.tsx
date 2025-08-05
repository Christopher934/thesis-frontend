'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar, User } from 'lucide-react';

interface WorkloadData {
    userId: number;
    employeeId: string;
    name: string;
    role: string;
    currentHours: number;
    maxHours: number;
    currentShifts: number;
    maxShifts: number;
    weeklyHours: number;
    monthlyTarget: number;
    utilizationRate: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OVERWORK';
    consecutiveDays: number;
    maxConsecutiveDays: number;
    lastShiftDate: string;
    overtimeRequests: number;
    approvedOvertime: number;
}

interface WorkloadTrackerProps {
    compact?: boolean;
    userId?: number;
    showDetails?: boolean;
}

const WorkloadTracker: React.FC<WorkloadTrackerProps> = ({ 
    compact = false, 
    userId = null, 
    showDetails = true 
}) => {
    const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');

    // Mock data - In production, this would come from API
    useEffect(() => {
        const mockData: WorkloadData[] = [
            {
                userId: 1,
                employeeId: 'DOK001',
                name: 'Dr. Ahmad Susanto',
                role: 'DOKTER',
                currentHours: 120,
                maxHours: 160,
                currentShifts: 15,
                maxShifts: 20,
                weeklyHours: 42,
                monthlyTarget: 140,
                utilizationRate: 75,
                status: 'NORMAL',
                consecutiveDays: 3,
                maxConsecutiveDays: 5,
                lastShiftDate: '2025-07-27',
                overtimeRequests: 2,
                approvedOvertime: 8
            },
            {
                userId: 2,
                employeeId: 'PER001',
                name: 'Ns. Sarah Wijaya',
                role: 'PERAWAT',
                currentHours: 145,
                maxHours: 160,
                currentShifts: 18,
                maxShifts: 20,
                weeklyHours: 48,
                monthlyTarget: 140,
                utilizationRate: 91,
                status: 'WARNING',
                consecutiveDays: 4,
                maxConsecutiveDays: 5,
                lastShiftDate: '2025-07-28',
                overtimeRequests: 1,
                approvedOvertime: 12
            },
            {
                userId: 3,
                employeeId: 'PER002',
                name: 'Ns. Budi Hartono',
                role: 'PERAWAT',
                currentHours: 170,
                maxHours: 160,
                currentShifts: 22,
                maxShifts: 20,
                weeklyHours: 52,
                monthlyTarget: 140,
                utilizationRate: 106,
                status: 'CRITICAL',
                consecutiveDays: 6,
                maxConsecutiveDays: 5,
                lastShiftDate: '2025-07-28',
                overtimeRequests: 3,
                approvedOvertime: 16
            }
        ];

        setWorkloadData(userId ? mockData.filter(d => d.userId === userId) : mockData);
        setLoading(false);
    }, [userId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NORMAL': return 'text-green-600 bg-green-100';
            case 'WARNING': return 'text-yellow-600 bg-yellow-100';
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            case 'OVERWORK': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getProgressBarColor = (utilizationRate: number) => {
        if (utilizationRate <= 75) return 'bg-green-500';
        if (utilizationRate <= 90) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NORMAL': return <CheckCircle className="w-4 h-4" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
            case 'CRITICAL': return <AlertTriangle className="w-4 h-4" />;
            case 'OVERWORK': return <TrendingUp className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        );
    }

    if (compact) {
        const totalUsers = workloadData.length;
        const criticalUsers = workloadData.filter(d => d.status === 'CRITICAL' || d.status === 'OVERWORK').length;
        const warningUsers = workloadData.filter(d => d.status === 'WARNING').length;
        const avgUtilization = Math.round(workloadData.reduce((sum, d) => sum + d.utilizationRate, 0) / totalUsers);

        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        Workload Overview
                    </h3>
                    <span className="text-sm text-gray-500">{totalUsers} pegawai</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{avgUtilization}%</div>
                        <div className="text-xs text-gray-600">Avg Utilization</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-orange-600">{criticalUsers + warningUsers}</div>
                        <div className="text-xs text-gray-600">Need Attention</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Workload Tracker</h2>
                            <p className="text-sm text-gray-600">Monitor jam kerja dan beban kerja pegawai</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {workloadData.length}
                                </div>
                                <div className="text-sm text-blue-700">Total Pegawai</div>
                            </div>
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {workloadData.filter(d => d.status === 'NORMAL').length}
                                </div>
                                <div className="text-sm text-green-700">Normal</div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {workloadData.filter(d => d.status === 'WARNING').length}
                                </div>
                                <div className="text-sm text-yellow-700">Warning</div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {workloadData.filter(d => d.status === 'CRITICAL' || d.status === 'OVERWORK').length}
                                </div>
                                <div className="text-sm text-red-700">Critical</div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Workload List */}
            {showDetails && (
                <div className="p-6">
                    <div className="space-y-4">
                        {workloadData.map((employee) => (
                            <div key={employee.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${getStatusColor(employee.status)}`}>
                                            {getStatusIcon(employee.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                                            <p className="text-sm text-gray-600">{employee.employeeId} • {employee.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                            {employee.status}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {employee.utilizationRate}% utilized
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Hours Progress */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Jam Kerja Bulan Ini</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {employee.currentHours}/{employee.maxHours} jam
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressBarColor(employee.utilizationRate)}`}
                                                style={{ width: `${Math.min(employee.utilizationRate, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            Target: {employee.monthlyTarget} jam
                                        </div>
                                    </div>

                                    {/* Shifts Progress */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Shift Bulan Ini</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {employee.currentShifts}/{employee.maxShifts} shift
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressBarColor((employee.currentShifts / employee.maxShifts) * 100)}`}
                                                style={{ width: `${Math.min((employee.currentShifts / employee.maxShifts) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            Hari berturut-turut: {employee.consecutiveDays}/{employee.maxConsecutiveDays}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Minggu ini:</span>
                                                <span className="font-medium">{employee.weeklyHours} jam</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Overtime:</span>
                                                <span className="font-medium">{employee.approvedOvertime} jam</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Last shift:</span>
                                                <span className="font-medium">
                                                    {new Date(employee.lastShiftDate).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {(employee.status === 'WARNING' || employee.status === 'CRITICAL') && (
                                    <div className={`mt-3 p-3 rounded-lg border-l-4 ${
                                        employee.status === 'WARNING' 
                                            ? 'bg-yellow-50 border-yellow-400' 
                                            : 'bg-red-50 border-red-400'
                                    }`}>
                                        <div className={`flex items-center ${
                                            employee.status === 'WARNING' 
                                                ? 'text-yellow-800' 
                                                : 'text-red-800'
                                        }`}>
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            <span className="font-medium">
                                                {employee.status === 'WARNING' 
                                                    ? 'Peringatan Beban Kerja' 
                                                    : 'Beban Kerja Kritis'}
                                            </span>
                                        </div>
                                        <p className={`text-sm mt-1 ${
                                            employee.status === 'WARNING' 
                                                ? 'text-yellow-700' 
                                                : 'text-red-700'
                                        }`}>
                                            {employee.status === 'WARNING' 
                                                ? 'Pegawai mendekati batas maksimal jam kerja. Monitor dengan ketat.'
                                                : 'Pegawai telah melebihi batas maksimal. Berikan istirahat segera!'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkloadTracker;
