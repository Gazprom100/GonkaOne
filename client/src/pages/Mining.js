import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Mining.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Mining = () => {
  const { isAuthenticated, token } = useAuth();
  const [pools, setPools] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(50);
  const [showInvestModal, setShowInvestModal] = useState(false);

  useEffect(() => {
    loadPools();
    if (isAuthenticated) {
      loadMyInvestments();
    }
  }, [isAuthenticated]);

  const loadPools = async () => {
    try {
      const response = await axios.get(`${API_URL}/pools`);
      setPools(response.data.pools);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyInvestments = async () => {
    try {
      const response = await axios.get(`${API_URL}/pools/my/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyInvestments(response.data.investments);
      setTotalInvested(response.data.totalInvested);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const handleInvest = (pool) => {
    setSelectedPool(pool);
    setInvestmentAmount(50);
    setShowInvestModal(true);
  };

  const handleInvestmentSubmit = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/pools/${selectedPool.id}/invest`,
        { amount: investmentAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Инвестиция успешно создана!');
      setShowInvestModal(false);
      loadPools();
      loadMyInvestments();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при создании инвестиции');
    }
  };

  const quickAmounts = [50, 100, 250, 500, 1000];

  const calculateProgress = (pool) => {
    return pool.currentAmount / pool.targetAmount * 100;
  };

  if (loading) {
    return (
      <div className="mining-page">
        <div className="container">
          <div className="loading-container">
            <div className="neon-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mining-page">
      <div className="container">
        <h1 className="page-title gradient-text">Майнинг</h1>

        {/* Available Pools */}
        <section className="pools-section">
          <h2 className="section-title">Доступные пулы</h2>
          <div className="pools-grid">
            {pools.map((pool) => {
              const progress = calculateProgress(pool);
              return (
                <div key={pool.id} className="pool-card neon-card">
                  <div className="pool-header">
                    <h3 className="pool-name neon-text">GonkaOne Pool #{pool.poolNumber}</h3>
                    <div className="pool-hardware">
                      <span className="hardware-icon">🔧</span>
                      <span>{pool.hardware || '8xH100'}</span>
                    </div>
                  </div>

                  <div className="pool-progress">
                    <div className="progress-info">
                      <span>{pool.currentAmount.toLocaleString()} USDT</span>
                      <span className="neon-text">/ {pool.targetAmount.toLocaleString()} USDT</span>
                    </div>
                    <div className="neon-progress">
                      <div
                        className="neon-progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-percentage neon-text-green">
                      {progress.toFixed(2)}%
                    </div>
                  </div>

                  <div className="pool-info">
                    <div className="info-item">
                      <span className="info-icon">⚙️</span>
                      <span>Аренда сервера на 30 дней</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <span>Дата начала майнинга: {pool.startDate || '09.02.2026'}</span>
                    </div>
                  </div>

                  <div className="investment-section">
                    <div className="quick-amounts">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          className={`amount-btn ${investmentAmount === amount ? 'active' : ''}`}
                          onClick={() => setInvestmentAmount(amount)}
                        >
                          {amount} USDT
                        </button>
                      ))}
                    </div>
                    <div className="custom-amount">
                      <button
                        className="amount-control"
                        onClick={() => setInvestmentAmount(Math.max(50, investmentAmount - 50))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="neon-input"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 50)}
                        min="50"
                      />
                      <button
                        className="amount-control"
                        onClick={() => setInvestmentAmount(investmentAmount + 50)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="neon-button primary invest-btn"
                      onClick={() => handleInvest(pool)}
                    >
                      🛒 Купить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* My Pools */}
        {isAuthenticated && (
          <section className="my-pools-section">
            <h2 className="section-title neon-text">Мои пулы</h2>
            <div className="stats-cards">
              <div className="stat-card neon-card glow-cyan">
                <div className="stat-label">Всего инвестировано</div>
                <div className="stat-value neon-text">{totalInvested.toFixed(2)} USDT</div>
              </div>
              <div className="stat-card neon-card glow-purple">
                <div className="stat-label">Участие в пулах</div>
                <div className="stat-value neon-text-purple">{myInvestments.length}</div>
              </div>
            </div>
            {myInvestments.length === 0 ? (
              <div className="empty-state">Нет пулов</div>
            ) : (
              <div className="investments-list">
                {myInvestments.map((investment) => (
                  <div key={investment.id} className="investment-card neon-card">
                    <div className="investment-header">
                      <span className="investment-pool">{investment.poolName}</span>
                      <span className={`investment-status status-${investment.status}`}>
                        {investment.status}
                      </span>
                    </div>
                    <div className="investment-details">
                      <div className="detail-item">
                        <span>Сумма:</span>
                        <span className="neon-text">{investment.amount} USDT</span>
                      </div>
                      <div className="detail-item">
                        <span>Дата:</span>
                        <span>{new Date(investment.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Investment Modal */}
        {showInvestModal && (
          <div className="modal-overlay" onClick={() => setShowInvestModal(false)}>
            <div className="modal-content neon-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Инвестировать в пул #{selectedPool?.poolNumber}</h3>
              <div className="modal-body">
                <p>Сумма инвестиции: <span className="neon-text">{investmentAmount} USDT</span></p>
                <div className="modal-actions">
                  <button
                    className="neon-button"
                    onClick={() => setShowInvestModal(false)}
                  >
                    Отмена
                  </button>
                  <button
                    className="neon-button primary"
                    onClick={handleInvestmentSubmit}
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mining;

