const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const database=require('../databaseConnection/connection');

router.post('/fetchPlans',(req,res)=>{
    database.query(`SELECT * FROM plans`, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        return res.status(200).json({data:rows});
    });
});

router.post('/checkPlan',(req,res)=>{
    const {token} = req.body;
    const decodedToken = jwt.decode(token);
    const {Email}=decodedToken;
    database.query(`SELECT * FROM user WHERE Email = '${Email}'`, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if(rows[0].Subscription.length===0)
            return res.status(200).json({status:false});
        return res.status(200).json({status:true});
    });
});

module.exports=router;