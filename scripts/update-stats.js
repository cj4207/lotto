import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_PATH = path.resolve(__dirname, '../src/data/stats.ts');
const HISTORY_PATH = path.resolve(__dirname, '../src/data/history.ts');

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
      backoff *= 2; 
    }
  }
}

async function getHistoryBulk(drawNo, dir = 'center') {
  const timestamp = Date.now();
  const url = `https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=${dir}&${dir === 'center' ? 'srchLtEpsd' : 'srchCursorLtEpsd'}=${drawNo}&_=${timestamp}`;
  try {
    const data = await fetchWithRetry(url);
    // API 응답 구조가 { data: { list: [...] } } 형태인지 확인
    if (data && data.data && data.data.list && data.data.list.length > 0) {
      return data.data.list.map(item => ({
        drawNo: parseInt(item.ltEpsd),
        numbers: [
          parseInt(item.tm1WnNo), 
          parseInt(item.tm2WnNo), 
          parseInt(item.tm3WnNo), 
          parseInt(item.tm4WnNo), 
          parseInt(item.tm5WnNo), 
          parseInt(item.tm6WnNo)
        ],
        bonus: parseInt(item.bnsWnNo)
      }));
    }
  } catch (e) {
    console.error(`회차 데이터 가져오기 실패 (회차: ${drawNo}): ${e.message}`);
  }
  return [];
}

async function updateAll() {
  try {
    // 1. 최신 회차 확인
    console.log('최신 로또 회차 확인 중...');
    const historyUrl = 'https://www.dhlottery.co.kr/lt645/selectLt645History.do';
    const historyData = await fetchWithRetry(historyUrl);
    const latestDraw = parseInt(historyData.data?.lastLtEpsd);
    
    if (!latestDraw) throw new Error('최신 회차를 알 수 없습니다.');
    console.log(`최신 회차: ${latestDraw}`);

    // 2. stats.ts 업데이트
    const statsUrl = `https://www.dhlottery.co.kr/lt645/selectLt645NoStats.do?srchStrLtEpsd=1&srchEndLtEpsd=${latestDraw}&srchBnsYn=N`;
    const statsData = await fetchWithRetry(statsUrl);
    if (statsData.data?.result) {
      const stats = {};
      statsData.data.result.forEach(item => { stats[item.wnNo] = item.cnt; });
      let formattedStats = `{\n  `;
      const sortedKeys = Object.keys(stats).map(Number).sort((a, b) => a - b);
      for (let i = 0; i < sortedKeys.length; i++) {
        const num = sortedKeys[i];
        formattedStats += `${num}: ${stats[num]}`;
        if (i < sortedKeys.length - 1) formattedStats += (i + 1) % 10 === 0 ? `,\n  ` : `, `;
      }
      formattedStats += `\n};`;

      const content = fs.readFileSync(STATS_PATH, 'utf-8');
      const newContent = content
        .replace(/LOTTO_STATS: Record<number, number> = {[\s\S]*?};/, `LOTTO_STATS: Record<number, number> = ${formattedStats}`)
        .replace(/TOTAL_DRAWS = \d+/, `TOTAL_DRAWS = ${latestDraw}`);
      fs.writeFileSync(STATS_PATH, newContent);
      console.log('stats.ts 업데이트 완료');
    }

    // 3. history.ts 업데이트
    console.log('history.ts 데이터 수집 중...');
    let existingList = [];
    if (fs.existsSync(HISTORY_PATH)) {
      const content = fs.readFileSync(HISTORY_PATH, 'utf-8');
      const listMatch = content.match(/export const LOTTO_HISTORY: DrawResult\[\] = (\[[\s\S]*?\]);/);
      if (listMatch) {
        try {
          // 느슨한 JSON 파싱 (키에 따옴표 없는 경우 대비)
          const jsonStr = listMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,(\s*\])/g, '$1');
          existingList = JSON.parse(jsonStr);
        } catch (e) { console.warn('기존 데이터 파싱 실패'); }
      }
    }

    const currentFileLatest = existingList.length > 0 ? existingList[0].drawNo : 0;
    
    if (latestDraw > currentFileLatest) {
      console.log(`${currentFileLatest + 1}회부터 ${latestDraw}회까지 데이터를 가져옵니다.`);
      let newDraws = [];
      let cursor = latestDraw;

      while (cursor > currentFileLatest && newDraws.length < 200) {
        console.log(`${cursor}회차 기반 벌크 데이터 가져오는 중...`);
        // 처음엔 center로 10개, 그 다음부턴 older로 이전 데이터 10개씩
        const bulk = await getHistoryBulk(cursor, newDraws.length === 0 ? 'center' : 'older');
        
        if (bulk.length === 0) break;

        const filtered = bulk.filter(d => d.drawNo > currentFileLatest && !newDraws.some(n => n.drawNo === d.drawNo));
        newDraws = [...newDraws, ...filtered];

        const oldestInBulk = Math.min(...bulk.map(d => d.drawNo));
        if (oldestInBulk <= currentFileLatest) break;
        cursor = oldestInBulk - 1;
        
        await new Promise(r => setTimeout(r, 400));
      }

      const finalHistory = [...newDraws, ...existingList].sort((a, b) => b.drawNo - a.drawNo).slice(0, 200);
      const historyFileContent = `export interface DrawResult {
  drawNo: number;
  numbers: number[];
  bonus: number;
}

export const LOTTO_HISTORY: DrawResult[] = ${JSON.stringify(finalHistory, null, 2)};
`;
      fs.writeFileSync(HISTORY_PATH, historyFileContent);
      console.log(`history.ts 업데이트 성공 (총 ${finalHistory.length}개 회차)`);
    } else {
      console.log('이미 최신 상태입니다.');
    }

    console.log('모든 작업이 완료되었습니다.');
  } catch (e) {
    console.error('오류 발생:', e.message);
  }
}

updateAll();
