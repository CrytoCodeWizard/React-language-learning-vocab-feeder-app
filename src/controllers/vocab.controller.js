const vocabService = require('../services/vocab.service');
const { sendDailyDutchVocabToSlack } = require('../services/slack.service');
const { 
	QUERY_EXECUTION_ERROR_MSG, 
	QUERY_CONNECTION_ERROR_MSG 
} = require('../../constants');

const getSlackInfo = async (req, res, next) => {
    try {
        res.json(await vocabService.getSlackInfo());
    } catch (err) {
        console.error("Error: ", err.message);
        next(err);
    }
}

const getReviewCategories = async (req, res, next) => {
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
};

const getLessonPeopleNames = async (req, res, next) => {
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
};

const postVocab = async (req, res, next) => {
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
};

const postSlackMessage = async (req, res, next) => {
	// resetVocabRecordsToUnseen(); // TODO: REMOVE AFTER ACTIVE DEV IS DONE
	let body = "";
	req.on('data', chunk => {
		body += chunk.toString();
	});
	req.on('end', () => {
		res.end('ok');
		sendDailyDutchVocabToSlack(JSON.parse(body).recordCount);
	});
};

const getVocabForCategory = async (req, res, next) => {
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
};

module.exports = {
    getSlackInfo,
    getReviewCategories,
    getLessonPeopleNames,
    getVocabForCategory,
    postVocab,
    postSlackMessage
};