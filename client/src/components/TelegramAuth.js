import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const TelegramAuth = () => {
  const { login, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('start');

  const registerReferral = useCallback(async (code, userId) => {
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
  }, []);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Enable closing confirmation
      tg.enableClosingConfirmation();
      
      // Set theme colors
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
      
      // Set viewport height for Telegram
      const setViewportHeight = () => {
        const vh = tg.viewportHeight || window.innerHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${tg.safeAreaInsets?.top || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${tg.safeAreaInsets?.bottom || 0}px`);
      };
      
      setViewportHeight();
      tg.onEvent('viewportChanged', setViewportHeight);
      
      // Disable scroll on body when in Telegram
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      // Get user data from Telegram
      const initData = tg.initDataUnsafe;
      
      console.log('Telegram WebApp initialized', {
        platform: tg.platform,
        version: tg.version,
        hasUser: !!initData?.user
      });
      
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
    } else {
      console.warn('Telegram WebApp not available - open this app through Telegram bot');
    }
  }, [isAuthenticated, login, referralCode, registerReferral]);


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

