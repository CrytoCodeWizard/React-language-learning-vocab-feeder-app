require('dotenv').config();
const schedule = require('node-schedule');
const { Pool } = require('pg');
const { WebClient } = require('@slack/web-api');
const { parse } = require('qs');

const express = require("express");
const PORT = process.env.NODE_PORT || 3001;
const app = express();

const slackVars = require('./slack-vars');

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
				slackVars.data = result.rows;
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
		let pronunciationString = '';
		if(data[entry].pronunciationlink === '#') {
			pronunciationString = 'No URL found';
		} else {
			pronunciationString = '<' + data[entry].pronunciationlink + '|(Pronunciation)>';
		}
		blockStr.push({
			"type" : "section",
			"fields" : [{
				"type": "mrkdwn",
				"text" : "*Dutch:*\n"+data[entry].dutch+" - "+ pronunciationString
			},
			{
				"type": "mrkdwn",
				"text": "*English:*\n"+data[entry].english
			}]
		});
		blockStr.push({
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Mark as Seen",
						"emoji": true
					},
					"value": slackVars.seenString,
					"action_id": "actionId-" + data[entry].id + '-1' 
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Mark as Mastered",
						"emoji": true
					},
					"value": slackVars.masteredString,
					"action_id": "actionId-" + data[entry].id + '-2'
				}
			]
		});
	}
	return JSON.stringify(blockStr);
}

function buildPronunciationString(pronunciationlink) {
	return pronunciationlink === '#' ? 'No URL found' : ('<' + pronunciationlink + '|(Pronunciation)>');
}

function initBlockStrWithDailyMessageHeaderTitle() {
	return [
		{
			"type" : "header",
			"text": {
				"type": "plain_text",
				"emoji" : false,
				"text" : "Words for " + new Date().toLocaleString('en-US', { dateStyle: 'long' })
			}
		}
	];
}

function updateIdActionList(actionValue, rowIdOfAction) {
	if(actionValue === slackVars.masteredString) {
		slackVars.masteredIds.push(rowIdOfAction);
	} else if(actionValue === slackVars.seenString) {
		slackVars.seenIds.push(rowIdOfAction);
	}
}

function getRowIdFromSlackAction(payloadActionId) {
	return parseInt(payloadActionId.split('-')[1]);
}

function buildUpdatedDutchBlockStr(payloadAction) {
	const rowIdOfAction = getRowIdFromSlackAction(payloadAction.action_id);
	updateIdActionList(payloadAction.value, rowIdOfAction);

	const blockStr = initBlockStrWithDailyMessageHeaderTitle();
	const data = slackVars.data;
	for(let entryIndex in data) {
		if(!slackVars.masteredIds.includes(data[entryIndex].id) && !slackVars.seenIds.includes(data[entryIndex].id) && rowIdOfAction !== data[entryIndex].id) {
			blockStr.push({
				"type" : "section",
				"fields" : [{
					"type": "mrkdwn",
					"text" : "*Dutch:*\n"+data[entryIndex].dutch+" - "+ buildPronunciationString(data[entryIndex].pronunciationlink)
				},
				{
					"type": "mrkdwn",
					"text": "*English:*\n"+data[entryIndex].english
				}]
			});

			blockStr.push({
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Mark as Seen",
							"emoji": true
						},
						"value": slackVars.seenString,
						"action_id": "actionId-" + data[entryIndex].id + '-1'
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Mark as Mastered",
							"emoji": true
						},
						"value": slackVars.masteredString,
						"action_id": "actionId-" + data[entryIndex].id + '-2'
					}
				]
			});
		} else {
			let actionStr = slackVars.masteredIds.includes(data[entryIndex].id) ? 'mastered' : 'seen';
			blockStr.push({
				"type" : "section",
				"fields" : [{
					"type": "mrkdwn",
					"text" : "*Dutch:*\n"+data[entryIndex].dutch+" - marked as " + actionStr
				}]
			});
		}
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
		client.query("SELECT name FROM category WHERE name != '' ORDER BY category_order ASC", async (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			} else {
				let setNames = [];
				for(let row in result.rows) {
					setNames.push(result.rows[row].name);
				}

				res.send(setNames);
			}
		});
	});
});

app.get("/getLessonPeopleNames", async (req, res) => {
	await pool.connect(async (err, client, release) => {
		if(err) {
			return console.error('Error acquiring client', err.stack)
		}
		client.query("SELECT person, TO_CHAR(lesson_date, 'YYYY-MM-DD') as lesson_date, notes, lesson_title FROM lesson", async (err, result) => {
			release();
			if(err) {
				return console.error('Error executing query', err.stack);
			} else {
				const lessons = {};
				for(let row in result.rows) {
					let capitalizedName = result.rows[row].person.charAt(0).toUpperCase() + result.rows[row].person.slice(1);

					if(Object.keys(lessons).includes(capitalizedName)) {
						lessons[capitalizedName].push(result.rows[row]);
					} else {
						lessons[capitalizedName] = [result.rows[row]];
					}
				}

				res.send(lessons);
			}
		});
	});
});

app.post("/api/vocab", async (req, res) => {
	let body = "";

	req.on('data', chunk => {
		body += chunk.toString();
	});
	
	req.on('end', () => {
		const payload = JSON.parse(
			parse(decodeURIComponent(body)).payload
		);

		(async () => {
			const result = await web.chat.update({
				blocks: buildUpdatedDutchBlockStr(payload.actions[0]),
				channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
				text: "You have marked a vocab record as seen or mastered.",
				ts: payload.message.ts
			});
		})();

		res.end('ok');
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
		let queryStr = "SELECT id, english, dutch, pronunciationLink FROM vocabulary";
		const params = [];
		if(JSON.parse(body).category !== 'Review All') {
			queryStr += " WHERE set_name = $1";
			params.push(JSON.parse(body).category);
		}

		await pool.connect(async (err, client, release) => {
			if(err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(queryStr, params, async (err, result) => {
				release();
				if(err) {
					return console.error('Error executing query', err.stack);
				} else {
					res.send(result.rows);
				}
			});
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});