const ProgressBar = require('ascii-progress');
const uniqBy = require('lodash.uniqby');

function createTeams(db, data) {
	// const data = uniqBy(csvData, 'ID');
	const bar = new ProgressBar({ 
		schema: ' [:bar] :current/:total :percent :elapseds',
		total: data.length,
		width: 50,
		callback: notify(db),
	});

	db.serialize(() => {
		db.run('DELETE FROM athletes');
		db.run('DELETE FROM sqlite_sequence WHERE name="athletes"');
	
		console.log('Create athletes...');

		db.all('SELECT * FROM teams', function(err, teams) {
			if (err) console.log(err);
			
			data.forEach(row => {
				const team = teams.find((team) => team.noc_name === row['NOC']);

				db.run(`INSERT INTO athletes (id, full_name, age, sex, params, team_id) 
					VALUES ($id, $full_name, $age, $sex, $params, $team_id)`, {
					$id: row['ID'],
					$full_name: row['Name'],
					$age: row['Age'],
					$sex: getSexEnum(row),
					$params: prepareParams(row),
					$team_id: team.id
				}, 
				function(err) {					
					if (err) {
						if (err.code !== 'SQLITE_CONSTRAINT') {
							console.log(err);
						}
					}
				});
				bar.tick();
			});
		});
	});
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

const notify = (db) => () => {
	db.get("SELECT COUNT(*) FROM athletes", function(err, row) {
		const count = Object.values(row)[0];
		console.log(` -- Successfully created ${count} athletes.`);
	});
	db.close();
}
