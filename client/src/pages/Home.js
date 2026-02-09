import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Telegram WebApp initialization is handled in TelegramAuth component

  return (
    <div className="home-page">
      <div className="container">
        {/* Language Selector */}
        <div className="language-selector">
          <button className="lang-btn active">RU</button>
          <button className="lang-btn">EN</button>
          <button className="lang-btn">ZH</button>
          <button className="lang-btn">ES</button>
        </div>

        {/* About Section */}
        <section className="section about-section">
          <h1 className="gradient-text">О майнинг-пуле</h1>
          <p className="description">
            <span className="neon-text">GonkaOne</span> — это коллективный пул по добыче токена GNK проекта Gonka братьев Либерман.
          </p>
          <button className="neon-button">Подробнее</button>
        </section>

        {/* How it Works */}
        <section className="section how-it-works">
          <h2 className="gradient-text">Как это работает</h2>
          <ol className="steps-list">
            <li className="step-item">
              <span className="step-number neon-text">1</span>
              <span className="step-text">Выберите пул в разделе Майнинг</span>
            </li>
            <li className="step-item">
              <span className="step-number neon-text-purple">2</span>
              <span className="step-text">Оплатите USDT / USDC</span>
            </li>
            <li className="step-item">
              <span className="step-number neon-text-green">3</span>
              <span className="step-text">Токен Gonka добывается в течение 30 дней</span>
            </li>
            <li className="step-item">
              <span className="step-number neon-text-pink">4</span>
              <span className="step-text">Укажите свой кошелек в сети Gonka в разделе Профиль</span>
            </li>
          </ol>
          <Link to="/mining" className="neon-button primary large">
            Перейти в Майнинг
          </Link>
        </section>

        {/* Promo Banner */}
        <section className="section promo-section">
          <div className="promo-banner">
            <h2 className="gradient-text large">GONKA ONE</h2>
            <p className="promo-text">Децентрализованная платформа для коллективного майнинга</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

