import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/mining', icon: '⚙️', label: 'Майнинг' },
    { path: '/profile', icon: '👤', label: 'Профиль' },
    { path: '/referrals', icon: '👥', label: 'Рефералы' },
    { path: '/support', icon: '❓', label: 'Поддержка' }
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;

