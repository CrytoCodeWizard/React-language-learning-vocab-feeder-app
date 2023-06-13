const pool = require("../configs/pool.config");
const {
  SEND_DAILY_SLACK_BTN_LABEL,
  QUERY_CONNECTION_ERROR_MSG,
  QUERY_EXECUTION_ERROR_MSG,
} = require("../../constants");

const { buildLoggingStr } = require("../utils/helper.util");
const logger = require("../../log"); // this retrieves default logger which was configured in log.js

const getConnection = (callback) => {
  pool.getConnection((err, connection, release) => {
    callback(err, connection, release);
  });
};

const getSlackInfo = async (req, res, next) => {
  try {
    return { sendDailySlackBtnLabel: SEND_DAILY_SLACK_BTN_LABEL };
  } catch (err) {
    logger.error(buildLoggingStr("Error: ", err.message));
    console.error("Error: ", err.message);
    next(err);
  }
};

const getReviewCategories = async (req, res, next) => {
  await pool.connect(async (err, client, release) => {
    if (err) {
      logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
      return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
    }
    client.query(
      "SELECT name FROM category WHERE name != '' ORDER BY category_order ASC",
      async (err, result) => {
        release();
        if (err) {
          logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
          return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
        }
        const setNames = [];
        for (const row in result.rows) {
          setNames.push(result.rows[row].name);
        }

        res.send(setNames);
      }
    );
  });
};

const updateVocabRecordById = (id, cols) => {
  const query = ["UPDATE vocabulary"];
  query.push("SET");

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  const set = [];
  Object.keys(cols).forEach((key, i) => {
    set.push(`${cols[key]} = ($${i + 1})`);
  });
  query.push(set.join(", "));

  // Add the WHERE statement to look up by id
  query.push(`WHERE id = ${id}`);

  // Return a complete query string
  return query.join(" ");
};

module.exports = {
  getSlackInfo,
  getConnection,
  getReviewCategories,
  updateVocabRecordById,
};
