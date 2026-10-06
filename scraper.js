const { chromium } = require('playwright');
const fs = require('fs');

const players = [
  { name: "三谷将太", url: "https://keirin.jp/pc/racerprofile?snum=014252" },
  { name: "三谷竜生", url: "https://keirin.jp/pc/racerprofile?snum=014873" },
  { name: "中井太祐", url: "https://keirin.jp/pc/racerprofile?snum=014605" },
  { name: "中井俊亮", url: "https://keirin.jp/pc/racerprofile?snum=014945" },
  { name: "山本伸一", url: "https://keirin.jp/pc/racerprofile?snum=014886" },
  { name: "佐藤成人", url: "https://keirin.jp/pc/racerprofile?snum=012688" },
  { name: "伊代野貴照", url: "https://keirin.jp/pc/racerprofile?snum=014878" },
  { name: "栗山俊介", url: "https://keirin.jp/pc/racerprofile?snum=014944" },
  { name: "元砂勇雪", url: "https://keirin.jp/pc/racerprofile?snum=014946" },
  { name: "田中大我", url: "https://keirin.jp/pc/racerprofile?snum=015363" },
  { name: "辰己豊", url: "https://keirin.jp/pc/racerprofile?snum=013792" },
  { name: "野口正則", url: "https://keirin.jp/pc/racerprofile?snum=015005" },
  { name: "小笹隼人", url: "https://keirin.jp/pc/racerprofile?snum=015003" },
  { name: "吉田篤史", url: "https://keirin.jp/pc/racerprofile?snum=015108" },
  { name: "佐山寛明", url: "https://keirin.jp/pc/racerprofile?snum=015269" },
  { name: "吉堂将規", url: "https://keirin.jp/pc/racerprofile?snum=015364" },
  { name: "三谷政史", url: "https://keirin.jp/pc/racerprofile?snum=014310" },
  { name: "有馬雄二", url: "https://keirin.jp/pc/racerprofile?snum=014094" },
  { name: "黒川渉", url: "https://keirin.jp/pc/racerprofile?snum=014979" },
  { name: "田村風起", url: "https://keirin.jp/pc/racerprofile?snum=015056" },
  { name: "大崎龍一郎", url: "https://keirin.jp/pc/racerprofile?snum=015105" },
  { name: "西岡利起", url: "https://keirin.jp/pc/racerprofile?snum=015823" },
  { name: "伊狩知人", url: "https://keirin.jp/pc/racerprofile?snum=013728" },
  { name: "大井啓世", url: "https://keirin.jp/pc/racerprofile?snum=011519" },
  { name: "岡崎和久", url: "https://keirin.jp/pc/racerprofile?snum=013206" },
  { name: "関谷哲平", url: "https://keirin.jp/pc/racerprofile?snum=014251" },
  { name: "肥後公允", url: "https://keirin.jp/pc/racerprofile?snum=014179" },
  { name: "元砂海人", url: "https://keirin.jp/pc/racerprofile?snum=015270" },
  { name: "武田和也", url: "https://keirin.jp/pc/racerprofile?snum=014254" },
  { name: "元砂七夕美", url: "https://keirin.jp/pc/racerprofile?snum=015076" },
  { name: "馬越裕之", url: "https://keirin.jp/pc/racerprofile?snum=015909" },
  { name: "西田美菜", url: "https://keirin.jp/pc/racerprofile?snum=015948" }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    console.log(`[${i + 1}/${players.length}] ${player.name} ...`);
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(player.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const data = await page.evaluate((playerInfo) => {
          let kyuhan = '', kyuhanDate = '', kyuhanHist = '', kyuhanHistDate = '', nextKyuhan = '', tsuusan = '';
          let currentRace = Array(6).fill('ｰ');
          let raceTitle = '', profileCurrentRank = ''; 
          const tables = [...document.querySelectorAll('table')];
          const midasi = [...document.querySelectorAll('p.midasi2_fsz')].find(p => p.innerText.includes('■開催中のレース'));
          if (midasi) raceTitle = midasi.innerText.replace(/■開催中のレース\s*/, '').trim();

          for (const table of tables) {
            const rows = table.querySelectorAll('tr');
            let rankIndex = -1, nextRankIndex = -1;
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].querySelectorAll('td');
              for (let j = 0; j < cells.length; j++) {
                const txt = cells[j].innerText.replace(/\s+/g, '');
                if (txt === '級班') rankIndex = j;
                if (txt === '次期級班') nextRankIndex = j;
              }
              if (rankIndex !== -1 && (i + 1) < rows.length) {
                const dataCells = rows[i + 1].querySelectorAll('td');
                if (dataCells[rankIndex]) profileCurrentRank = dataCells[rankIndex].innerText.trim();
                if (nextRankIndex !== -1 && dataCells[nextRankIndex]) nextKyuhan = dataCells[nextRankIndex].innerText.trim();
                break; 
              }
            }
            if (profileCurrentRank) break;
          }

          for (const table of tables) {
            const cap = table.previousElementSibling;
            if (cap && cap.innerText.includes('級班の履歴情報')) {
              const rows = table.querySelectorAll('tr');
              if (rows.length > 1) {
                  const tds1 = rows[1].querySelectorAll('td');
                  if (tds1.length >= 2) { kyuhan = tds1[0].innerText.trim(); kyuhanDate = tds1[1].innerText.trim(); }
              }
              if (rows.length > 2) {
                  const tds2 = rows[2].querySelectorAll('td');
                  if (tds2.length >= 2) { kyuhanHist = tds2[0].innerText.trim(); kyuhanHistDate = tds2[1].innerText.trim(); }
              }
              break;
            }
          }
          if (!kyuhan && profileCurrentRank) kyuhan = profileCurrentRank;

          for (const table of tables) {
            const rows = table.querySelectorAll('tr');
            for (const row of rows) {
              if (row.innerText.includes('通算')) {
                const tds = row.querySelectorAll('td');
                if (tds.length >= 5) { tsuusan = tds[4].innerText.trim(); break; }
              }
            }
            if (tsuusan) break;
          }

          let winCount = 0;
          for (const table of tables) {
            if (table.innerText.includes('■開催中のレース')) {
              const rows = table.querySelectorAll('tr');
              if (rows.length < 3) break;
              const dateCells = rows[1].querySelectorAll('td');
              const raceCells = rows[2].querySelectorAll('td');
              let colPos = 0;
              
              for (let j = 0; j < dateCells.length && j < 6; j++) {
                const dateStr = dateCells[j].innerText.trim();
                const colSpan = parseInt(dateCells[j].getAttribute('colspan')) || 1;
                let raceText = 'ｰ';
                
                if (colPos < raceCells.length) {
                    const raceNameTd = raceCells[colPos];
                    const chakuTd = raceCells[colPos + 1];
                    let raceName = '', chaku = '';
                    if (raceNameTd?.querySelector('a')) raceName = raceNameTd.querySelector('a').innerText.trim();
                    if (chakuTd) {
                        const p = chakuTd.querySelector('p');
                        if (p?.getAttribute('title')) chaku = p.getAttribute('title').trim();
                        else chaku = chakuTd.innerText.trim() || '';
                    }
                    if (chaku === '1' || chaku === '１') winCount++;
                    if (raceName) raceText = `${raceTitle} ${dateStr}\n${raceName}${chaku ? `（${chaku}着）` : ''}`;
                }
                currentRace[j] = raceText;
                colPos += colSpan;
              }
              break;
            }
          }
          const numericTotal = tsuusan && !isNaN(parseInt(tsuusan)) ? parseInt(tsuusan) + winCount : null;
          return { name: playerInfo.name, url: playerInfo.url, kyuhan, kyuhanDate, kyuhanHist, kyuhanHistDate, nextKyuhan, profileCurrentRank, totalWins: numericTotal !== null ? numericTotal : '取得失敗', currentRace, totalWinsNumeric: numericTotal, failed: false };
        }, player);
        
        results.push(data);
        break;
      } catch (e) {
        if (attempt === 1) await page.waitForTimeout(2000);
        else results.push({ name: player.name, url: player.url, failed: true });
      }
    }
    await page.waitForTimeout(1000);
  }
  
  // JSONではなく、JSファイルとして書き出す（HTMLでそのまま読み込めるようにするため）
  fs.writeFileSync('player_data.js', 'const importedData = ' + JSON.stringify(results, null, 2) + ';', 'utf-8');
  await browser.close();
})();