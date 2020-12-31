'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const db = require('./db');
const { getQuestion } = require('./db');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('awake');
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (
    event.type !== 'message' ||
    event.message.type !== 'text' ||
    event.message.text !== '今日問題'
  ) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  // 包裝回傳文字
  const data = await db.getQuestion();
  const textFormat = `${data.message}\n-- ${data.provider} 提供`;

  // create a echoing text message
  const responseQuestion = { type: 'text', text: textFormat };

  // use reply API
  return client.replyMessage(event.replyToken, responseQuestion);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
