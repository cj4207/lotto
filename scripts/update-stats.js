import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_PATH = path.resolve(__dirname, '../src/data/stats.ts');

// 재시도 로직을 포함한 fetch 함수
async function fetchWithRetry(url, options, retries = 3, backoff = 2000) {
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://www.dhlottery.co.kr/'
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, headers: { ...commonHeaders, ...options?.headers } });
      if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[접속 시도 ${i + 1} 실패] ${err.message}. ${backoff}ms 후 재시도합니다...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2; // 재시도 간격을 늘림
    }
  }
}

async function updateStats() {
  try {
    console.log('최신 로또 회차 정보를 확인하는 중...');
    const historyUrl = 'https://www.dhlottery.co.kr/lt645/selectLt645History.do';
    const historyData = await fetchWithRetry(historyUrl);

    const latestDraw = historyData.data?.lastLtEpsd;
    if (!latestDraw) {
      throw new Error('최신 회차 정보를 가져오지 못했습니다.');
    }
    console.log(`확인된 최신 회차: ${latestDraw}`);

    console.log('번호별 누적 통계 데이터를 가져오는 중...');
    const statsUrl = `https://www.dhlottery.co.kr/lt645/selectLt645NoStats.do?srchStrLtEpsd=1&srchEndLtEpsd=${latestDraw}&srchBnsYn=N`;
    const statsData = await fetchWithRetry(statsUrl);

    if (!statsData.data?.result) {
      throw new Error('통계 데이터를 가져오지 못했습니다.');
    }

    const stats = {};
    statsData.data.result.forEach(item => {
      stats[item.wnNo] = item.cnt;
    });

    // 파일 업데이트
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

    const content = fs.readFileSync(STATS_PATH, 'utf-8');
    const newContent = content
      .replace(/LOTTO_STATS: Record<number, number> = {[\s\S]*?};/, `LOTTO_STATS: Record<number, number> = ${formattedStats}`)
      .replace(/TOTAL_DRAWS = \d+/, `TOTAL_DRAWS = ${latestDraw}`);

    fs.writeFileSync(STATS_PATH, newContent);
    console.log(`성공적으로 업데이트되었습니다. (최신 회차: ${latestDraw})`);

  } catch (error) {
    console.error('업데이트 최종 실패:', error.message);
    console.log('팁: 로컬 네트워크 환경 때문일 수 있습니다. GitHub Actions에서 실행되는지 확인해 보세요.');
  }
}

updateStats();
