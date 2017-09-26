const express = require('express'); // Express web server framework
const bodyParser = require("body-parser");
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
require('dotenv').config();
const app = express();
let myOauth2Client = null;
let count = 2;
const PORT = process.env.PORT || 8888;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('index.html');
});

app.get('/login', (req, res) => {
    res.send('fdsa');
});

app.get('/getstarted', (req, res) => {
    res.redirect('getstarted.html');
});

app.post('/namepost', (req, res) => {
    var values = [
	  [req.body.firstname,
	    req.body.email,
	    req.body.numcourses,
	    req.body.year,
	    req.body.spring,
	    req.body.summer,
	    req.body.fall]
	];
	var body = {
	  values: values
	};
	updateSheet(myOauth2Client, body);
    // var body = '';
    // filePath = "/Users/brownloaner/Documents/bearsatwork/myoutput.txt";
    // request.on('myoutput', function(myoutput) {
    //     body += myoutput;
    // });
    // request.on('end', function (){
    //     fs.appendFile(filePath, body, function() {
    //         respond.end();
    //     });
    // });
    // send to google sheets
    //redirect back to home page
    res.redirect('/success.html');
});

// app.post('/myaction', function(req, res) {
//   res.send('You sent the name "' + req.body.name + '".');
// });

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from process.env
var content = {
  "installed": {
    "client_id" : process.env.CLIENT_ID,
    "project_id" : process.env.PROJECT_ID,
    "auth_uri" : process.env.AUTH_URI,
    "token_uri" : process.env.TOKEN_URI,
    "auth_provider_x509_cert_url" : process.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_secret" : process.env.CLIENT_SECRET,
    "redirect_uris" : [process.env.REDIRECT_URI_1,process.env.REDIRECT_URI_2]
  }
}
// Authorize a client with the loaded credentials, then call the
// Google Sheets API.
authorize(content, setOauth2Client);

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  if (process.env.ACCESS_TOKEN) {
    oauth2Client.credentials = {
	  "access_token":process.env.ACCESS_TOKEN,
	  "refresh_token":process.env.REFRESH_TOKEN,
	  "token_type":"Bearer",
	  "expiry_date":process.env.EXPIRY_DATE
	}
    callback(oauth2Client);
  } else {
  	getNewToken(oauth2Client, callback);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      callback(oauth2Client);
    });
  });
}

function setOauth2Client(client) {
	myOauth2Client = client;
}



/*
 * Updates the spreadsheet with the given information
 */
function updateSheet(auth, body) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: '1MT5iZe25U08POpEJqpmOLCZHi1K7qbgPnytSyAqi3Mw',
    valueInputOption: 'RAW',
    range: 'A' + count + ':G' + count,
    resource: body,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    // var rows = response.values;
    // if (rows.length == 0) {
    //   console.log('No data found.');
    // } else {
    //   console.log('Name, Major:');
    //   for (var i = 0; i < rows.length; i++) {
    //     var row = rows[i];
    //     // Print columns A and E, which correspond to indices 0 and 4.
    //     console.log('%s, %s', row[0], row[4]);
    //   }
    // }
  });
  count++;
}


console.log('Listening on ' + PORT);
app.listen(PORT);
  