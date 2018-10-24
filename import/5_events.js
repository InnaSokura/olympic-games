const uniqBy = require('lodash.uniqby');

function createEvents(db, csvData) {  
	db.transaction(() => {
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM sqlite_sequence WHERE name="events"').run();
  })();

  console.log('Create events...');

  const data = uniqBy(csvData, 'Event');
  const insert = db.prepare("INSERT INTO events (name) VALUES ($name)");

  db.transaction((rows) => {
		for (const row of rows) {
      try {
        insert.run({
          name: row['Event'],
        });
      } catch(err) {
        if (err.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(err);
        }
      }
		};
  })(data);
  
	// on 'events' insert complete
  const res = db.prepare("SELECT COUNT(*) FROM events").get();
  const count = Object.values(res)[0];
  console.log(` -- Successfully created ${count} events.`);
}

module.exports = createEvents;
