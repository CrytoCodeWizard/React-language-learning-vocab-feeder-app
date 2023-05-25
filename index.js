require('dotenv').config();
const PORT = process.env.NODE_PORT || 3001;

const express = require("express");
const app = express();

const { initDailyDutchScheduler } = require('./jobs/vocab.job');
const { slackApp } = require('./src/configs/slack.config');
const vocabRouter = require('./src/routes/vocab.route');

(async () => {
	await slackApp.start();

	initDailyDutchScheduler();
})();

app.use('/vocab', vocabRouter);

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});