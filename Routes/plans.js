const express = require('express');
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
module.exports=router;