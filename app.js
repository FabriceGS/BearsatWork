const express = require('express'); // Express web server framework
const bodyParser = require("body-parser");
var GoogleSheets = require('google-drive-sheets');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
require('dotenv').config();
const app = express();
let myOauth2Client = null;
let count = 2;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

// spreadsheet key is the long id in the sheets URL 
var mySheet = new GoogleSheets(process.env.GOOGLE_SHEETS_ID);

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
    console.log(req.body.firstname);
    console.log(req.body.email);
    console.log(req.body.numcourses);
    console.log(req.body.year);
    console.log(req.body.spring);
    console.log(req.body.summer);
    console.log(req.body.fall);
    
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
    res.redirect('/index.html');
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

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), setOauth2Client);
});

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
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
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
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function setOauth2Client(client) {
	myOauth2Client = client;
}



/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
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


console.log('Listening on 8888');
app.listen(8888);
  