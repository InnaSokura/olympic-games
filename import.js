const Database = require('better-sqlite3');
const fs = require('fs');
const lineReader = require('readline');

const createTeams = require('./import/1_teams');
const createAthletes = require('./import/2_athletes');
const createGames = require('./import/3_games').default;
const createSports = require('./import/4_sports');
const createEvents = require('./import/5_events');
const createResults = require('./import/6_results');

const db = new Database('./db/olympic_history.db');
const data = [];
const startTime = Date.now();

console.log('Parsing CSV...');
let index = 0;

lineReader
  .createInterface({
    input: fs.createReadStream('./csv/athlete_events.csv')
  })
  .on('line', onEachLine)
  .on('close', () => {
		console.log(` -- Successfully parsed ${data.length} lines. (${(Date.now() - startTime) / 1000}s)`);

		db.transaction(() => {
			createTeams(db, data);
			createAthletes(db, data);
			createGames(db, data);
			createSports(db, data);
			createEvents(db, data);
			createResults(db, data);
		})();

		console.log(`Import finished!`);
		console.log(` -- Total time: ${(Date.now() - startTime) / 1000}s.`);
		db.close();
  });

function onEachLine(line) {
	const parsedLine = line
		.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g)                      // split by comma that not in quotes
		.map((str) =>                                                    
			str.charAt(0) === '"' &&                                        // remove 1st and last quotes from string
			str.charAt(str.length - 1) === '"' 
				? str.substr(1, str.length - 2) 
				: str
		);

	index && data.push({
		ID:       parsedLine[0],
		Name:     parsedLine[1],
		Sex:      parsedLine[2],
		Age:      parsedLine[3],
		Height:   parsedLine[4],
		Weight:   parsedLine[5],
		Team:     parsedLine[6],
		NOC:      parsedLine[7],
		Games:    parsedLine[8],
		Year:     parsedLine[9],
		Season:   parsedLine[10],
		City:     parsedLine[11],
		Sport:    parsedLine[12],
		Event:    parsedLine[13],
		Medal:    parsedLine[14],
	});

	index++;
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
