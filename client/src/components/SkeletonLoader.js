import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, index) => (
        <div key={index} className={`skeleton skeleton-${type}`}>
          {type === 'card' && (
            <>
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text" style={{ width: '80%' }}></div>
            </>
          )}
          {type === 'pool' && (
            <>
              <div className="skeleton-title" style={{ width: '60%' }}></div>
              <div className="skeleton-text" style={{ width: '40%' }}></div>
              <div className="skeleton-progress"></div>
              <div className="skeleton-text" style={{ width: '30%' }}></div>
            </>
          )}
          {type === 'stat' && (
            <>
              <div className="skeleton-text" style={{ width: '70%' }}></div>
              <div className="skeleton-title" style={{ width: '50%' }}></div>
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;

