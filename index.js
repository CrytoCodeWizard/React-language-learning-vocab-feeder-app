require('dotenv').config();
const schedule = require('node-schedule');
const { Pool } = require('pg');
const { WebClient } = require('@slack/web-api');
const { parse } = require('qs');
const { App } = require('@slack/bolt');

const express = require("express");
const PORT = process.env.NODE_PORT || 3001;
const app = express();

const slackVars = require('./slack-vars');
const { 
	DEFAULT_VOCAB_BATCH_COUNT, 
	SEND_DAILY_SLACK_BTN_LABEL, 
	QUERY_EXECUTION_ERROR_MSG, 
	QUERY_CONNECTION_ERROR_MSG 
} = require('./constants');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const slackApp = new App({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	token: process.env.SLACK_BOT_TOKEN,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
	port: process.env.PORT || 3000
});

(async () => {
	// Start the app
	await slackApp.start();
  
	sendDailyDutchVocabToSlack(DEFAULT_VOCAB_BATCH_COUNT);
})();

schedule.scheduleJob('* * * * *', () => {
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

const buildKeyString = (resultRows) => {
	let keyString = '';
	for(let row in resultRows) {
		keyString += resultRows[row].id;
	}

	return keyString;
}

const getVocabularyRecords = async (recordCount) => {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}
		client.query('SELECT id, dutch, english, pronunciationLink FROM vocabulary WHERE seen != TRUE AND mastered != TRUE ORDER BY random() LIMIT $1', [recordCount], (err, result) => {
			release();
			if(err) {
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			} else {
				const keyString = buildKeyString(result.rows);
				slackVars.data[keyString] = result.rows;

				postSlackMessage(result.rows, keyString);
			}
		});
	});
}

const sendDailyDutchVocabToSlack = async (recordCount) => {
	await getVocabularyRecords(recordCount);
}

const updateVocabRecordsAsSeen = async (field, vocabId) => {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}

		let queryStr = 'UPDATE vocabulary SET ' + field + ' = TRUE WHERE id = ANY($1)';
		client.query(queryStr, [[vocabId]], (err, result) => {
			release();
			if(err) {
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			}
		});
	});
}

const resetVocabRecordsToUnseen = (field) => {
	pool.connect((err, client, release) => {
		if(err) {
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}

		let queryStr = 'UPDATE vocabulary SET ' + field + ' = FALSE';
		client.query(queryStr, (err, result) => {
			release();
			if(err) {
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			}
		});
	});
}

const postSlackMessage = (data, keyString) => {
	(async () => {
		let blockStr = buildDutchBlockStr(data);

		const result = await web.chat.postMessage({
			blocks: JSON.stringify(buildDutchBlockStr(data)),
			channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
			text: 'Your daily Dutch vocab has arrived!'
		});

		let indexes = [2, 4, 6];
		for(let index in indexes) {
			for(let element in blockStr[indexes[index]].elements) {
				slackApp.action(blockStr[indexes[index]].elements[element].action_id, async ({ body, ack, client }) => {
		
					// Acknowledge the action
					await ack();
				
					(async () => {
						const updateResult = await client.chat.update({
							blocks: buildUpdatedDutchBlockStr(body.actions[0].action_id, body.actions[0].value, keyString),
							channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
							text: "You have marked a vocab record as seen or mastered.",
							ts: result.ts
						});
					})();
				});
			}
		}
	})();
}

const buildDutchBlockStr = (data) => {
	const blockStr = initBlockStrWithDailyMessageHeaderTitle();
	
	for(let entry in data) {
		blockStr.push({
			"type" : "section",
			"fields" : [{
				"type": "mrkdwn",
				"text" : "*Dutch:*\n"+data[entry].dutch+" - "+ buildPronunciationString(data[entry].pronunciationlink)
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

	return blockStr;
}

const buildPronunciationString = (pronunciationlink) => {
	return pronunciationlink === '#' ? 'No URL found' : ('<' + pronunciationlink + '|(Pronunciation)>');
}

const initBlockStrWithDailyMessageHeaderTitle = () => {
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

const updateIdActionList = (actionValue, rowIdOfAction) => {
	updateVocabRecordsAsSeen(actionValue, rowIdOfAction);
	if(actionValue === slackVars.masteredString) {
		slackVars.masteredIds.push(rowIdOfAction);
	} else if(actionValue === slackVars.seenString) {
		slackVars.seenIds.push(rowIdOfAction);
	}
}

const getRowIdFromSlackAction = (payloadActionId) => {
	return parseInt(payloadActionId.split('-')[1]);
}


const buildUpdatedDutchBlockStr = (actionId, actionValue, keyString) => {
	const rowIdOfAction = getRowIdFromSlackAction(actionId);
	updateIdActionList(actionValue, rowIdOfAction);

	const blockStr = initBlockStrWithDailyMessageHeaderTitle();
	const data = slackVars.data[keyString];

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
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}
		client.query("SELECT name FROM category WHERE name != '' ORDER BY category_order ASC", async (err, result) => {
			release();
			if(err) {
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
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
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}
		client.query("SELECT person, TO_CHAR(lesson_date, 'YYYY-MM-DD') as lesson_date, notes, lesson_title FROM lesson", async (err, result) => {
			release();
			if(err) {
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
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
	// resetVocabRecordsToUnseen(); // TODO: REMOVE AFTER ACTIVE DEV IS DONE
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
				return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
			}
			client.query(queryStr, params, async (err, result) => {
				release();
				if(err) {
					return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
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