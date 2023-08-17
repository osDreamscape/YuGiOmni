// A REST API service that accepts parameters from a webpage and returns JSON data
// for Yu-Gi-Oh cards from a Google Cloud hosted database.
// author: Matt Bauchspies - mbauchspies@protonmail.com / mbauch72@uw.edu

// import required module
const  express = require('express');
const mysql = require('mysql');
const app = express();

// Required for bypassing Access-Control-Allow-Origin
// If you have errors related to this, change the origin to your IP address
// This should only be the case if you are hosting the front-end on a server on the same system
// as the backend. 
// If that is your use case, try opening index.html in your browser instead.
const cors = require('cors');
app.use(cors({
    origin: 'null'
}));


// Establishes address and credentials of the database used in the API.
const con = mysql.createConnection({
    host: '34.145.63.173',
    port: 3306,
    user: 'testlogin',
    database: 'yugiomni'
});

// Establishes connection to the cloud database.
con.connect(function(err) {
    if (err) 
        return console.err(err);
    console.log('Established connection to YuGiOmni Cloud Database.')
});



// Send a response if the main page is pinged to acknowledge that the API is online.
app.get('/', function (req, res) {
    res.status(200);
    res.send("This REST service is currently active.");
});

// Executes a single arbitrary SQL SELECT query on the YuGiOmni database.
app.get('/select/:attribute/:from/:where', function(req, res) {
    let attribute = req.params.attribute;
    let from = req.params.from;
    let where = req.params.where;
    let query = "SELECT " + attribute + " FROM " + from;
    if(where !== "none") query += " WHERE " + where;

    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        // console.log(result)
      });
});

// Executes a single SQL SELECT query for a specific monster type.
app.get('/monster_select/:type/', function(req, res) {
    let type = req.params.type;
    console.log("Type requested:" + type);
    let query = "SELECT card_name, card_type FROM monster_cards NATURAL JOIN card_names";
    if(type !== "Wildcard") query += " WHERE card_type = \"" + type + "\"";
    query += " ORDER BY card_type, card_name ASC"
    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        // console.log(result)
      });
});


// Executes a single SQL SELECT query on the YuGiOmni database, after joining the Card IDs and a specified relation.
app.get('/special_select/:attribute/:from/:name', function(req, res) {
    let attribute = req.params.attribute;
    let from = req.params.from;
    let name = req.params.name;
    console.log(name);
    console.log("SELECT " + attribute + " FROM card_names NATURAL JOIN " + from + " WHERE card_names.card_name LIKE \"%" + name + "%\"");
    let query = "SELECT " + attribute + " FROM card_names NATURAL JOIN " + from;
    if(name !== "") query += " WHERE card_names.card_name LIKE \"%" + name + "%\"";
    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        //console.log(result)
      });
});

// Executes a single SQL SELECT query on the YuGiOmni database, after joining the Card IDs and a specified relation.
app.get('/example_query/atk_def', function(req, res) {
    let query = "SELECT card_name, attack, defense FROM card_names NATURAL JOIN monster_cards WHERE attack = defense";
    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        //console.log(result)
      });
});



// enable a port to listen to incoming HTTP requests
app.listen(3000, function() {
    console.log("YuGiOmni API listening on port 3000...");
});
