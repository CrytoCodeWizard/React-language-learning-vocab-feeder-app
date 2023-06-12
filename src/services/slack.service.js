const { 
	QUERY_EXECUTION_ERROR_MSG, 
	QUERY_CONNECTION_ERROR_MSG,
	SLACK_DAILY_MSG_HEADER,
	SLACK_UPDATE_MSG_HEADER,
	SLACK_MARK_AS_MASTERED_MSG,
	SLACK_MARK_AS_SEEN_MSG,
	SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
	SLACK_BLOCK_TYPE_SECTION,
	SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
	SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
	SLACK_BLOCK_TYPE_ACTION,
	SEEN_STRING,
	MASTERED_STRING,
	REGISTERED_ACTIONS_STRING,
	DATA_GROUP_KEYSTRING,
	KEYSTRING_BY_ACTION_ID,
	TIMESTAMP_BY_KEYSTRING,
	EMPTY_PRONUNCIATION_LINK,
	NO_URL_FOUND_STRING
} = require('./../../constants');

const { buildKeyString } = require('../utils/helper.util');
const pool = require('./../configs/pool.config');
const slackVars = require('./../../slack-vars');
const { WebClient } = require('@slack/web-api');
const { slackApp, storage } = require('./../configs/slack.config');

const { buildLoggingStr } = require('./../utils/helper.util');
let logger = require('./../../log'); // this retrieves default logger which was configured in log.js
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const sendDailyDutchVocabToSlack = async (recordCount) => {
	await getVocabularyRecords(recordCount);
}

const getVocabularyRecords = async (recordCount) => {
	pool.connect((err, client, release) => {
		client.query('SELECT id, dutch, english, pronunciationLink FROM vocabulary WHERE seen != TRUE AND mastered != TRUE ORDER BY random() LIMIT $1', [recordCount], (err, result) => {
			release();
			if(err) {
				logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			} else {
				postSlackMessage(result.rows, buildKeyString(result.rows));
			}
		});
	});
}

const postSlackMessage = (data, keyString) => {
	(async () => {
		initLocalStorageDataGroups(data, keyString);
		const blockStr = buildDutchBlockStr(data);

		const result = await web.chat.postMessage({
			blocks: JSON.stringify(blockStr),
			channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
			text: SLACK_DAILY_MSG_HEADER
		});

		for(let i in blockStr) {
			if(blockStr[i].type === 'actions') {
				for(let element in blockStr[i].elements) {
					await setLocalStorageRegisteredActions(blockStr[i].elements[element].action_id, keyString, result.ts)
				}
			}
		}

		let actions = await storage.getItem(REGISTERED_ACTIONS_STRING);
		let actionVals = Object.values(actions);
		for(let action in actionVals) {
			slackApp.action(actionVals[action], async ({ body, ack, client }) => {
				try {
					await ack();
				} catch(error) {
					logger.error(buildLoggingStr(error));
				}

				let dataGroups = await storage.getItem(DATA_GROUP_KEYSTRING);
				let keyStringByActionId = await storage.getItem(KEYSTRING_BY_ACTION_ID);
				let currentKeyString = keyStringByActionId[body.actions[0].action_id];
				let timestampByKeystring = await storage.getItem(TIMESTAMP_BY_KEYSTRING);

				(async () => {
					try {
						await client.chat.update({
							blocks: buildUpdatedDutchBlockStr(body.actions[0].action_id, body.actions[0].value, keyStringByActionId, dataGroups[currentKeyString]),
							channel: process.env.SLACK_CHANNEL_CONVERSATION_ID,
							text: SLACK_UPDATE_MSG_HEADER,
							ts: timestampByKeystring[currentKeyString]
						});
					} catch (e) {
						logger.error(buildLoggingStr(e));
					}

					removeLocalStorageRegisteredAction(body.actions[0].action_id);
				})();
			});
		};
	})();
}

const initLocalStorageDataGroups = async (data, keyString) => {
	let dataGroups = await storage.getItem(DATA_GROUP_KEYSTRING);
	if(!dataGroups) {
		dataGroups = {};
	}
	dataGroups[keyString] = data;

	await storage.setItem(DATA_GROUP_KEYSTRING, dataGroups);
}

