import { useState } from 'react';
import { LOTTO_STATS } from '../data/stats';
import { LOTTO_HISTORY, DrawResult } from '../data/history';

export interface SimulationResult {
  rank: number;
  drawNo: number;
  matchCount: number;
  hasBonus: boolean;
}

export interface LottoSet {
  numbers: number[];
  allResults: SimulationResult[];
}

export const useLotto = () => {
  const [sets, setSets] = useState<LottoSet[]>([]);

  const checkRank = (myNumbers: number[], draw: DrawResult): SimulationResult => {
    const matchCount = myNumbers.filter(n => draw.numbers.includes(n)).length;
    const hasBonus = myNumbers.includes(draw.bonus);

    let rank = 0;
    if (matchCount === 6) rank = 1;
    else if (matchCount === 5 && hasBonus) rank = 2;
    else if (matchCount === 5) rank = 3;
    else if (matchCount === 4) rank = 4;
    else if (matchCount === 3) rank = 5;

    return { rank, drawNo: draw.drawNo, matchCount, hasBonus };
  };

  const findAllResults = (myNumbers: number[]): SimulationResult[] => {
    const results: SimulationResult[] = [];

    for (const draw of LOTTO_HISTORY) {
      const result = checkRank(myNumbers, draw);
      if (result.rank > 0) {
        results.push(result);
      }
    }
    // 등수 순, 그 다음 최신 회차 순으로 정렬
    return results.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.drawNo - a.drawNo;
    });
  };

  const generateSingleSet = (isWeighted: boolean): LottoSet => {
    const newNumbers: number[] = [];
    if (isWeighted) {
      const entries = Object.entries(LOTTO_STATS).map(([num, count]) => ({
        num: parseInt(num),
        weight: count
      }));
      
      while (newNumbers.length < 6) {
        const totalWeight = entries.reduce((acc, curr) => acc + curr.weight, 0);
        let random = Math.random() * totalWeight;
        for (const entry of entries) {
          if (newNumbers.includes(entry.num)) continue;
          random -= entry.weight;
          if (random <= 0) {
            newNumbers.push(entry.num);
            break;
          }
        }
      }
    } else {
      while (newNumbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!newNumbers.includes(num)) newNumbers.push(num);
      }
    }
    
    const sortedNumbers = newNumbers.sort((a, b) => a - b);
    return {
      numbers: sortedNumbers,
      allResults: findAllResults(sortedNumbers)
    };
  };

  const generateNumbers = (isWeighted: boolean = false) => {
    const newSets: LottoSet[] = [];
    for (let i = 0; i < 5; i++) {
      newSets.push(generateSingleSet(isWeighted));
    }
    setSets(newSets);
  };

  return { sets, generateNumbers };
};
