const { App } = require('@slack/bolt')
const storage = require('node-persist')
const { WebClient } = require('@slack/web-api')

const web = new WebClient(process.env.SLACK_BOT_TOKEN)
const slackApp = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
})

module.exports = {
  slackApp,
  storage,
  web
}
