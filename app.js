// a REST service that accepts parameters from a webpage and returns JSON data
// for Yu-Gi-Oh cards from a Google Cloud hosted database
// author: Matt Bauchspies - mbauchspies@protonmail.com / mbauch72@uw.edu

// import required module
const  express = require('express');
const mysql = require('mysql');
const app = express();

// required for bypassing Access-Control-Allow-Origin
// may require "npm i cors express" to be ran if the error persists
// if you have a different origin, feel free to edit this value to your origin
const cors = require('cors');
app.use(cors({
    origin: 'null'
}));


// Establishes address and credentials of the database used in the API
const con = mysql.createConnection({
    host: '34.145.63.173',
    port: 3306,
    user: 'testlogin',
    database: 'yugiomni'
});

// Establishes connection to the cloud database
con.connect(function(err) {
    if (err) 
        return console.err(err);
    console.log('connected')
});



// define a route using a callback function that will be invoked
// when the user makes a HTTP request to the root of the folder (URL)
app.get('/', function (req, res) {
    res.status(200);
    res.send("This REST service is currently active.");
});

// performs a single SQL SELECT query on the YuGiOmni database
app.get('/select/:attribute/:from/:where', function(req, res) {
    let attribute = req.params.attribute;
    let from = req.params.from;
    let where = req.params.where;
    let query = "SELECT " + attribute + " FROM " + from;
    if(where !== "none") query += " WHERE " + where;

    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        console.log(result)
      });
});

// performs a single SQL SELECT query on the YuGiOmni database
app.get('/monster_select/:type/', function(req, res) {
    let type = req.params.type;
    console.log("Type requested:" + type);
    let query = "SELECT card_name, card_type FROM monster_cards NATURAL JOIN card_names";
    if(type !== "Wildcard") query += " WHERE card_type = \"" + type + "\"";
    query += " ORDER BY card_type, card_name ASC"
    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        console.log(result)
      });
});


// performs a single SQL SELECT query on the YuGiOmni database, after joining the Card IDs and a specified relation
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

// performs a single SQL SELECT query on the YuGiOmni database, after joining the Card IDs and a specified relation
app.get('/example_query/atk_def', function(req, res) {
    let query = "SELECT card_name, attack, defense FROM card_names NATURAL JOIN monster_cards WHERE attack = defense";
    con.query(query, function (err, result, fields) {
        if (err) res.status(400);
        res.json(result);
        //console.log(result)
      });
});


// calculates a melee accuracy value
app.get('/meleeaccuracy/:level/:boost/:bonus/:prayer/:set/:style', function(req, res) {
    const level = parseInt(req.params.level);
    let boost = req.params.boost;
    const bonus = parseInt(req.params.bonus);
    const prayer = parseInt(req.params.prayer);
    const set = req.params.set;
    const style = parseInt(req.params.style);

    const setbonuses = ["none", "void", "voidsalve", "voidsalvee", "slayer", "salve", "salvee"];
    const boosts = ["none", "attackpotion", "superattackpotion", "overload"];

    if (isNaN(level) || !(boosts.includes(boost)) || isNaN(bonus) || isNaN(prayer) || !(setbonuses.includes(set)) || isNaN(style))
    {
        res.status(400);
        console.log("???")
        res.json({error: "Bad request, a value provided was invalid."});
        return;
    }

    // determines the boost amount from the potion used
    switch(boost) {
        case 'none' :
            boost = 0;
            break;
        case 'attackpotion' :
            boost = Math.floor(level * 0.1) + 3;
            break;
        case 'superattackpotion' :
            boost = Math.floor(level * 0.15) + 5;
            break;
        case 'overload' :
            boost = Math.floor(level * 0.16) + 6;
            break;
    }

    let effectiveAtk = Math.floor((level + boost) * (prayer/100 + 1) + 8 + style);

    if(set.includes("void")) {
        effectiveAtk = Math.floor(effectiveAtk * 1.1);
    }

    let accuracy = Math.floor(effectiveAtk * (bonus + 64));

    if (set.includes("salvee")) {
        accuracy = Math.floor(accuracy * 1.2);
    } else if (set.includes("salve") || set.includes("slayer")) {
        accuracy = Math.floor(accuracy * (7/6))
    } 

        // Returns a JSON response with the values the user provided as well as the calculated accuracy.
        res.json({ "attack_level" : level, "visible_boost" : boost, "attack_bonus" : bonus, "prayer" : prayer + "%", "set_bonus" : set, "style" : "+" + style, "effective_level" : effectiveAtk, "accuracy_roll" : accuracy});
})

