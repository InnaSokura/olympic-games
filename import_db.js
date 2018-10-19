const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const parse = require('csv-parse');
const ProgressBar = require('progress');

const db = new sqlite3.Database('./db/olympic_history.db');

let linesCount = 0;

db.serialize(() => {
	prepareDB();
	const bar = new ProgressBar('[:bar] :percent :current/:total (:elapseds)', { total: 271117, width: 30, clear: true });

	fs.createReadStream('./csv/athlete_events.csv')
		.pipe(
			parse({
				delimiter: ',',
				columns: true,
				trim: true,
				// to: 100
			})
		)
		.on('data', (line) => {
			db.run("INSERT INTO teams (name, noc_name) VALUES ($name, $noc_name)", {
				$name: line['Team'],
				$noc_name: line['NOC']
			}, 
			(err) => {
				if (err) {
					if (err.code !== 'SQLITE_CONSTRAINT') {
						console.log(err);
					}
				}
				bar.tick();
			});

			linesCount++;

			// db.run(`INSERT INTO teams (name, noc_name) VALUES (
			// 	${escape(line['Team'])}, 
			// 	${escape(line['NOC'])}
			// )`, (err) => {
			// 	if (err) {
			// 		if (err.code !== 'SQLITE_CONSTRAINT') {
			// 			console.log(err);
			// 		}
			// 	}
			// });

			// db.run(`INSERT INTO athletes (
			// 	full_name, sex, age, params, team_id
			// ) VALUES (
			// 	'${line['Name']}',
			// 	 ${getSexEnum(line)},
			// 	 ${line['Age']},
			// 	'${prepareParams(line)}',
			// 	0
			// )`, (err) => {
			// 	if (err) return console.log(err);
			// });
		})
		.on('error', (err) => {
			console.log('Error while reading file', err);
		})
		.on('end', () => {
			console.log('\n');
			console.log(`importing is finished (${linesCount} lines).`);
			db.close();
		});
});

function prepareDB() {
	db.run('DELETE FROM teams');
	db.run('DELETE FROM athletes');
	db.run('VACUUM');
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
