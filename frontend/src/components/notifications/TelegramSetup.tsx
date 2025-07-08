/**
 * TelegramSetup Component
 * Membantu user untuk setup koneksi Telegram mereka
 */
'use client';

import React, { useState, useEffect } from 'react';
import { ContentCard, PrimaryButton } from '@/components/ui';
import { MessageCircle, CheckCircle, AlertCircle, Copy, ExternalLink, QrCode, Smartphone } from 'lucide-react';

interface TelegramSetupProps {
  userId: number;
  currentChatId?: string;
  onChatIdUpdate?: (chatId: string) => void;
}

export function TelegramSetup({ userId, currentChatId, onChatIdUpdate }: TelegramSetupProps) {
  const [chatId, setChatId] = useState(currentChatId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [botInfo, setBotInfo] = useState<{username: string, name: string} | null>(null);

  // Bot info (ini akan didapat dari API/config)
  const BOT_USERNAME = 'rsud_anugerah_notif_bot'; // Sesuaikan dengan bot username Anda

  useEffect(() => {
    // Load bot info from API
    fetchBotInfo();
  }, []);

  const fetchBotInfo = async () => {
    try {
      // Implementasi untuk mendapatkan info bot dari backend
      setBotInfo({
        username: BOT_USERNAME,
        name: 'RSUD Anugerah Notification Bot'
      });
    } catch (error) {
      console.error('Failed to fetch bot info:', error);
    }
  };

  const handleSaveChatId = async () => {
    if (!chatId.trim()) {
      setMessage({type: 'error', text: 'Chat ID tidak boleh kosong'});
      return;
    }

    // Validasi format Chat ID (biasanya berupa angka)
    if (!/^-?\d+$/.test(chatId.trim())) {
      setMessage({type: 'error', text: 'Format Chat ID tidak valid. Chat ID harus berupa angka.'});
      return;
    }

    setIsLoading(true);
    try {
      // API call untuk menyimpan Chat ID
      const response = await fetch('/api/user/telegram-chat-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          userId, 
          telegramChatId: chatId.trim() 
        })
      });

      if (response.ok) {
        setMessage({type: 'success', text: 'Chat ID berhasil disimpan! Anda akan mulai menerima notifikasi Telegram.'});
        onChatIdUpdate?.(chatId.trim());
      } else {
        throw new Error('Gagal menyimpan Chat ID');
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Gagal menyimpan Chat ID. Silakan coba lagi.'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!currentChatId) {
      setMessage({type: 'error', text: 'Simpan Chat ID terlebih dahulu sebelum testing'});
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          userId,
          message: 'Test notifikasi dari RSUD Anugerah! 🏥✅' 
        })
      });

      if (response.ok) {
        setMessage({type: 'success', text: 'Notifikasi test berhasil dikirim! Periksa Telegram Anda.'});
      } else {
        throw new Error('Gagal mengirim notifikasi test');
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Gagal mengirim notifikasi test. Pastikan Chat ID benar.'});
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({type: 'info', text: 'Teks berhasil disalin!'});
  };

  const openTelegram = () => {
    if (botInfo?.username) {
      // Use deep link with start parameter for better UX
      const deepLink = `https://t.me/${botInfo.username}?start=rsud_setup_${userId}`;
      window.open(deepLink, '_blank');
    }
  };

  const generateQRCode = () => {
    if (botInfo?.username) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://t.me/${botInfo.username}?start=rsud_setup_${userId}`;
      return qrUrl;
    }
    return null;
  };

  const copyBotLink = () => {
    if (botInfo?.username) {
      const link = `https://t.me/${botInfo.username}?start=rsud_setup_${userId}`;
      navigator.clipboard.writeText(link);
      setMessage({type: 'info', text: 'Link bot berhasil disalin! Buka di Telegram.'});
    }
  };

  return (
    <ContentCard className="w-full max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-lg font-semibold">Setup Notifikasi Telegram</h2>
            <p className="text-sm text-gray-500">Hubungkan akun Telegram Anda untuk menerima notifikasi langsung</p>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Status:</span>
          {currentChatId ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <CheckCircle className="h-4 w-4" />
              Terhubung
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              Belum Terhubung
            </span>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mb-4 rounded-lg border bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Langkah Setup:</h3>
          <ol className="text-sm text-blue-800 list-decimal list-inside">
            <li>Klik tombol &quot;Buka Bot&quot; di bawah untuk membuka bot Telegram</li>
            <li>Kirim pesan <code className="rounded bg-blue-200 px-1">/start</code> ke bot</li>
            <li>Kirim pesan <code className="rounded bg-blue-200 px-1">/myid</code> untuk mendapatkan Chat ID</li>
            <li>Salin Chat ID dan masukkan di form bawah</li>
            <li>Klik &quot;Simpan Chat ID&quot; untuk menyelesaikan setup</li>
          </ol>
        </div>

        {/* Bot Info & Action */}
        {botInfo && (
          <div className="mb-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{botInfo.name}</div>
                <div className="text-sm text-gray-500">@{botInfo.username}</div>
              </div>
              <div className="flex gap-2">
                <PrimaryButton onClick={openTelegram} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka Bot
                </PrimaryButton>
                <PrimaryButton onClick={copyBotLink} variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </PrimaryButton>
              </div>
            </div>
            
            {/* Enhanced Setup Options */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Desktop Setup */}
              <div className="rounded-lg border bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center font-medium text-blue-900">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Setup dari Desktop
                </h4>
                <p className="mb-3 text-sm text-blue-700">
                  Klik tombol di bawah untuk langsung membuka bot di browser
                </p>
                <PrimaryButton onClick={openTelegram} className="w-full" size="sm">
                  Buka Telegram Web
                </PrimaryButton>
              </div>
              
              {/* Mobile Setup */}
              <div className="rounded-lg border bg-green-50 p-4">
                <h4 className="mb-2 flex items-center font-medium text-green-900">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Setup dari Mobile
                </h4>
                <p className="mb-3 text-sm text-green-700">
                  Scan QR code atau copy link untuk membuka di Telegram mobile
                </p>
                <div className="flex gap-2">
                  <PrimaryButton onClick={copyBotLink} variant="outline" size="sm" className="flex-1">
                    <Copy className="mr-1 h-4 w-4" />
                    Copy Link
                  </PrimaryButton>
                  {generateQRCode() && (
                    <PrimaryButton 
                      onClick={() => window.open(generateQRCode()!, '_blank')} 
                      variant="outline" 
                      size="sm"
                    >
                      <QrCode className="h-4 w-4" />
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat ID Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Chat ID Telegram</label>
          <div className="flex gap-2">
            <input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Masukkan Chat ID (contoh: 123456789)"
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            />
            <PrimaryButton 
              onClick={handleSaveChatId} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </PrimaryButton>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Chat ID adalah angka unik yang diberikan bot saat Anda mengirim /myid
          </p>
        </div>

        {/* Test Button */}
        {currentChatId && (
          <div className="pt-2">
            <PrimaryButton 
              onClick={handleTestNotification} 
              variant="outline" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Mengirim...' : 'Test Notifikasi'}
            </PrimaryButton>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={
            message.type === 'success' ? 'rounded-lg border border-green-200 bg-green-50 p-3' :
            message.type === 'error' ? 'rounded-lg border border-red-200 bg-red-50 p-3' :
            'rounded-lg border border-blue-200 bg-blue-50 p-3'
          }>
            <div className={
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {message.text}
            </div>
          </div>
        )}

        {/* Current Chat ID Display */}
        {currentChatId && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chat ID Tersimpan:</span>
              <div className="flex items-center gap-2">
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">{currentChatId}</code>
                <PrimaryButton 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(currentChatId)}
                >
                  <Copy className="h-3 w-3" />
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-xs text-gray-500">
          <p><strong>Bantuan:</strong></p>
          <p>• Jika bot tidak merespons, pastikan Anda sudah menekan tombol &quot;Start&quot;</p>
          <p>• Chat ID berupa angka panjang (bisa positif atau negatif)</p>
          <p>• Setelah setup, Anda akan menerima notifikasi untuk shift, cuti, dan lainnya</p>
        </div>
      </div>
    </ContentCard>
  );
}
