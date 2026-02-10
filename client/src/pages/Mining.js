import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
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

  useEffect(() => {
    loadPools();
    if (isAuthenticated) {
      loadMyInvestments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <h1 className="page-title gradient-text">Майнинг</h1>
          <div className="pools-grid">
            <SkeletonLoader type="pool" count={3} />
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
                <div key={pool.id} className="pool-card card-ultra">
                  <div className="pool-header">
                    <h3 className="pool-name neon-text">GonkaOne Pool #{pool.poolNumber}</h3>
                    <div className="pool-hardware">
                      <span>{pool.hardware || '8xH100'}</span>
                    </div>
                  </div>

                  <div className="pool-progress">
                    <div className="progress-info">
                      <span>{pool.currentAmount.toLocaleString()} USDT</span>
                      <span className="neon-text">/ {pool.targetAmount.toLocaleString()} USDT</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-percentage neon-text-green">
                      {progress.toFixed(2)}%
                    </div>
                  </div>

                  <div className="pool-info">
                    <div className="info-item">
                      <span>Аренда сервера на 30 дней</span>
                    </div>
                    <div className="info-item">
                      <span>Дата начала: {pool.startDate || '09.02.2026'}</span>
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
                      Инвестировать
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
              <div className="stat-card">
                <div className="stat-label">Всего инвестировано</div>
                <div className="stat-value">{totalInvested.toFixed(2)} USDT</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Участие в пулах</div>
                <div className="stat-value">{myInvestments.length}</div>
              </div>
            </div>
            {myInvestments.length === 0 ? (
              <div className="empty-state">
                <p>У вас пока нет активных инвестиций</p>
                <p className="text-muted">Начните инвестировать в пулы выше</p>
              </div>
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
                        <span className="detail-label">Сумма:</span>
                        <span className="detail-value">{investment.amount} USDT</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Дата:</span>
                        <span className="detail-value">{new Date(investment.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      {investment.expectedReward && (
                        <div className="detail-item">
                          <span className="detail-label">Ожидаемая награда:</span>
                          <span className="detail-value">{investment.expectedReward} GNK</span>
                        </div>
                      )}
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
            <div className="modal-content card-ultra" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Инвестировать в пул #{selectedPool?.poolNumber}</h3>
              <div className="modal-body">
                <p>Сумма инвестиции: <strong>{investmentAmount} USDT</strong></p>
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

