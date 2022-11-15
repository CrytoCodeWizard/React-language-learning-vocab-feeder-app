require('dotenv').config();
const schedule = require('node-schedule');
const { Pool } = require('pg');
const { WebClient } = require('@slack/web-api');

const express = require("express");
const PORT = process.env.NODE_PORT || 3001;
const app = express();

const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const DEFAULT_VOCAB_BATCH_COUNT = 3;
const SEND_DAILY_SLACK_BTN_LABEL = 'Send Daily Dutch Vocab';

schedule.scheduleJob('30 07 * * *', function(){
	sendDailyDutchVocabToSlack(DEFAULT_VOCAB_BATCH_COUNT);
});

const pool = new Pool({
	host: process.env.POSTGRES_HOST,
	user: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

const getVocabularyRecords = async function(recordCount) {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query('SELECT id, dutch, english, pronunciationLink FROM vocabulary WHERE seen != TRUE AND mastered != TRUE ORDER BY random() LIMIT $1', [recordCount], (err, result) => {
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

const sendDailyDutchVocabToSlack = async function(recordCount) {
	await getVocabularyRecords(recordCount);
}

const updateVocabRecordsAsSeen = async function(data) {
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

app.get("/getSlackInfo", (req, res) => {
	res.json({ sendDailySlackBtnLabel: SEND_DAILY_SLACK_BTN_LABEL });
});

app.get("/getReviewCategories", async (req, res) => {
	await pool.connect(async (err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query("SELECT DISTINCT on (set_name) set_name FROM vocabulary WHERE set_name != ''", async (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			} else {
				let setNames = [];
				for(let row in result.rows) {
					setNames.push(result.rows[row].set_name);
				}

				res.send(setNames);
			}
		});
	});
});

app.post("/sendSlack", async (req, res) => {
	resetVocabRecordsToUnseen(); // TODO: REMOVE AFTER ACTIVE DEV IS DONE
	let body = "";
	req.on('data', chunk => {
		body += chunk.toString();
	});
	req.on('end', () => {
		res.end('ok');
		sendDailyDutchVocabToSlack(JSON.parse(body).recordCount);
	});
});

app.post("/getVocabForCategory", async (req, res) => {
	let body = "";
	req.on('data', chunk => {
		body += chunk.toString();
	});
	req.on('end', async () => {

		await pool.connect(async (err, client, release) => {
			if(err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query("SELECT id, english, dutch, pronunciationLink FROM vocabulary WHERE set_name = $1", [JSON.parse(body).category], async (err, result) => {
				release();
				if(err) {
					return console.error('Error executing query', err.stack);
				} else {
					console.log(result.rows);
					res.send(result.rows);
				}
			});
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});