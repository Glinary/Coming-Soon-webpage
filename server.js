/*
Dependencies:
"npm init -y"
"npm i express"
"npm i dotenv"
"npm install googleapis@95.0.0"
*/

// Get the content from the .env file
require("dotenv").config();

// Connect dependencies
const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

// Get secret files
const sheetId = process.env.SHEET_ID;
const tabName = 'Sheet1';
const range = 'A:B';

const app = express();
const path = require('path')

// Connect to the Google Sheet Client
async function getGoogleSheetClient() {
  try {
    const keyFilePath = path.join(__dirname, 'credentials.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    return google.sheets({
      version: "v4",
      auth: authClient,
    });
  } catch (error) {
    console.error("Error while getting google sheet client:", error);
  }
  
}

// Append new data to Google Sheet
async function writeGoogleSheet(
  googleSheetClient,
  sheetId,
  tabName,
  range,
  data
) {

  try {
    console.log("Appending data to range:", range); // Log the range
    console.log(data);
    await googleSheetClient.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        majorDimension: "ROWS",
        values: data,
      },
    });
  } catch (error) {
    console.error("Error while appending new data to google sheet:", error);
  }
  
}

// Call the function to store Email in Google Sheet using Google API
async function storeEmail(name, email) {
  try {
    let client = await getGoogleSheetClient();
    let data = [[name, email]];
    await writeGoogleSheet(client, sheetId, tabName, range, data);
  } catch (error) {
    console.error("Error while storing email in google sheet:", error);
  }
  
}

// Use the bodyParser
app.use(bodyParser.json());

app.use(express.static('public'));

// stores the email of the user in the google sheets
app.post("/api/storeEmail", (req, res) => {
  //console.log("I am at the store Email post request");
  let { name, email } = req.body;
  //console.log("Real sessionId: " + req.sessionID);
  //console.log("email: " + email);
  res.json({ message: "storeEmail()" });
  storeEmail(name, email).catch(console.dir);
});


app.listen(3000, () => console.log("Server started at port 3000"));
