const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const parse = require('csv-parse');

const db = new sqlite3.Database('./db/olympic_history.db');

// initially we put all data into 'athletes' table, so we need to add not existing columns
// then we populate other tables from this one and delete added columns
const tempColumns = ['team', 'noc', 'games', 'year', 'season', 'city', 'sport', 'event', 'medal'];

tempColumns.forEach(column => {
	db.run(`ALTER TABLE athletes ADD COLUMN ${column} TEXT`, (err) => {
		console.log(err);
	});
});

let linesCount = 0;

fs.createReadStream('./csv/athlete_events.csv')
	.pipe(
		parse({
			delimiter: ',',
			columns: true,
			trim: true,
			to: 5
		})
	)
	.on('data', (line) => {
		// ID: '5',
		// Name: 'Christine Jacoba Aaftink',
		// Sex: 'F',
		// Age: '21',
		// Height: '185',
		// Weight: '82',
		// Team: 'Netherlands',
		// NOC: 'NED',
		// Games: '1988 Winter',
		// Year: '1988',
		// Season: 'Winter',
		// City: 'Calgary',
		// Sport: 'Speed Skating',
		// Event: 'Speed Skating Women\'s 500 metres',
		// Medal: 'NA' 

		console.log(line);

		db.run(`INSERT INTO athletes (
			full_name,
		) VALUES (
			${line['Name']}
		);`, (err) => {
			console.log(err)
		});

		linesCount++;
	})
	.on('error', (err) => {
		console.log('Error while reading file', err);
	})
	.on('end', () => {
		console.log(`importing is finished (${linesCount} lines).`);
	});

tempColumns.forEach(column => {
	db.run(`ALTER TABLE athletes DROP COLUMN ${column}`, (err) => {
		console.log(err);
	});
});

db.close();


function prepareParams(line) {
	const params = {};
	if (line['Weight']) params.weight = line['Weight'];
	if (line['Height']) params.height = line['Height'];
	return JSON.stringify(params);
}
