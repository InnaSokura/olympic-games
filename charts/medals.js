const Database = require('better-sqlite3');
const db = new Database('./db/olympic_history.db', { readonly: true });

let SEASON;
let NOC;
let MEDAL; 

// Params: season [winter|summer] NOC medal_name [gold|silver|bronze] (in any order).
const params = process.argv.slice(2);

params.forEach((input) => {
  const param = input.toLowerCase();
  if (['winter', 'summer'].includes(param)) SEASON = param; else
  if (['gold', 'silver', 'bronze'].includes(param)) MEDAL = param; else 
  NOC = param;
});

if (!SEASON) return console.log(' -- warning: param SEASON is required!');
if (!NOC) return console.log(' -- warning: param NOC is required!');

// SELECT
//  a,
//  b
// FROM
//  A
// LEFT JOIN B ON A.f = B.f
// WHERE search_condition;
const results = db.prepare(`
  (
    SELECT * FROM results 
    LEFT JOIN athletes ON athletes.id = results.athlete_id
  ) AS rt
  LEFT JOIN teams ON teams.id = rt.team_id
  WHERE noc_name = (?)
`).all(NOC);

console.log('results', results.length);

console.log("Building 'medals' chart...");
console.log(' -- params: ', { SEASON, NOC, MEDAL });
