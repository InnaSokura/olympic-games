const uniqBy = require('lodash.uniqby');
const integerOrNull = require('./utils').integerOrNull;

function createAthletes(db, csvData) {
	db.transaction(() => {
		db.prepare('DELETE FROM athletes').run();
		db.prepare('DELETE FROM sqlite_sequence WHERE name="athletes"').run();
	})();

	console.log('Create athletes...');

	const data = uniqBy(csvData, 'ID');
	const insert = db.prepare(
		`INSERT INTO athletes (id, full_name, age, sex, params, team_id) 
		 VALUES ($id, $full_name, $age, $sex, $params, $team_id)`
	);

	const teams = db.prepare("SELECT * FROM teams").all();
	const preparedData = data.map((row) => {
		const team = teams.find((team) => team.noc_name === row['NOC']);
		return {
			id: row['ID'],
			full_name: row['Name'],
			age: integerOrNull(row['Age']),
			sex: { M: 0, F: 1 }[row['Sex']],
			params: prepareParams(row),
			team_id: team.id
		}
	});

	db.transaction((rows) => {
		for (const row of rows) insert.run(row);
	})(preparedData);

	// on 'athletes' insert complete
	const res = db.prepare("SELECT COUNT(*) FROM athletes").get();
	const count = Object.values(res)[0];
	console.log(` -- Successfully created ${count} athletes.`);
}

function prepareParams(line) {
	const params = {};
	if (line['Weight'] && line['Weight'] !== 'NA') params.weight = line['Weight'];
	if (line['Height'] && line['Height'] !== 'NA') params.height = line['Height'];
	return JSON.stringify(params);
}

module.exports = createAthletes;
