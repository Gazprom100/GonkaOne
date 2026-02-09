import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TelegramAuth = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('start');

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Get user data from Telegram
      const initData = tg.initDataUnsafe;
      
      if (initData?.user && !isAuthenticated) {
        const telegramData = {
          id: initData.user.id,
          first_name: initData.user.first_name,
          last_name: initData.user.last_name,
          username: initData.user.username,
          photo_url: initData.user.photo_url
        };

        login(telegramData).then((result) => {
          if (result.success && referralCode) {
            // Register referral if code provided
            registerReferral(referralCode, telegramData.id);
          }
        });
      }
    }
  }, []);

  const registerReferral = async (code, userId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/referrals/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          referralCode: code
        })
      });
    } catch (error) {
      console.error('Error registering referral:', error);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      color: 'var(--text-secondary)'
    }}>
      <p>Откройте приложение через Telegram бота</p>
    </div>
  );
};

export default TelegramAuth;

