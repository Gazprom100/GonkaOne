import React, { useState } from 'react';
import './Support.css';

const Support = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  const faqCategories = [
    {
      id: 'general',
      title: 'Общие вопросы',
      questions: [
        {
          q: 'Что такое GonkaOne?',
          a: 'GonkaOne — это коллективный пул по добыче токена GNK проекта Gonka. Вы можете инвестировать в майнинг-пулы и получать вознаграждения в токенах GNK.'
        },
        {
          q: 'Как начать работу?',
          a: 'Зарегистрируйтесь через Telegram, выберите пул в разделе Майнинг, инвестируйте средства и укажите кошелек для получения наград.'
        }
      ]
    },
    {
      id: 'mining',
      title: 'Майнинг',
      questions: [
        {
          q: 'Как работает майнинг-пул?',
          a: 'Пользователи объединяют средства для аренды вычислительных мощностей. После сбора необходимой суммы начинается майнинг токенов GNK в течение 30 дней.'
        },
        {
          q: 'Какая минимальная сумма инвестиции?',
          a: 'Минимальная сумма инвестиции составляет 50 USDT.'
        }
      ]
    },
    {
      id: 'referrals',
      title: 'Реферальная программа',
      questions: [
        {
          q: 'Как работает реферальная программа?',
          a: 'Приглашайте друзей по вашей реферальной ссылке и получайте комиссию с их инвестиций: 5% с первого уровня, 3% со второго, 2% с третьего.'
        },
        {
          q: 'Как вывести реферальные награды?',
          a: 'Укажите BEP-20 кошелек в разделе Профиль и создайте запрос на вывод. Минимальная сумма вывода — 50 USDT.'
        }
      ]
    }
  ];

  return (
    <div className="support-page">
      <div className="container">
        <h1 className="page-title gradient-text">Поддержка</h1>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="section-title">Часто задаваемые вопросы</h2>
          <div className="faq-categories">
            {faqCategories.map((category) => (
              <div key={category.id} className="faq-category">
                <button
                  className="category-header"
                  onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                >
                  <span className="category-title">{category.title}</span>
                  <span className="category-icon">{activeCategory === category.id ? '−' : '+'}</span>
                </button>
                {activeCategory === category.id && (
                  <div className="category-content">
                    {category.questions.map((item, index) => (
                      <div key={index} className="faq-item">
                        <div className="faq-question neon-text">{item.q}</div>
                        <div className="faq-answer">{item.a}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2 className="section-title">Свяжитесь с нами</h2>
          <div className="contact-cards">
            <div className="contact-card neon-card glow-cyan">
              <div className="contact-icon">💬</div>
              <div className="contact-title">Telegram</div>
              <div className="contact-info">@gonkaone_support</div>
              <a
                href="https://t.me/gonkaone_support"
                target="_blank"
                rel="noopener noreferrer"
                className="neon-button"
              >
                Написать
              </a>
            </div>
            <div className="contact-card neon-card glow-purple">
              <div className="contact-icon">📧</div>
              <div className="contact-title">Email</div>
              <div className="contact-info">support@gonkaone.com</div>
              <a
                href="mailto:support@gonkaone.com"
                className="neon-button"
              >
                Написать
              </a>
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="feedback-section">
          <h2 className="section-title">Обратная связь</h2>
          <div className="feedback-form neon-card">
            <div className="form-group">
              <label className="form-label">Тема обращения</label>
              <select className="neon-input">
                <option>Общий вопрос</option>
                <option>Техническая проблема</option>
                <option>Вопрос по инвестициям</option>
                <option>Реферальная программа</option>
                <option>Другое</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Описание проблемы</label>
              <textarea
                className="neon-input"
                rows="5"
                placeholder="Опишите вашу проблему или вопрос..."
              ></textarea>
            </div>
            <button className="neon-button primary" style={{ width: '100%' }}>
              Отправить
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;

