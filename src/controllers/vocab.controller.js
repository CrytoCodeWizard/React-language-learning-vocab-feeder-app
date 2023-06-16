const vocabService = require("../services/vocab.service");

const { sendDailyDutchVocabToSlack } = require("../services/slack.service");
const pool = require("../configs/pool.config");
const {
  QUERY_EXECUTION_ERROR_MSG,
  QUERY_CONNECTION_ERROR_MSG,
} = require("../../constants");

const { buildLoggingStr } = require("../utils/helper.util");
const logger = require("../../log"); // this retrieves default logger which was configured in log.js

const getSlackInfo = async (req, res, next) => {
  try {
    res.json(await vocabService.getSlackInfo());
  } catch (err) {
    console.error("Error: ", err.message);
    logger.error(buildLoggingStr("Error: ", err.message));
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

const getLessonPeopleNames = async (req, res, next) => {
  await pool.connect(async (err, client, release) => {
    if (err) {
      logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
      return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
    }
    client.query(
      "SELECT person, TO_CHAR(lesson_date, 'YYYY-MM-DD') as lesson_date, notes, lesson_title FROM lesson",
      async (err, result) => {
        release();
        if (err) {
          logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
          return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
        }
        const lessons = {};
        for (const row in result.rows) {
          const capitalizedName =
            result.rows[row].person.charAt(0).toUpperCase() +
            result.rows[row].person.slice(1);

          if (Object.keys(lessons).includes(capitalizedName)) {
            lessons[capitalizedName].push(result.rows[row]);
          } else {
            lessons[capitalizedName] = [result.rows[row]];
          }
        }

        res.send(lessons);
      }
    );
  });
};

const updateVocab = async (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const newVocab = JSON.parse(decodeURIComponent(body));

    const query = vocabService.buildUpdateVocabRecordByIdQuery(
      newVocab.id,
      Object.keys(newVocab)
    );
    const colValues = Object.keys(newVocab).map((key) => newVocab[key]);

    pool.connect(async (err, client, release) => {
      if (err) {
        logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
        return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
      }
      client.query(query, colValues, (err, result) => {
        release();
        if (err) {
          logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
          return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
        }
        res.send(newVocab);
      });
    });
  });
};

const postVocab = async (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const newVocab = JSON.parse(decodeURIComponent(body));
    newVocab.set_name = newVocab.category;
    delete newVocab.category;

    pool.connect(async (err, client, release) => {
      if (err) {
        logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
        return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
      }
      client.query(
        vocabService.buildInsertVocabRecordQuery(newVocab),
        (err, result) => {
          release();
          if (err) {
            logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
            return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
          }
          res.send(newVocab);
        }
      );
    });
  });
};

const postSlackMessage = async (req, res, next) => {
  // resetVocabRecordsToUnseen(); // TODO: REMOVE AFTER ACTIVE DEV IS DONE
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    res.end("ok");
    sendDailyDutchVocabToSlack(JSON.parse(body).recordCount);
  });
};

const getVocabForCategory = async (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    let queryStr =
      "SELECT id, english, dutch, pronunciationLink FROM vocabulary";
    const params = [];
    if (JSON.parse(body).category !== "Review All") {
      queryStr += " WHERE set_name = $1";
      params.push(JSON.parse(body).category);
    }

    await pool.connect(async (err, client, release) => {
      if (err) {
        logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
        return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
      }
      client.query(queryStr, params, async (err, result) => {
        release();
        if (err) {
          logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
          return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
        }
        res.send(result.rows);
      });
    });
  });
};

const getVocab = async (req, res, next) => {
  req.on("data", () => {});
  req.on("end", async () => {
    const queryStr =
      "SELECT id, english, dutch, pronunciationLink, notes, set_name FROM vocabulary ORDER BY dutch";

    await pool.connect(async (err, client, release) => {
      if (err) {
        logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
        return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
      }
      client.query(queryStr, async (err, result) => {
        release();
        if (err) {
          logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
          return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
        }
        res.send(result.rows);
      });
    });
  });
};

const deleteVocab = (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const vocabToDelete = JSON.parse(decodeURIComponent(body));
    if (vocabToDelete.id) {
      const query = vocabService.buildDeleteVocabRecordByIdQuery(
        vocabToDelete.id
      );

      pool.connect(async (err, client, release) => {
        if (err) {
          logger.error(buildLoggingStr(QUERY_CONNECTION_ERROR_MSG, err.stack));
          return console.error(QUERY_CONNECTION_ERROR_MSG, err.stack);
        }
        client.query(query, async (err, result) => {
          release();
          if (err) {
            logger.error(buildLoggingStr(QUERY_EXECUTION_ERROR_MSG, err.stack));
            return console.error(QUERY_EXECUTION_ERROR_MSG, err.stack);
          }
          res.send(result.rows);
        });
      });
    }
  });
};

module.exports = {
  getSlackInfo,
  getReviewCategories,
  getLessonPeopleNames,
  getVocabForCategory,
  getVocab,
  postVocab,
  updateVocab,
  postSlackMessage,
  deleteVocab,
};
