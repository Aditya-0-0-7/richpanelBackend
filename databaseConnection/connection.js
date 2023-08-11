const mysql2 = require('mysql2');
require('dotenv').config();
const e=process.env;

    con = mysql2.createConnection({
        host: e.HOST,
        user: e.USER,
        password: e.PASSWORD,
        database: e.DATABASE,
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

module.exports=con;