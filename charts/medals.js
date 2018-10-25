const Database = require('better-sqlite3');
const buildChart = require('./chartBuilder');
const db = new Database('./db/olympic_history.db', { readonly: true });
const params = process.argv.slice(2);

// Params: 
//   season [winter|summer], 
//   NOC, 
//   medal_name [gold|silver|bronze] 
// (in any order).
let SEASON, NOC, MEDAL;

params.forEach((input) => {
  const param = input.toLowerCase();
  if (['winter', 'summer'].includes(param)) SEASON = { summer: 0, winter: 1 }[param]; else
  if (['gold', 'silver', 'bronze'].includes(param)) MEDAL = { 'na': 0, 'gold': 1, 'silver': 2, 'bronze': 3 }[param]; else 
  NOC = param.toUpperCase();
});

if (![0, 1].includes(SEASON)) {
  return console.log(' -- warning: param SEASON is required!');
}
if (!NOC) {
  return console.log(' -- warning: param NOC is required!');
}

const results = db.prepare(`
  SELECT DISTINCT year, COUNT(noc_name) medals from games
  LEFT JOIN (
    SELECT noc_name, y FROM teams
      LEFT JOIN athletes ON athletes.team_id = teams.id
      INNER JOIN (
        SELECT * from results WHERE results.medal ${MEDAL ? '= $MEDAL' : 'IN (1, 2, 3)'}
      ) AS RES ON RES.athlete_id = athletes.id 
      INNER JOIN (
        SELECT id, year y from games WHERE games.season = $SEASON
      ) AS GAM ON RES.game_id = GAM.id
    WHERE noc_name = $NOC
  ) AS MEDALS ON year = MEDALS.y
  GROUP BY year 
  ORDER BY year ASC
`).all({
  NOC,
  SEASON,
  MEDAL
});

console.log(`----------------------
  "AMOUNT OF MEDALS"  
----------------------
    SEASON: ${['SUMMER', 'WINTER'][SEASON]}
    NOC:    ${NOC}
    MEDAL:  ${['NA', 'GOLD', 'SILVER', 'BRONZE'][MEDAL] || 'ALL TYPES'}
`);

buildChart(results, ['year', 'medals']);
