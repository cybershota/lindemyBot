const Airtable = require('airtable');

require('dotenv').config();

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base(process.env.AIRTABLE_BASE);

let poolArray = [];

function randomQuestion(array) {
  return new Promise((resolve, reject) => {
    const seed = Math.abs(Math.ceil(Math.random() * array.length - 1));
    base('題庫').find(array[seed], function (err, record) {
      let response = {};
      if (err) {
        response = {
          status: 'error',
          message: err,
        };
        console.error(err);
        reject(err);
      }
      response = {
        status: 'ok',
        message: record.get('問題'),
        provider: record.get('提供者'),
      };
      resolve(response);
    });
  });
}

function getQuestion() {
  return new Promise((resolve, reject) => {
    base('題庫')
      .select({
        maxRecords: 100,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            poolArray.push(record.id);
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            let response = {
              status: 'error',
              message: err,
            };
            console.error(err);
            reject(response);
          }
          randomQuestion(poolArray).then((res) => {
            resolve(res);
          });
        },
      );
  });
}

module.exports = { getQuestion };
