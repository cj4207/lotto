import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_PATH = path.resolve(__dirname, '../src/data/stats.ts');

async function updateStats() {
  try {
    console.log('최신 로또 회차 정보를 확인하는 중...');
    
    // 1. 최신 회차 번호 추출 (JSON 응답 활용)
    const historyUrl = 'https://www.dhlottery.co.kr/lt645/selectLt645History.do';
    const historyResponse = await fetch(historyUrl);
    const historyData = await historyResponse.json();

    const latestDraw = historyData.data?.lastLtEpsd;

    if (!latestDraw) {
      console.error('최신 회차 정보를 가져오지 못했습니다. 응답 구조를 확인해주세요.');
      console.log('응답 데이터:', JSON.stringify(historyData));
      return;
    }
    console.log(`확인된 최신 회차: ${latestDraw}`);

    // 2. 번호별 누적 통계 데이터 가져오기
    console.log('번호별 누적 통계 데이터를 가져오는 중...');
    // 통계 페이지는 HTML 형식이므로 text()를 유지하되, 회차 범위를 동적으로 설정합니다.
    const statsUrl = `https://www.dhlottery.co.kr/lt645/selectLt645NoStats.do?srchStrLtEpsd=1&srchEndLtEpsd=${latestDraw}&srchBnsYn=N`;
    const statsResponse = await fetch(statsUrl);
    const statsHtml = await statsResponse.text();

    const stats = {};
    // <td>번호</td> <td class="ta_right">횟수</td> 패턴 추출
    for (let i = 1; i <= 45; i++) {
      const regex = new RegExp(`<td>${i}<\/td>\\s*<td[^>]*>(\\d+)<\/td>`);
      const match = statsHtml.match(regex);
      if (match) {
        stats[i] = parseInt(match[1]);
      }
    }

    if (Object.keys(stats).length < 45) {
      console.warn(`일부 번호 데이터가 누락되었습니다. (찾은 번호 개수: ${Object.keys(stats).length})`);
    }

    // 3. 파일 업데이트 (src/data/stats.ts)
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
    console.error('업데이트 중 오류 발생:', error);
  }
}

updateStats();
