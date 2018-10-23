const uniqBy = require('lodash.uniqby');
const integerOrNull = require('./utils').integerOrNull;

function createGames(db, csvData) {  
	db.transaction(() => {
    db.prepare('DELETE FROM games').run();
    db.prepare('DELETE FROM sqlite_sequence WHERE name="games"').run();
  })();

  console.log('Create games...');

  const data = uniqBy(csvData, _ => `${_['Season']} ${_['Year']} ${_['City']}`);
  const insert = db.prepare("INSERT INTO games (year, season, city) VALUES ($year, $season, $city)");

  db.transaction((rows) => {
		for (const row of rows) {
      if (row['Year'] === '1906') continue; // skip 1906 - task constraint
      try {
        insert.run({
          year: integerOrNull(row['Year']),
          season: { summer: 0, winter: 1 }[row['Season'].toLowerCase()],
          city: row['City'],
        });
      } catch(err) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(err);
        }
      }
		};
  })(data);
  
	// on 'games' insert complete
  const res = db.prepare("SELECT COUNT(*) FROM games").get();
  const count = Object.values(res)[0];
  console.log(` -- Successfully created ${count} games.`);
}

module.exports = createGames;
