const express = require('express');
const app = express();
const cors=require('cors');
const connection=require('./databaseConnection/connection');
var bodyParser = require('body-parser');

const authentication=require('./Routes/Authentication');
const appRoutes=require('./Routes/appRoutes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/',authentication);
app.use('/',appRoutes);

app.listen(5000,()=>{
    console.log("Server is running on port 5000");
})

module.exports=app;