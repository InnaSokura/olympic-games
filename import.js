const Database = require('better-sqlite3');
const fs = require('fs');
const parse = require('csv-parse');

const createTeams = require('./import/1_teams');
const createAthletes = require('./import/2_athletes');
const createGames = require('./import/3_games');

const db = new Database('./db/olympic_history.db');
const data = [];

console.log('Start parsing csv...');

fs.createReadStream('./csv/athlete_events.csv')
	.pipe(
		parse({
			delimiter: ',',
			columns: true,
			trim: true,
			to: 10000,
		})
	)
	.on('data', (row) => {
		data.push(row);
	})
	.on('error', (err) => {
		console.log('Error while reading file', err);
	})
	.on('end', () => {
		console.log(` -- Successfully parsed ${data.length} lines.`);
	
		db.transaction(() => {
			// createTeams(db, data);
			// createAthletes(db, data);
			createGames(db, data);
		})();

		db.close();
	});

// CSV ROW DATA:
// ============================================
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