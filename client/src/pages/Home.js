import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="home-page">
      <div className="container">
        {/* Language Selector - Hidden in Telegram */}
        {!window.Telegram?.WebApp && (
          <div className={`language-selector ${isVisible ? 'animate-slide-in-up' : ''}`} style={{ animationDelay: '0.1s' }}>
            <button className="lang-btn active">RU</button>
            <button className="lang-btn">EN</button>
            <button className="lang-btn">ZH</button>
            <button className="lang-btn">ES</button>
          </div>
        )}

        {/* Hero Section - Ultra Premium */}
        <section className={`hero-section ${isVisible ? 'animate-fade-in-scale' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="hero-content">
            <h1 className="hero-title animate-pulse-glow">
              GONKA ONE
            </h1>
            <p className="hero-subtitle">
              Премиум платформа для коллективного майнинга токенов GNK
            </p>
            <div className="hero-cta">
              <Link to="/mining" className="btn btn-primary btn-lg">
                Начать майнинг
              </Link>
              <Link to="/referrals" className="btn btn-secondary btn-lg">
                Реферальная программа
              </Link>
            </div>
          </div>
          
          {/* Animated Background Elements */}
          <div className="hero-bg-elements">
            <div className="bg-orb bg-orb-1 animate-float-slow"></div>
            <div className="bg-orb bg-orb-2 animate-float-slow" style={{ animationDelay: '1s' }}></div>
            <div className="bg-orb bg-orb-3 animate-float-slow" style={{ animationDelay: '2s' }}></div>
          </div>
        </section>

        {/* Compact content for Telegram */}
        {window.Telegram?.WebApp ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', height: '100%' }}>
            <div className="telegram-quick-info card-ultra" style={{ padding: 'var(--space-sm) var(--space-md)', margin: 0 }}>
              <p style={{ fontSize: 'var(--text-xs)', margin: 0, textAlign: 'center', lineHeight: '1.3' }}>
                <span className="brand-name">GonkaOne</span> — коллективный пул по добыче токена GNK
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexDirection: 'column' }}>
              <Link to="/mining" className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--text-xs)' }}>
                Начать майнинг
              </Link>
              <Link to="/referrals" className="btn btn-secondary" style={{ width: '100%', padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--text-xs)' }}>
                Рефералы
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* About Section - Premium */}
            <section className={`about-section ${isVisible ? 'animate-slide-in-up' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="about-content">
                <h2 className="about-title">О майнинг-пуле</h2>
                <p className="about-description">
                  <span className="brand-name">GonkaOne</span> — это коллективный пул по добыче токена GNK проекта Gonka братьев Либерман. 
                  Присоединяйтесь к сообществу и получайте пассивный доход от майнинга.
                </p>
                <button className="btn btn-ghost btn-lg">
                  Подробнее
                </button>
              </div>
            </section>

            {/* How it Works - Premium */}
            <section className={`how-it-works ${isVisible ? 'animate-slide-in-up' : ''}`} style={{ animationDelay: '0.6s' }}>
              <h2 className="how-it-works-title">Как это работает</h2>
              <ol className="steps-list">
                <li className="step-item card-ultra">
                  <div className="step-number-wrapper">
                    <span className="step-number">1</span>
                  </div>
                  <span className="step-text">Выберите пул в разделе Майнинг и инвестируйте в него</span>
                </li>
                <li className="step-item card-ultra">
                  <div className="step-number-wrapper">
                    <span className="step-number">2</span>
                  </div>
                  <span className="step-text">Оплатите инвестицию в USDT или USDC</span>
                </li>
                <li className="step-item card-ultra">
                  <div className="step-number-wrapper">
                    <span className="step-number">3</span>
                  </div>
                  <span className="step-text">Токен Gonka добывается в течение 30 дней автоматически</span>
                </li>
                <li className="step-item card-ultra">
                  <div className="step-number-wrapper">
                    <span className="step-number">4</span>
                  </div>
                  <span className="step-text">Укажите свой кошелек в сети Gonka в разделе Профиль для получения токенов</span>
                </li>
              </ol>
              <div className="cta-primary">
                <Link to="/mining" className="btn btn-primary btn-xl">
                  Перейти в Майнинг
                </Link>
              </div>
            </section>

            {/* Promo Banner - Ultra Premium */}
            <section className={`promo-section ${isVisible ? 'animate-fade-in-scale' : ''}`} style={{ animationDelay: '0.8s' }}>
              <div className="promo-banner card-ultra">
                <div className="promo-content">
                  <h2 className="promo-title">GONKA ONE</h2>
                  <p className="promo-text">
                    Децентрализованная платформа для коллективного майнинга с реферальной программой
                  </p>
                  <div className="promo-features">
                    <div className="feature-item">
                      <span className="feature-text">Безопасно</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-text">Быстро</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-text">Надежно</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
