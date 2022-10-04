const express = require("express");
const schedule = require('node-schedule');
const app = express();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: 'localhost',
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: 'vocabdb',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

app.use(express.static('public'))

app.get('/', function(request, response){
    response.send('hello world');
});

app.listen(8000);

schedule.scheduleJob('*/10 * * * * *', function(){
    console.log('Every half minute');

    getVocabEntries();
});

function getVocabEntries() {
    pool.connect((err, client, release) => {
        if(err) {
            return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT dutch, english, notes, pronunciationLink, seen, mastered FROM vocabulary', (err, result) => {
            release();
            if(err) {
                return console.error('Error executing query', err.stack);
            }
            console.log(result.rows);
        });
    });
}