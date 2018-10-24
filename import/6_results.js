const find = require('lodash.find');
const getSeasonEnum = require('./3_games').getSeasonEnum;

function createResults(db, data) {  
	db.transaction(() => {
    db.prepare('DELETE FROM results').run();
    db.prepare('DELETE FROM sqlite_sequence WHERE name="results"').run();
  })();

  console.log('Create results...');

  const insert = db.prepare(`INSERT INTO results (medal, athlete_id, game_id, sport_id, event_id) VALUES (
    $medal,
    $athlete_id,
    $game_id,
    $sport_id,
    $event_id
  )`);

  db.transaction((rows) => {
    // using lodash.find to get ID's is 4x faster then subqueries
    const games = db.prepare("SELECT * FROM games").all();
    const sports = db.prepare("SELECT * FROM sports").all();
    const events = db.prepare("SELECT * FROM events").all();

    for (const row of rows) {
      if (row['Year'] === '1906') continue; // skip 1906 - task constraint
      try {
        insert.run({
          medal: {'NA': 0, 'Gold': 1, 'Silver': 2, 'Bronze': 3}[row['Medal']], 
          athlete_id: row['ID'],
          game_id: find(games, { year: +row['Year'], season: getSeasonEnum(row['Season']) }).id,
          sport_id: find(sports, { name: row['Sport'] }).id,
          event_id: find(events, { name: row['Event'] }).id,
        });
      } catch(err) {
        console.log(err);
      }
		};
  })(data);
  
	// on 'results' insert complete
  const res = db.prepare("SELECT COUNT(*) FROM results").get();
  const count = Object.values(res)[0];
  console.log(` -- Successfully created ${count} results.`);
}

module.exports = createResults;
