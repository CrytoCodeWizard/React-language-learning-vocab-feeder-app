require('dotenv').config();
const schedule = require('node-schedule');
const { Pool } = require('pg');
const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const EXPECTED_VOCAB_BATCH_COUNT = 3;

schedule.scheduleJob('30 07 * * *', function(){
	console.log('running');
	// sendDailyDutchVocabToSlack();
});

const pool = new Pool({
	host: 'localhost',
	user: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: 'vocabdb',
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});
resetVocabRecordsToUnseen();

function sendDailyDutchVocabToSlack() {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query('SELECT id, dutch, english, pronunciationLink FROM vocabulary WHERE seen != TRUE AND mastered != TRUE ORDER BY random() LIMIT $1', [EXPECTED_VOCAB_BATCH_COUNT], (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			} else {
				postSlackMessage(result.rows);
				updateVocabRecordsAsSeen(result.rows);
			}
		});
	});
}

function updateVocabRecordsAsSeen(data) {
	const vocabIds = [];
	for(let entry in data) {
		vocabIds.push(data[entry].id);
	}
	pool.connect((err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query('UPDATE vocabulary SET seen = TRUE WHERE id = ANY($1)', [vocabIds], (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			}
		});
	});
}

function resetVocabRecordsToUnseen() {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query('UPDATE vocabulary SET seen = FALSE', (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			}
			console.log('done!');
		});
	});
}

function postSlackMessage(data) {
	(async () => {
		const result = await web.chat.postMessage({
			blocks: buildDutchBlockStr(data),
			channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
			text: 'Your daily Dutch vocab has arrived!'
		});
	})();
}

function buildDutchBlockStr(data) {
	const blockStr = [
		{
			"type" : "header",
			"text": {
				"type": "plain_text",
				"emoji" : false,
				"text" : "Words for " + new Date().toLocaleString('en-US', { dateStyle: 'long' })
			}
		}
	];
	
	for(let entry in data) {
		blockStr.push({
			"type" : "section",
			"fields" : [{
				"type": "mrkdwn",
				"text" : "*Dutch:*\n"+data[entry].dutch+" <"+data[entry].pronunciationlink+"|(Pronunciation)>"
			},
			{
				"type": "mrkdwn",
				"text": "*English:*\n"+data[entry].english
			}]
		});
	}
	return JSON.stringify(blockStr);
}