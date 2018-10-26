const Database = require('better-sqlite3');
const buildChart = require('./chartBuilder');
const db = new Database('./db/olympic_history.db', { readonly: true });
const params = process.argv.slice(2);

// If year is not specified take results for all time.
// If medal type is not specified take results for all types.
// Show resulting chart only for those teams, that have more than average result: 
// if average amount for all teams is 200 - show only teams with more than 200 medals.

// Params: 
//   season [winter|summer] - is required
//   year 
//   medal_type [gold|silver|bronze] 
// (in any order).
let SEASON, YEAR, MEDAL;

params.forEach((input) => {
  const param = input.toLowerCase();
  if (['winter', 'summer'].includes(param)) SEASON = { summer: 0, winter: 1 }[param]; else
  if (['gold', 'silver', 'bronze'].includes(param)) MEDAL = { 'na': 0, 'gold': 1, 'silver': 2, 'bronze': 3 }[param]; else 
  YEAR = param;
});

if (![0, 1].includes(SEASON)) {
  return console.log(' -- warning: param SEASON is required!');
}

const results = db.prepare(`
  SELECT noc_name noc, COUNT(medal) medals FROM results
    LEFT JOIN athletes ON results.athlete_id = athletes.id
    LEFT JOIN teams ON athletes.team_id = teams.id
    LEFT JOIN games ON results.game_id = games.id
  WHERE ${YEAR ? `year = $YEAR AND` : ''} season = $SEASON AND medal ${MEDAL ? '= $MEDAL' : 'IN (1, 2, 3)'}
  GROUP BY noc_name
  ORDER BY count(medal) DESC
`).all({
  SEASON,
  YEAR,
  MEDAL
});

console.log(`----------------------
     "TOP TEAMS"  
----------------------
    SEASON: ${['SUMMER', 'WINTER'][SEASON]}
    YEAR:   ${YEAR || 'ALL TIME'}
    MEDAL:  ${['NA', 'GOLD', 'SILVER', 'BRONZE'][MEDAL] || 'ALL TYPES'}
`);

buildChart(
  trimLessAvg(results), 
  ['noc', 'medals']
);

function trimLessAvg(data) {
  const sum = data.reduce((sum, { medals }) => sum + medals, 0);
  const avg = Math.floor(sum / data.length);
  return data.filter(_ => _.medals >= avg);
}
