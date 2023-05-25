const { 
	QUERY_EXECUTION_ERROR_MSG, 
	QUERY_CONNECTION_ERROR_MSG 
} = require('./../../constants');

const { buildKeyString } = require('../utils/helper.util');
const pool = require('./../configs/pool.config');
const slackVars = require('./../../slack-vars');
const { WebClient } = require('@slack/web-api');
const { slackApp } = require('./../configs/slack.config');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const sendDailyDutchVocabToSlack = async (recordCount) => {
	await getVocabularyRecords(recordCount);
}

const getVocabularyRecords = async (recordCount) => {
	pool.connect((err, client, release) => {
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

module.exports = {
    sendDailyDutchVocabToSlack
}