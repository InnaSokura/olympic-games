const ProgressBar = require('ascii-progress');
const uniqBy = require('lodash.uniqby');

function createTeams(db, csvData) {
	db.transaction(() => {
		db.prepare('DELETE FROM athletes').run();
		db.prepare('DELETE FROM sqlite_sequence WHERE name="athletes"').run();
	})();

	console.log('Create athletes...');

	const data = uniqBy(csvData, 'ID');
	const bar = new ProgressBar({ 
		schema: ' [:bar] :current/:total :percent :elapseds',
		total: data.length,
		width: 50,
		callback: onProgressComplete(db),
	});

	const teams = db.prepare("SELECT * FROM teams").all();
	const insert = db.prepare(
		`INSERT INTO athletes (id, full_name, age, sex, params, team_id) 
		 VALUES ($id, $full_name, $age, $sex, $params, $team_id)`
	);
	const insertMany = db.transaction((rows) => {
		for (const row of rows) {
			insert.run(row);
			bar.tick();
		};
	});
	insertMany(data.map((row) => {
		const team = teams.find((team) => team.noc_name === row['NOC']);
		return {
			id: row['ID'],
			full_name: row['Name'],
			age: row['Age'],
			sex: getSexEnum(row),
			params: prepareParams(row),
			team_id: team.id
		}
	}));
}

function prepareParams(line) {
	const params = {};
	if (line['Weight'] && line['Weight'] !== 'NA') params.weight = line['Weight'];
	if (line['Height'] && line['Height'] !== 'NA') params.height = line['Height'];
	return JSON.stringify(params);
}

function getSexEnum(line) {
	return { M: 0, F: 1 }[line['Sex']];
}

const onProgressComplete = (db) => () => {
	const res = db.prepare("SELECT COUNT(*) FROM athletes").get();
	const count = Object.values(res)[0];
	console.log(` -- Successfully created ${count} athletes.`);
}

module.exports = createTeams;
