const express = require("express")
const app = express();

const { Client } = require('pg');
const client = new Client();
console.log(client);
client.connect();
// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
//   console.log(err ? err.stack : res.rows[0].message) // Hello World!
//   client.end()
// })

// make index.html accessible to clients
app.use(express.static('public'))

app.get('/', function(request, response){
    response.send('hello world');
});

app.listen(8000);