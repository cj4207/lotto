import fs from 'fs';
import path from 'path';

const STATS_PATH = path.join(process.cwd(), 'src/data/stats.ts');

async function updateStats() {
  try {
    const content = fs.readFileSync(STATS_PATH, 'utf-8');
    const totalDrawsMatch = content.match(/TOTAL_DRAWS = (\d+)/);
    if (!totalDrawsMatch) {
      console.error('TOTAL_DRAWS를 찾을 수 없습니다.');
      return;
    }
    let currentDraw = parseInt(totalDrawsMatch[1]);

    console.log(`현재 저장된 최신 회차: ${currentDraw}`);

    const statsMatch = content.match(/LOTTO_STATS: Record<number, number> = ({[\s\S]*?});/);
    if (!statsMatch) {
      console.error('LOTTO_STATS를 찾을 수 없습니다.');
      return;
    }
    
    const statsStr = statsMatch[1];
    const stats = {};
    const pairs = statsStr.match(/\d+: \d+/g);
    if (pairs) {
      pairs.forEach(pair => {
        const [num, count] = pair.split(': ').map(Number);
        stats[num] = count;
      });
    }

    let nextDraw = currentDraw + 1;
    let hasChanged = false;

    while (true) {
      console.log(`${nextDraw}회차 조회 중...`);
      const response = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${nextDraw}`);
      const data = await response.json();

      if (data.returnValue === 'fail' || !data.drwtNo1) {
        console.log(`${nextDraw}회차 데이터가 아직 없습니다.`);
        break;
      }

      // 당첨 번호 6개 반영 (보너스 제외)
      for (let i = 1; i <= 6; i++) {
        const num = data[`drwtNo${i}`];
        stats[num] = (stats[num] || 0) + 1;
      }
      
      currentDraw = nextDraw;
      nextDraw++;
      hasChanged = true;
      console.log(`${currentDraw}회차 반영 완료`);
    }

    if (hasChanged) {
      let formattedStats = `{\n  `;
      const sortedKeys = Object.keys(stats).map(Number).sort((a, b) => a - b);
      for (let i = 0; i < sortedKeys.length; i++) {
        const num = sortedKeys[i];
        formattedStats += `${num}: ${stats[num]}`;
        if (i < sortedKeys.length - 1) {
          formattedStats += (i + 1) % 10 === 0 ? `,\n  ` : `, `;
        }
      }
      formattedStats += `\n};`;

      const newContent = content
        .replace(/LOTTO_STATS: Record<number, number> = {[\s\S]*?};/, `LOTTO_STATS: Record<number, number> = ${formattedStats}`)
        .replace(/TOTAL_DRAWS = \d+/, `TOTAL_DRAWS = ${currentDraw}`);

      fs.writeFileSync(STATS_PATH, newContent);
      console.log(`파일 업데이트 완료: ${currentDraw}회차`);
    } else {
      console.log('이미 최신 상태입니다.');
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

updateStats();
