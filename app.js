const express = require('express'); // Express web server framework
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('index.html');
})

app.get('/login', (req, res) => {
    res.send('fdsa');
});

app.get('/getstarted', (req, res) => {
    res.redirect('getstarted.html');
});

app.post('/namepost', (req, res) => {
    console.log(req.body.firstname);
    res.send('Success!');
})

console.log('Listening on 8888');
app.listen(8888);
  