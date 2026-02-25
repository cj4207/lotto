import { useState } from 'react';
import { LOTTO_STATS } from '../data/stats';

export const useLotto = () => {
  const [sets, setSets] = useState<number[][]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  const generateSingleSet = (isWeighted: boolean) => {
    const newNumbers: number[] = [];
    if (isWeighted) {
      const entries = Object.entries(LOTTO_STATS).map(([num, count]) => ({
        num: parseInt(num),
        weight: count + 1
      }));
      
      while (newNumbers.length < 6) {
        const totalWeight = entries.reduce((acc, curr) => acc + curr.weight, 0);
        let random = Math.random() * totalWeight;
        for (const entry of entries) {
          random -= entry.weight;
          if (random <= 0) {
            if (!newNumbers.includes(entry.num)) newNumbers.push(entry.num);
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
    return newNumbers.sort((a, b) => a - b);
  };

  const generateNumbers = (isWeighted: boolean = false) => {
    const newSets: number[][] = [];
    for (let i = 0; i < 5; i++) {
      newSets.push(generateSingleSet(isWeighted));
    }
    setSets(newSets);
    setHistory(prev => [...newSets, ...prev].slice(0, 10)); // 히스토리도 확장
  };

  return { sets, history, generateNumbers };
};