// calculates a melee defence value
app.get('/meleedefence/:level/:boost/:bonus/:prayer/:style/:monster', function(req, res) {
    const level = parseInt(req.params.level);
    let boost = req.params.boost;
    const bonus = parseInt(req.params.bonus);
    const prayer = parseInt(req.params.prayer);
    const style = parseInt(req.params.style);
    const monster = parseInt(req.params.monster);

    const boosts = ["none", "defencepotion", "superdefencepotion", "saradominbrew", "overload"];

    if (isNaN(level) || !(boosts.includes(boost)) || isNaN(bonus) || isNaN(prayer) || isNaN(style) || isNaN(monster))
    {
        res.status(400);
        console.log("???")
        res.json({error: "Bad request, a value provided was invalid."});
        return;
    }

        // determines the boost amount from the potion used
        switch(boost) {
            case 'none' :
                boost = 0;
                break;
            case 'defencepotion' :
                boost = Math.floor(level * 0.1) + 3;
                break;
            case 'superdefencepotion' :
                boost = Math.floor(level * 0.15) + 5;
                break;
            case 'saradomin brew' :
                boost = Math.floor(level*0.2) + 2;
                break;

            case 'overload' :
                boost = Math.floor(level * 0.16) + 6;
                break;
        }

    let effectiveDef;

    if(monster === 0) {
        effectiveDef = Math.floor((level + boost) * (prayer/100 + 1)) + style + 8;
    } else {
        effectiveDef = level + 9;
    }

    let defence = Math.floor(effectiveDef * (bonus + 64))

        // Returns a JSON response with the values the user provided as well as the calculated accuracy.
        res.json({ "defence_level" : level, "visible_boost" : boost, "defence_bonus" : bonus, "prayer" : prayer + "%", "style" : "+" + style, "effective_level" : effectiveDef, "defence_roll" : defence});
})

// calculates a melee hit chance given an attack roll and a defence roll
app.get('/meleehitchance/:accuracy/:defence', function(req, res) {
    const accuracy = parseInt(req.params.accuracy);
    const defence = parseInt(req.params.defence);
    if (isNaN(accuracy) || isNaN(defence))
    {
        res.status(400);
        res.json({error: "Bad request, a value provided was invalid."});
        return;
    }

    let hitchance;

    if(accuracy > defence) {
        hitchance = 1 - ((defence + 2) / (2 * (accuracy + 1)));
    } else {
        hitchance = ((accuracy)/(2*(defence + 1)));
    }
    res.json({ "accuracy" : accuracy, "defence" : defence, "hitchance" : hitchance})
})

app.get('/meleedps/:hitchance/:maxhit/:attackspeed', function(req, res) {
    const hitChance = parseFloat(req.params.hitchance);
    const maxHit = parseInt(req.params.maxhit);
    let attackSpeed = parseInt(req.params.attackspeed);

    if (isNaN(hitChance) || isNaN(maxHit) || isNaN(attackSpeed))
    {
        res.status(400);
        res.json({error: "Bad request, a value provided was invalid."});
        return;
    }

    // converts attack speed in game ticks to attack speed in seconds
    attackSpeed = attackSpeed * 0.6;

    let DPS = hitChance * (maxHit/2) / attackSpeed;

    res.json({"DPS" : DPS});

})



// enable a port to listen to incoming HTTP requests
app.listen(3000, function() {
    console.log("Listening on port 3000...");
});
