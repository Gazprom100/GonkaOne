import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {

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

        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">GONKA ONE</h1>
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
        </section>

        {/* About Section */}
        <section className="about-section">
          <h2 className="about-title">О майнинг-пуле</h2>
          <p className="about-description">
            <span className="brand-name">GonkaOne</span> — это коллективный пул по добыче токена GNK проекта Gonka братьев Либерман. 
            Присоединяйтесь к сообществу и получайте пассивный доход от майнинга.
          </p>
          <button className="btn btn-ghost">Подробнее</button>
        </section>

        {/* How it Works */}
        <section className="how-it-works">
          <h2 className="how-it-works-title">Как это работает</h2>
          <ol className="steps-list">
            <li className="step-item">
              <span className="step-number">1</span>
              <span className="step-text">Выберите пул в разделе Майнинг и инвестируйте в него</span>
            </li>
            <li className="step-item">
              <span className="step-number">2</span>
              <span className="step-text">Оплатите инвестицию в USDT или USDC</span>
            </li>
            <li className="step-item">
              <span className="step-number">3</span>
              <span className="step-text">Токен Gonka добывается в течение 30 дней автоматически</span>
            </li>
            <li className="step-item">
              <span className="step-number">4</span>
              <span className="step-text">Укажите свой кошелек в сети Gonka в разделе Профиль для получения токенов</span>
            </li>
          </ol>
          <div className="cta-primary">
            <Link to="/mining" className="btn btn-primary btn-xl">
              Перейти в Майнинг
            </Link>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="promo-section">
          <div className="promo-banner">
            <h2 className="promo-title">GONKA ONE</h2>
            <p className="promo-text">Децентрализованная платформа для коллективного майнинга с реферальной программой</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

