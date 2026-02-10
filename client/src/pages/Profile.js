import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Profile = () => {
  const { isAuthenticated, token } = useAuth();
  const [wallet, setWallet] = useState({ gonkaAddress: '', bep20Address: '' });
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState({ available: 0, pending: 0, withdrawn: 0 });
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        axios.get(`${API_URL}/wallets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (walletRes.data.wallet) {
        setWallet(walletRes.data.wallet);
      }
      setWithdrawals(withdrawalsRes.data.withdrawals);
      setBalance(withdrawalsRes.data.balance);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const saveGonkaWallet = async () => {
    try {
      await axios.put(
        `${API_URL}/wallets/gonka`,
        { address: wallet.gonkaAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Кошелек GNK сохранен!');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const saveBEP20Wallet = async () => {
    try {
      await axios.put(
        `${API_URL}/wallets/bep20`,
        { address: wallet.bep20Address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Кошелек BEP-20 сохранен!');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const requestWithdrawal = async () => {
    if (withdrawalAmount < 50) {
      alert('Минимальный вывод: 50 USDT');
      return;
    }

    if (!withdrawalAddress || !withdrawalAddress.startsWith('0x')) {
      alert('Неверный адрес BEP-20');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/withdrawals`,
        { amount: withdrawalAmount, address: withdrawalAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Запрос на вывод создан!');
      setWithdrawalAmount(0);
      setWithdrawalAddress('');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при создании запроса');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="auth-required">
            <p>Пожалуйста, войдите через Telegram</p>
            <p className="text-muted">Войдите через Telegram бота для доступа к профилю</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner-premium"></div>
            <p className="loading-text">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title gradient-text">Профиль</h1>

        {/* Wallets Section */}
        <section className="wallets-section">
          <h2 className="section-title">Кошельки</h2>
          <p className="section-description">
            Укажите внешние кошельки для зачисления токенов GNK и реферальных выплат.
          </p>

          {/* Gonka Wallet */}
          <div className="wallet-card card-ultra">
            <h3 className="wallet-title">Кошелёк для токенов GNK</h3>
            <p className="wallet-hint">Адрес кошелька должен начинаться с символов gonka...</p>
            <div className="wallet-input-group">
              <input
                type="text"
                className="neon-input"
                placeholder="gonka..."
                value={wallet.gonkaAddress}
                onChange={(e) => setWallet({ ...wallet, gonkaAddress: e.target.value })}
              />
              <button className="btn btn-primary" onClick={saveGonkaWallet}>
                Сохранить
              </button>
            </div>
          </div>

          {/* BEP-20 Wallet */}
          <div className="wallet-card card-ultra">
            <h3 className="wallet-title">Кошелёк для реферальных выплат (BEP-20)</h3>
            <div className="wallet-input-group">
              <input
                type="text"
                className="neon-input"
                placeholder="0x... (BSC / BEP-20)"
                value={wallet.bep20Address}
                onChange={(e) => setWallet({ ...wallet, bep20Address: e.target.value })}
              />
              <button className="btn btn-primary" onClick={saveBEP20Wallet}>
                Сохранить
              </button>
            </div>
          </div>
        </section>

        {/* Withdrawal Section */}
        <section className="withdrawal-section">
          <h2 className="section-title">Запрос вывода USDT (BEP-20)</h2>

          <div className="balance-cards">
            <div className="balance-card stat-card">
              <div className="balance-label">Доступно</div>
              <div className="balance-value">{balance.available.toFixed(2)} USDT</div>
            </div>
            <div className="balance-card stat-card">
              <div className="balance-label">На выводе</div>
              <div className="balance-value">{balance.pending.toFixed(2)} USDT</div>
            </div>
            <div className="balance-card stat-card">
              <div className="balance-label">Выведено</div>
              <div className="balance-value">{balance.withdrawn.toFixed(2)} USDT</div>
            </div>
          </div>

          <div className="withdrawal-form card-ultra">
            <div className="form-group">
              <label className="form-label">Сумма</label>
              <input
                type="number"
                className="neon-input"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || 0)}
                min="50"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Адрес BEP-20</label>
              <input
                type="text"
                className="neon-input"
                placeholder="0x..."
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
              />
            </div>
            <p className="withdrawal-info">
              Минимальный вывод: <strong>50 USDT</strong>. 
              Запрос будет обработан в течение 48 часов.
            </p>
            <button
              className="btn btn-primary"
              onClick={requestWithdrawal}
              disabled={withdrawalAmount < 50 || !withdrawalAddress}
            >
              Запросить вывод
            </button>
          </div>

          {/* Withdrawal History */}
          {withdrawals.length > 0 && (
            <div className="withdrawal-history">
              <h3 className="history-title">История запросов</h3>
              <div className="history-list">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="history-item card">
                    <div className="history-header">
                      <span className="history-amount">{withdrawal.amount} USDT</span>
                      <span className={`history-status status-${withdrawal.status}`}>
                        {withdrawal.status === 'pending' ? 'В обработке' : 
                         withdrawal.status === 'completed' ? 'Выполнено' : 'Отклонено'}
                      </span>
                    </div>
                    <div className="history-details">
                      <div className="history-date">
                        {new Date(withdrawal.createdAt).toLocaleString('ru-RU')}
                      </div>
                      {withdrawal.txHash && (
                        <div className="history-tx">
                          TX: <span>{withdrawal.txHash.slice(0, 20)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;

