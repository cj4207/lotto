import React from 'react';
import { Ball } from '../common/Ball';
import { LOTTO_STATS, TOTAL_DRAWS } from '../../data/stats';
import { LottoSet } from '../../hooks/useLotto';

interface GeneratorProps {
  sets: LottoSet[];
  onGenerate: (weighted: boolean) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ sets, onGenerate }) => {
  const getStatsInfo = (num: number) => {
    const count = LOTTO_STATS[num] || 0;
    const probability = ((count / (TOTAL_DRAWS * 7)) * 100).toFixed(1); // 전체 번호 개수 대비 확률
    return { count, probability };
  };

  const renderSimulationResult = (set: LottoSet) => {
    if (!set.allResults || set.allResults.length === 0) {
      return <div className="sim-result none">최근 200회차 내 당첨 기록 없음</div>;
    }

    return (
      <div className="sim-results-container">
        {set.allResults.slice(0, 3).map((result, idx) => (
          <div key={idx} className={`sim-result rank-${result.rank}`}>
            <span className="sim-rank">{result.rank}등</span> 당첨! 
            <span className="sim-info"> ({result.drawNo}회: {result.matchCount}개{result.hasBonus ? '+B' : ''})</span>
          </div>
        ))}
        {set.allResults.length > 3 && (
          <div className="sim-more">외 {set.allResults.length - 3}건 더 있음</div>
        )}
      </div>
    );
  };

  return (
    <div className="tab-content">
      {/* React 19 SEO Hoisting */}
      <title>번호 생성 - 로또 연구소</title>
      <meta name="description" content="AI와 통계 데이터를 활용하여 이번 주 행운의 로또 번호를 생성해보세요." />

      <div className="button-group main-buttons">
        <button className="generate-btn" onClick={() => onGenerate(false)}>
          무작위 5개 생성
        </button>
        <button className="generate-btn weighted" onClick={() => onGenerate(true)}>
          통계 기반 5개 생성 🔥
        </button>
      </div>

      <div className="sets-display">
        {sets.length > 0 ? (
          sets.map((set, setIdx) => (
            <div key={setIdx} className="set-row">
              <span className="set-label">조합 {setIdx + 1}</span>
              <div className="set-balls">
                {set.numbers.map((num, idx) => {
                  const { count, probability } = getStatsInfo(num);
                  return (
                    <div key={idx} className="ball-with-stats">
                      <Ball num={num} />
                      <div className="ball-stats-info">
                        <span className="stat-count">{count}회</span>
                        <span className="stat-prob">{probability}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {renderSimulationResult(set)}
            </div>
          ))
        ) : (
          <div className="placeholder">버튼을 눌러 행운의 번호 5세트를 확인하세요!</div>
        )}
      </div>
    </div>
  );
};
