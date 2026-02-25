import React, { useMemo } from 'react';
import { LOTTO_STATS } from '../../data/stats';
import { Ball } from '../common/Ball';

export const Statistics: React.FC = () => {
  const statsEntries = useMemo(() => Object.entries(LOTTO_STATS), []);
  const maxCount = useMemo(() => Math.max(...Object.values(LOTTO_STATS)), []);
  
  return (
    <div className="tab-content stats-content">
      <h3>번호별 누적 출현 횟수</h3>
      <p className="stats-info">동행복권 데이터를 기반으로 한 통계입니다.</p>
      
      <div className="stats-grid">
        {statsEntries.map(([num, count]) => (
          <div key={num} className="stats-item">
            <Ball num={parseInt(num)} size="small" />
            <div className="bar-container">
              <div 
                className="bar" 
                style={{ width: `${(count / maxCount) * 100}%` }}
              ></div>
            </div>
            <span className="count-text">{count}회</span>
          </div>
        ))}
      </div>
    </div>
  );
};
