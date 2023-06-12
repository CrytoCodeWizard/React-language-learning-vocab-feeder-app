require('dotenv').config();
const PORT = process.env.NODE_PORT || 3001;

const express = require("express");
const app = express();

const { initDailyDutchScheduler } = require('./jobs/vocab.job');
let { slackApp, storage } = require('./src/configs/slack.config');
const vocabRouter = require('./src/routes/vocab.route');

const { buildLoggingStr } = require('./src/utils/helper.util');
let logger = require('./log'); // this retrieves default logger which was configured in log.js

(async () => {
	await storage.init({dir: '/home/pi/vocab-feeder/localStorage'});
	await slackApp.start();

	initDailyDutchScheduler();
})();

slackApp.error((error) => {
	logger.info(buildLoggingStr(error));
});

app.use('/api', vocabRouter);

app.listen(PORT, () => {
	logger.info(buildLoggingStr('Server listening on ' + PORT));
	console.log(`Server listening on ${PORT}`);
});