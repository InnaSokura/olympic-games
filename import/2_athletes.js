function createTeams(db, data) {
  db.run('DELETE FROM teams');
  db.run('DELETE FROM sqlite_sequence WHERE name="teams"');

  console.log('Create teams...');

  data.forEach(row => {
		db.run("INSERT INTO teams (name, noc_name) VALUES ($name, $noc_name)", {
      $name: row['Team'],
      $noc_name: row['NOC']
    }, 
    (err) => {
      if (err) {
        if (err.code !== 'SQLITE_CONSTRAINT') {
          console.log(err);
        }
      }
    });
  });

  db.get("SELECT COUNT(*) FROM teams", function(err, row) {
    const teams = Object.values(row)[0];
    console.log(` -- Successfully created ${teams} teams.`);
  })
}

module.exports = createTeams;

function prepareParams(line) {
	const params = {};
	if (line['Weight'] && line['Weight'] !== 'NA') params.weight = line['Weight'];
	if (line['Height'] && line['Height'] !== 'NA') params.height = line['Height'];
	return JSON.stringify(params);
}

function getSexEnum(line) {
	return { M: 0, F: 1 }[line['Sex']];
}
