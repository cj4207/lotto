import React, { useMemo, useState } from 'react';
import { LOTTO_STATS } from '../../data/stats';
import { Ball } from '../common/Ball';

type SortType = 'number' | 'count';

export const Statistics: React.FC = () => {
  const [sortType, setSortType] = useState<SortType>('number');
  
  const statsEntries = useMemo(() => {
    const entries = Object.entries(LOTTO_STATS).map(([num, count]) => [parseInt(num), count] as [number, number]);
    if (sortType === 'number') {
      return entries.sort((a, b) => a[0] - b[0]);
    } else {
      return entries.sort((a, b) => b[1] - a[1]);
    }
  }, [sortType]);

  const maxCount = useMemo(() => Math.max(...Object.values(LOTTO_STATS)), []);
  
  // 데이터 분석 (상단 요약용은 고정)
  const topNumbers = useMemo(() => 
    Object.entries(LOTTO_STATS)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6)
  , []);

  const bottomNumbers = useMemo(() => 
    Object.entries(LOTTO_STATS)
      .sort((a, b) => (a[1] as number) - (b[1] as number))
      .slice(0, 6)
  , []);

  return (
    <div className="tab-content stats-content">
      {/* React 19 SEO Hoisting */}
      <title>출현 통계 - 로또 연구소</title>
      <meta name="description" content="역대 로또 당첨 번호 데이터를 분석하여 가장 많이 나온 숫자와 적게 나온 숫자를 확인하세요." />

      <h3>번호별 누적 출현 횟수</h3>
      <p className="stats-info">동행복권 데이터를 기반으로 한 통계입니다.</p>
      
      <div className="analysis-cards">
        <div className="analysis-card hot">
          <h4>🔥 최다 출현 번호</h4>
          <div className="analysis-balls">
            {topNumbers.map(([num]) => (
              <Ball key={num} num={parseInt(num)} size="small" />
            ))}
          </div>
        </div>
        <div className="analysis-card cold">
          <h4>❄️ 최소 출현 번호</h4>
          <div className="analysis-balls">
            {bottomNumbers.map(([num]) => (
              <Ball key={num} num={parseInt(num)} size="small" />
            ))}
          </div>
        </div>
      </div>

      <div className="filter-container">
        <button 
          className={`filter-btn ${sortType === 'number' ? 'active' : ''}`}
          onClick={() => setSortType('number')}
        >
          번호순
        </button>
        <button 
          className={`filter-btn ${sortType === 'count' ? 'active' : ''}`}
          onClick={() => setSortType('count')}
        >
          횟수순
        </button>
      </div>

      <div className="stats-grid">
        {statsEntries.map(([num, count]) => (
          <div key={num} className="stats-item">
            <Ball num={num} size="small" />
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
