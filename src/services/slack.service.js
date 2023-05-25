const { 
	QUERY_EXECUTION_ERROR_MSG, 
	QUERY_CONNECTION_ERROR_MSG,
	SLACK_DAILY_MSG_HEADER,
	SLACK_UPDATE_MSG_HEADER,
	SLACK_MARK_AS_MASTERED_MSG,
	SLACK_MARK_AS_SEEN_MSG,
	SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
	SEEN_STRING,
	MASTERED_STRING
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
		const blockStr = buildDutchBlockStr(data);

		const result = await web.chat.postMessage({
			blocks: JSON.stringify(blockStr),
			channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
			text: SLACK_DAILY_MSG_HEADER
		});

		for(let i in blockStr) {
			if(blockStr[i].type === 'actions') {
				for(let element in blockStr[i].elements) {
					slackApp.action(blockStr[i].elements[element].action_id, async ({ body, ack, client }) => {
						await ack();
					
						(async () => {
							await client.chat.update({
								blocks: buildUpdatedDutchBlockStr(body.actions[0].action_id, body.actions[0].value, keyString),
								channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
								text: SLACK_UPDATE_MSG_HEADER,
								ts: result.ts
							});
						})();
					});
				}
			}
		}
	})();
}

const buildDutchBlockStr = (data) => {
	const blockStr = initBlockStrWithDailyMessageHeaderTitle();
	
	for(let entry in data) {
		blockStr.push({
			"type" : SLACK_BLOCK_TYPE_SECTION,
			"fields" : [{
				"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
				"text" : "*Dutch:*\n"+data[entry].dutch+" - "+ buildPronunciationString(data[entry].pronunciationlink)
			},
			{
				"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
				"text": "*English:*\n"+data[entry].english
			}]
		});
		blockStr.push({
			"type": SLACK_BLOCK_TYPE_ACTION,
			"elements": [
				{
					"type": SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
					"text": {
						"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
						"text": SLACK_MARK_AS_SEEN_MSG,
						"emoji": true
					},
					"value": SEEN_STRING,
					"action_id": "actionId-" + data[entry].id + '-1' 
				},
				{
					"type": SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
					"text": {
						"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
						"text": SLACK_MARK_AS_MASTERED_MSG,
						"emoji": true
					},
					"value": MASTERED_STRING,
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
				"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
				"emoji" : false,
				"text" : "Words for " + new Date().toLocaleString('en-US', { dateStyle: 'long' })
			}
		}
	];
}

const updateIdActionList = (actionValue, rowIdOfAction) => {
	updateVocabRecordsAsSeen(actionValue, rowIdOfAction);
	if(actionValue === MASTERED_STRING) {
		slackVars.masteredIds.push(rowIdOfAction);
	} else if(actionValue === SEEN_STRING) {
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
				"type" : SLACK_BLOCK_TYPE_SECTION,
				"fields" : [{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
					"text" : "*Dutch:*\n"+data[entryIndex].dutch+" - "+ buildPronunciationString(data[entryIndex].pronunciationlink)
				},
				{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
					"text": "*English:*\n"+data[entryIndex].english
				}]
			});

			blockStr.push({
				"type": SLACK_BLOCK_TYPE_ACTION,
				"elements": [
					{
						"type": SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
						"text": {
							"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
							"text": SLACK_MARK_AS_SEEN_MSG,
							"emoji": true
						},
						"value": SEEN_STRING,
						"action_id": "actionId-" + data[entryIndex].id + '-1'
					},
					{
						"type": SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
						"text": {
							"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
							"text": SLACK_MARK_AS_MASTERED_MSG,
							"emoji": true
						},
						"value": MASTERED_STRING,
						"action_id": "actionId-" + data[entryIndex].id + '-2'
					}
				]
			});
		} else {
			let actionStr = slackVars.masteredIds.includes(data[entryIndex].id) ? MASTERED_STRING : SEEN_STRING;
			blockStr.push({
				"type" : SLACK_BLOCK_TYPE_SECTION,
				"fields" : [{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
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