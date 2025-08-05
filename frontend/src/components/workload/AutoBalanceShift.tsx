'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Users, Calendar, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ShiftBalance {
    employeeId: string;
    name: string;
    role: string;
    shifts: {
        PAGI: number;
        SIANG: number;
        MALAM: number;
    };
    totalShifts: number;
    balanceScore: number; // 0-100, higher is better balanced
    recommendations: string[];
    lastShiftType: string;
    consecutiveSameType: number;
}

interface AutoBalanceShiftProps {
    onRebalance?: (balancePlan: ShiftBalance[]) => void;
    showDetails?: boolean;
}

const AutoBalanceShift: React.FC<AutoBalanceShiftProps> = ({ 
    onRebalance,
    showDetails = true 
}) => {
    const [shiftBalances, setShiftBalances] = useState<ShiftBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRebalancing, setIsRebalancing] = useState(false);
    const [rebalanceResult, setRebalanceResult] = useState<any>(null);

    // Mock data - In production, this would come from API
    useEffect(() => {
        const mockData: ShiftBalance[] = [
            {
                employeeId: 'DOK001',
                name: 'Dr. Ahmad Susanto',
                role: 'DOKTER',
                shifts: { PAGI: 8, SIANG: 5, MALAM: 2 },
                totalShifts: 15,
                balanceScore: 65,
                recommendations: ['Perlu lebih banyak shift malam', 'Distribusi tidak merata'],
                lastShiftType: 'PAGI',
                consecutiveSameType: 3
            },
            {
                employeeId: 'PER001',
                name: 'Ns. Sarah Wijaya',
                role: 'PERAWAT',
                shifts: { PAGI: 6, SIANG: 6, MALAM: 6 },
                totalShifts: 18,
                balanceScore: 95,
                recommendations: ['Distribusi sudah optimal'],
                lastShiftType: 'MALAM',
                consecutiveSameType: 1
            },
            {
                employeeId: 'PER002',
                name: 'Ns. Budi Hartono',
                role: 'PERAWAT',
                shifts: { PAGI: 2, SIANG: 8, MALAM: 8 },
                totalShifts: 18,
                balanceScore: 72,
                recommendations: ['Perlu lebih banyak shift pagi', 'Terlalu banyak shift malam berturut-turut'],
                lastShiftType: 'MALAM',
                consecutiveSameType: 4
            },
            {
                employeeId: 'STF001',
                name: 'Ahmad Wijaya',
                role: 'STAF',
                shifts: { PAGI: 10, SIANG: 3, MALAM: 0 },
                totalShifts: 13,
                balanceScore: 45,
                recommendations: ['Sangat tidak seimbang', 'Perlu rotasi ke shift siang dan malam'],
                lastShiftType: 'PAGI',
                consecutiveSameType: 5
            }
        ];

        setShiftBalances(mockData);
        setLoading(false);
    }, []);

    const getBalanceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getBalanceStatus = (score: number) => {
        if (score >= 80) return 'Seimbang';
        if (score >= 60) return 'Cukup Seimbang';
        return 'Tidak Seimbang';
    };

    const calculateOptimalDistribution = (totalShifts: number) => {
        const base = Math.floor(totalShifts / 3);
        const remainder = totalShifts % 3;
        
        return {
            PAGI: base + (remainder > 0 ? 1 : 0),
            SIANG: base + (remainder > 1 ? 1 : 0),
            MALAM: base
        };
    };

    const generateRebalancePlan = async () => {
        setIsRebalancing(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const rebalancedData = shiftBalances.map(employee => {
            const optimal = calculateOptimalDistribution(employee.totalShifts);
            const newBalanceScore = Math.min(95, employee.balanceScore + Math.random() * 30);
            
            return {
                ...employee,
                shifts: optimal,
                balanceScore: newBalanceScore,
                recommendations: newBalanceScore >= 80 
                    ? ['Distribusi optimal tercapai'] 
                    : ['Perlu penyesuaian minor']
            };
        });

        setRebalanceResult({
            originalAverage: Math.round(shiftBalances.reduce((sum, emp) => sum + emp.balanceScore, 0) / shiftBalances.length),
            newAverage: Math.round(rebalancedData.reduce((sum, emp) => sum + emp.balanceScore, 0) / rebalancedData.length),
            improvementCount: rebalancedData.filter((emp, index) => emp.balanceScore > shiftBalances[index].balanceScore).length,
            rebalancedEmployees: rebalancedData
        });

        setIsRebalancing(false);
        
        if (onRebalance) {
            onRebalance(rebalancedData);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        );
    }

    const averageBalance = Math.round(shiftBalances.reduce((sum, emp) => sum + emp.balanceScore, 0) / shiftBalances.length);
    const needsRebalancing = shiftBalances.filter(emp => emp.balanceScore < 70).length;

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <RotateCcw className="w-6 h-6 mr-3 text-purple-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Auto-Balance Shift</h2>
                            <p className="text-sm text-gray-600">Sistem rotasi shift otomatis untuk distribusi yang adil</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{averageBalance}%</div>
                            <div className="text-sm text-gray-600">Rata-rata Balance</div>
                        </div>
                        <button
                            onClick={generateRebalancePlan}
                            disabled={isRebalancing}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {isRebalancing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <RotateCcw className="w-4 h-4" />
                            )}
                            <span>{isRebalancing ? 'Rebalancing...' : 'Auto Rebalance'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {shiftBalances.filter(emp => emp.balanceScore >= 80).length}
                                </div>
                                <div className="text-sm text-purple-700">Seimbang</div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {shiftBalances.filter(emp => emp.balanceScore >= 60 && emp.balanceScore < 80).length}
                                </div>
                                <div className="text-sm text-yellow-700">Cukup Seimbang</div>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {needsRebalancing}
                                </div>
                                <div className="text-sm text-red-700">Perlu Rebalance</div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.round(shiftBalances.reduce((sum, emp) => sum + emp.totalShifts, 0) / shiftBalances.length)}
                                </div>
                                <div className="text-sm text-blue-700">Avg Shifts/Bulan</div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rebalance Result */}
            {rebalanceResult && (
                <div className="p-6 border-b border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <h3 className="font-semibold text-green-800">Rebalance Plan Generated</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    {rebalanceResult.originalAverage}% → {rebalanceResult.newAverage}%
                                </div>
                                <div className="text-green-700">Balance Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    {rebalanceResult.improvementCount}
                                </div>
                                <div className="text-green-700">Pegawai Diperbaiki</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    +{rebalanceResult.newAverage - rebalanceResult.originalAverage}%
                                </div>
                                <div className="text-green-700">Peningkatan</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Balance Details */}
            {showDetails && (
                <div className="p-6">
                    <div className="space-y-4">
                        {(rebalanceResult?.rebalancedEmployees || shiftBalances).map((employee) => (
                            <div key={employee.employeeId} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${getBalanceColor(employee.balanceScore)}`}>
                                            <RotateCcw className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                                            <p className="text-sm text-gray-600">{employee.employeeId} • {employee.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBalanceColor(employee.balanceScore)}`}>
                                            {getBalanceStatus(employee.balanceScore)} ({employee.balanceScore}%)
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {employee.totalShifts} total shifts
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Shift Distribution */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">Distribusi Shift</h4>
                                        <div className="space-y-2">
                                            {Object.entries(employee.shifts).map(([shiftType, count]) => {
                                                const optimal = calculateOptimalDistribution(employee.totalShifts);
                                                const optimalCount = optimal[shiftType as keyof typeof optimal];
                                                const percentage = employee.totalShifts > 0 ? (Number(count) / employee.totalShifts) * 100 : 0;
                                                const isOptimal = Math.abs(Number(count) - optimalCount) <= 1;
                                                
                                                return (
                                                    <div key={shiftType} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-700">{shiftType}:</span>
                                                            <span className={`text-sm ${isOptimal ? 'text-green-600' : 'text-red-600'}`}>
                                                                {Number(count)} ({Math.round(percentage)}%)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${isOptimal ? 'bg-green-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">→{optimalCount}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-3">Rekomendasi</h4>
                                        <div className="space-y-2">
                                            {employee.recommendations.map((rec, index) => (
                                                <div key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                                    <span className="text-blue-600 mt-0.5">•</span>
                                                    <span>{rec}</span>
                                                </div>
                                            ))}
                                            
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <div>Last shift: <span className="font-medium">{employee.lastShiftType}</span></div>
                                                    <div>Consecutive same type: <span className="font-medium">{employee.consecutiveSameType}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        💡 <strong>Tips:</strong> Sistem akan otomatis menyeimbangkan distribusi shift untuk menghindari burnout dan memastikan rotasi yang adil.
                    </div>
                    
                    {needsRebalancing > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{needsRebalancing} pegawai perlu rebalancing</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoBalanceShift;
