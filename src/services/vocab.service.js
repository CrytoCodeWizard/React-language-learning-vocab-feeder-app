const pool = require('../configs/pool.config');
const { 
	SEND_DAILY_SLACK_BTN_LABEL,
	QUERY_CONNECTION_ERROR_MSG,
	QUERY_EXECUTION_ERROR_MSG
} = require('./../../constants');

const { buildLoggingStr } = require('./../utils/helper.util');
let logger = require('./../../log'); // this retrieves default logger which was configured in log.js

const getConnection = (callback) => {
    pool.getConnection((err, connection, release) => {
        callback(err, connection, release);
    });
};

const getSlackInfo = async (req, res, next) => {
    try {
        return { sendDailySlackBtnLabel: SEND_DAILY_SLACK_BTN_LABEL }
    } catch (err) {
		logger.error(buildLoggingStr("Error: ", err.message));
        console.error("Error: ", err.message);
        next(err);
    }
}

const getReviewCategories = async (req, res, next) => {
	await pool.connect(async (err, client, release) => {
		if(err) {
			logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
			return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack)
		}
		client.query("SELECT name FROM category WHERE name != '' ORDER BY category_order ASC", async (err, result) => {
			release();
			if(err) {
				logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
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

module.exports = {
    getSlackInfo,
    getConnection,
    getReviewCategories
}