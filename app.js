// A REST service that provides numerous calculators that provide utility for Old School RuneScape
// author: Matt Bauchspies - mbauchspies@protonmail.com

// import required module
const express = require("express");
const mysql = require('mysql');
require('dotenv').config({path: '.env'});

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of MySQL.
const createTcpPool = async config => {
    console.log("yes")
  const dbConfig = {
    host: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
    port: process.env.DB_PORT, // e.g. '3306'
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    // ... Specify additional properties here.
    ...config
  };
  // Establish a connection to the database.
  print("hello")
  return mysql.createPool(dbConfig);
};
const app = express();

// required for bypassing Access-Control-Allow-Origin
// may require "npm i cors express" to be ran if the error persists
// if you have a different origin, feel free to edit this value to your origin
const cors = require('cors');
app.use(cors({
    origin: 'null'
}));

// define a route using a callback function that will be invoked
// when the user makes a HTTP request to the root of the folder (URL)
app.get('/', function (req, res) {
    res.status(200);
    res.send("");
});

// calculates a melee max hit
app.get('/meleemaxhit/:level/:boost/:bonus/:prayer/:set/:style', function(req, res) {
    const level = parseInt(req.params.level);
    let boost = req.params.boost;
    const bonus = parseInt(req.params.bonus);
    const prayer = parseInt(req.params.prayer);
    const set = req.params.set;
    const style = parseInt(req.params.style);

    const setbonuses = ["none", "void", "voidsalve", "voidsalvee", "slayer", "salve", "salvee"];
    const boosts = ["none", "strengthpotion", "superstrengthpotion", "overload"];

    if (isNaN(level) || !(boosts.includes(boost)) || isNaN(bonus) || isNaN(prayer) || !(setbonuses.includes(set)) || isNaN(style))
    {
        res.status(400);
        res.json({error: "Bad request, a value provided was invalid."});
        return;
    }

    // determines the boost amount from the potion used
    switch(boost) {
        case 'none' :
            boost = 0;
            break;
        case 'strengthpotion' :
            boost = Math.floor(level * 0.1) + 3;
            break;
        case 'superstrengthpotion' :
            boost = Math.floor(level * 0.15) + 5;
            break;
        case 'overload' :
            boost = Math.floor(level * 0.16) + 6;
            break;
    }

    // Calculates the effective Strength level based on values provided.
    // Combines the level and boosts, then applies prayer and style bonuses (if any)
    let effectiveStr = Math.floor((level + boost) * (prayer/100 + 1)) + style + 8;

    if(set.includes("void")) {
        effectiveStr = Math.floor(effectiveStr * 1.1);
    }

    // Takes the calculated effective strength value and calculates a max hit based on the gear bonus.
    let maxHit = Math.floor((effectiveStr * (bonus + 64) + 320)/640);

    if (set.includes("salvee")) {
        maxHit = Math.floor(maxHit * 1.2);
    } else if (set.includes("salve") || set.includes("slayer")) {
        maxHit = Math.floor(maxHit * (7/6))
    } 

    // Returns a JSON response with the values the user provided as well as the calculated max hit.
    res.json({ "strength_level" : level, "visible_boost" : boost, "strength_bonus" : bonus, "prayer" : prayer + "%", "set_bonus" : set + "%", "style" : "+" + style, "effective_level" : effectiveStr, "max_hit" : maxHit});
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

app.get("/:card_names", async (req, res) => {
    const query = "SELECT * FROM card_names WHERE card_name = ?";
    pool.query(query, [req.params.card_names], (error, results) => {
        if (!results[0]) {
            res.json({ status: "Not found!"});
        } else {
            res.json(results[0])
        }
    });
});

const pool = mysql.createPool({
    user: "root",
    password: "SQL1972",
    database: "yugiomni",
    socketPath: `/cloudsql/yugiomni:us-west1:yugiomni1`
});



// enable a port to listen to incoming HTTP requests
app.listen(3000, function() {
    console.log("Listening on port 3000...");
    console.log(pool)
});