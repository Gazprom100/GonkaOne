import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Referrals.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Referrals = () => {
  const { isAuthenticated, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [levelDetails, setLevelDetails] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadLevelDetails = async (level) => {
    try {
      const response = await axios.get(`${API_URL}/referrals/level/${level}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLevelDetails({ ...levelDetails, [level]: response.data.referrals });
      setSelectedLevel(level);
    } catch (error) {
      console.error('Error loading level details:', error);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      alert('Ссылка скопирована!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="referrals-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-required-icon">🔐</div>
            <p className="neon-text">Пожалуйста, войдите через Telegram</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="referrals-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner-premium"></div>
            <p className="loading-text">Загрузка статистики...</p>
          </div>
        </div>
      </div>
    );
  }

  const levels = [
    { level: 1, percent: 5, color: 'cyan' },
    { level: 2, percent: 3, color: 'purple' },
    { level: 3, percent: 2, color: 'pink' }
  ];

  return (
    <div className="referrals-page">
      <div className="container">
        <h1 className="page-title gradient-text">Рефералы</h1>

        {/* Program Description */}
        <section className="program-description">
          <h2 className="section-title neon-text">Приглашайте друзей и получайте награды:</h2>
          <div className="levels-grid">
            {levels.map(({ level, percent, color }) => (
              <div key={level} className="level-card stat-card">
                <div className="level-number neon-text">Уровень {level}</div>
                <div className="level-percent neon-text">{percent}% от оплаты</div>
              </div>
            ))}
          </div>
        </section>

        {/* Referral Link */}
        <section className="referral-link-section">
          <h3 className="section-subtitle">Ваша реферальная ссылка</h3>
          <div className="referral-link-card neon-card">
            <div className="referral-link-text">{stats.referralLink}</div>
            <button className="neon-button primary" onClick={copyReferralLink}>
              Скопировать
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="statistics-section">
          <h2 className="section-title">Статистика</h2>

          {/* Main Stats */}
          <div className="main-stats">
            <div className="stat-card neon-card glow-cyan">
              <div className="stat-label">Баланс</div>
              <div className="stat-value neon-text">{stats.stats.totalEarnings.toFixed(2)} USDT</div>
            </div>
            <div className="stat-card neon-card glow-orange">
              <div className="stat-label">На выводе</div>
              <div className="stat-value neon-text-pink">{stats.stats.pendingWithdrawals.toFixed(2)} USDT</div>
            </div>
            <div className="stat-card neon-card glow-green">
              <div className="stat-label">Выведено</div>
              <div className="stat-value neon-text-green">
                {stats.stats.totalWithdrawn?.toFixed(2) || '0.00'} USDT
              </div>
            </div>
          </div>

          {/* Referral Count */}
          <div className="referral-count-card neon-card">
            <div className="count-label">Всего рефералов</div>
            <div className="count-value neon-text">{stats.stats.totalReferrals}</div>
          </div>

          {/* Total Income */}
          <div className="total-income-card neon-card glow-purple">
            <div className="income-label">Суммарный доход</div>
            <div className="income-value neon-text-purple">{stats.stats.totalEarnings.toFixed(2)} USDT</div>
          </div>

          {/* Income by Level */}
          <div className="levels-income">
            {levels.map(({ level, percent, color }) => {
              const levelStat = stats.stats.levels?.find(l => l.level === level);
              const earnings = levelStat?.earnings || 0;
              const count = levelStat?.count || 0;

              return (
                <div key={level} className={`level-income-card neon-card glow-${color}`}>
                  <div className="level-income-header">
                    <div>
                      <div className="level-income-title">Уровень {level}</div>
                      <div className="level-income-count">{count} рефералов</div>
                    </div>
                    <button
                      className="level-details-btn"
                      onClick={() => loadLevelDetails(level)}
                    >
                      →
                    </button>
                  </div>
                  <div className="level-income-amount">
                    Доход ({percent}%): <span className="neon-text">{earnings.toFixed(2)} USDT</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Level Details Modal */}
        {selectedLevel && levelDetails[selectedLevel] && (
          <div className="modal-overlay" onClick={() => setSelectedLevel(null)}>
            <div className="modal-content neon-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Уровень {selectedLevel} - Детали</h3>
              <div className="level-details-list">
                {levelDetails[selectedLevel].length === 0 ? (
                  <div className="empty-details">Нет рефералов на этом уровне</div>
                ) : (
                  levelDetails[selectedLevel].map((ref) => (
                    <div key={ref.id} className="detail-item-card neon-card">
                      <div className="detail-header">
                        <span className="detail-name">{ref.firstName || ref.username || `User ${ref.id}`}</span>
                        <span className="detail-date">
                          {new Date(ref.registeredAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="detail-stats">
                        <div className="detail-stat">
                          <span>Инвестиции:</span>
                          <span className="neon-text">{ref.totalInvestments?.toFixed(2) || '0.00'} USDT</span>
                        </div>
                        <div className="detail-stat">
                          <span>Комиссия:</span>
                          <span className="neon-text-green">{ref.totalEarnings?.toFixed(2) || '0.00'} USDT</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                className="neon-button"
                onClick={() => setSelectedLevel(null)}
                style={{ marginTop: '20px', width: '100%' }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;