const setLocalStorageRegisteredActions = async (actionId, keyString, timestamp) => {
	await setStorageMap(actionId, actionId, REGISTERED_ACTIONS_STRING);
	await setStorageMap(actionId, keyString, KEYSTRING_BY_ACTION_ID);
	await setStorageMap(keyString, timestamp, TIMESTAMP_BY_KEYSTRING);
};

const setStorageMap = async (k, v, mapKey) => {
	let existingItem = await storage.getItem(mapKey);
	if(!existingItem) {
		existingItem = {};
	}
	existingItem[k] = v;

	await storage.setItem(mapKey, existingItem);
};

const removeLocalStorageRegisteredAction = async (actionId) => {
	let updatedActions = await storage.getItem(REGISTERED_ACTIONS_STRING);
	delete updatedActions[actionId];

	await storage.setItem(REGISTERED_ACTIONS_STRING, updatedActions);
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
	return pronunciationlink === EMPTY_PRONUNCIATION_LINK ? NO_URL_FOUND_STRING : ('<' + pronunciationlink + '|(Pronunciation)>');
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


const buildUpdatedDutchBlockStr = (actionId, actionValue, keyString, keyStringData) => {
	const rowIdOfAction = getRowIdFromSlackAction(actionId);
	updateIdActionList(actionValue, rowIdOfAction);

	const blockStr = initBlockStrWithDailyMessageHeaderTitle();

	for(let entryIndex in keyStringData) {
		if(!slackVars.masteredIds.includes(keyStringData[entryIndex].id) && !slackVars.seenIds.includes(keyStringData[entryIndex].id) && rowIdOfAction !== keyStringData[entryIndex].id) {
			blockStr.push({
				"type" : SLACK_BLOCK_TYPE_SECTION,
				"fields" : [{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
					"text" : "*Dutch:*\n"+keyStringData[entryIndex].dutch+" - "+ buildPronunciationString(keyStringData[entryIndex].pronunciationlink)
				},
				{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
					"text": "*English:*\n"+keyStringData[entryIndex].english
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
						"action_id": "actionId-" + keyStringData[entryIndex].id + '-1'
					},
					{
						"type": SLACK_BLOCK_ELEMENT_TYPE_BUTTON,
						"text": {
							"type": SLACK_BLOCK_ELEMENT_BUTTON_TEXT_TYPE,
							"text": SLACK_MARK_AS_MASTERED_MSG,
							"emoji": true
						},
						"value": MASTERED_STRING,
						"action_id": "actionId-" + keyStringData[entryIndex].id + '-2'
					}
				]
			});
		} else {
			let actionStr = slackVars.masteredIds.includes(keyStringData[entryIndex].id) ? MASTERED_STRING : SEEN_STRING;
			blockStr.push({
				"type" : SLACK_BLOCK_TYPE_SECTION,
				"fields" : [{
					"type": SLACK_BLOCK_FIELD_TYPE_MARKDOWN,
					"text" : "*Dutch:*\n"+keyStringData[entryIndex].dutch+" - marked as " + actionStr
				}]
			});
		}
	}

	return JSON.stringify(blockStr);
}

const updateVocabRecordsAsSeen = async (field, vocabId) => {
	pool.connect((err, client, release) => {
		if(err) {
			logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}

		let queryStr = 'UPDATE vocabulary SET ' + field + ' = TRUE WHERE id = ANY($1)';
		client.query(queryStr, [[vocabId]], (err, result) => {
			release();
			if(err) {
				logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			}
		});
	});
}

const resetVocabRecordsToUnseen = (field) => {
	pool.connect((err, client, release) => {
		if(err) {
			logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}

		let queryStr = 'UPDATE vocabulary SET ' + field + ' = FALSE';
		client.query(queryStr, (err, result) => {
			release();
			if(err) {
				logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
				return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
			}
		});
	});
}

module.exports = {
    sendDailyDutchVocabToSlack
}