const uniqBy = require('lodash.uniqby');

function createSports(db, csvData) {  
	db.transaction(() => {
    db.prepare('DELETE FROM sports').run();
    db.prepare('DELETE FROM sqlite_sequence WHERE name="sports"').run();
  })();

  console.log('Create sports...');

  const data = uniqBy(csvData, 'Sport');
  const insert = db.prepare("INSERT INTO sports (name) VALUES ($name)");

  db.transaction((rows) => {
		for (const row of rows) {
      try {
        insert.run({
          name: row['Sport'],
        });
      } catch(err) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(err);
        }
      }
		};
  })(data);
  
	// on 'sports' insert complete
  const res = db.prepare("SELECT COUNT(*) FROM sports").get();
  const count = Object.values(res)[0];
  console.log(` -- Successfully created ${count} sports.`);
}

module.exports = createSports;
