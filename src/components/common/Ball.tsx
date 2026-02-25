import React from 'react';

interface BallProps {
  num: number;
  size?: 'small' | 'large';
}

export const getBallColor = (num: number) => {
  if (num <= 10) return 'ball-yellow';
  if (num <= 20) return 'ball-blue';
  if (num <= 30) return 'ball-red';
  if (num <= 40) return 'ball-grey';
  return 'ball-green';
};

export const Ball: React.FC<BallProps> = ({ num, size = 'large' }) => {
  const colorClass = getBallColor(num);
  const sizeClass = size === 'small' ? 'mini-ball' : 'ball';
  
  return (
    <div className={`${sizeClass} ${colorClass}`}>
      {num}
    </div>
  );
};
