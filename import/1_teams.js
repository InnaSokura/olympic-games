const uniqBy = require('lodash.uniqby');

function createTeams(db, csvData) {  
	db.transaction(() => {
    db.prepare('DELETE FROM teams').run();
    db.prepare('DELETE FROM sqlite_sequence WHERE name="teams"').run();
  })();

  console.log('Create teams...');

  const data = uniqBy(csvData, 'NOC');
  const insert = db.prepare("INSERT INTO teams (name, noc_name) VALUES ($name, $noc_name)");
  const preparedData = data.map((row) => ({
    name: row['Team'],
    noc_name: row['NOC']
  }));
  
  db.transaction((rows) => {
		for (const row of rows) {
      try {
        insert.run(row);
      } catch(err) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(err);
        }
      }
		};
  })(preparedData);
  
	// on 'teams' insert complete
  const res = db.prepare("SELECT COUNT(*) FROM teams").get();
  const count = Object.values(res)[0];
  console.log(` -- Successfully created ${count} teams.`);
}

module.exports = createTeams;
