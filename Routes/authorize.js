const jwt = require('jsonwebtoken');
require('dotenv').config();
const e=process.env;

const secretKey = e.SECRETKEY;

module.exports=function(req,res,next)
{
    const {token} = req.body;
    try {
        console.log('authorize');
        const decodedToken = jwt.verify(token, secretKey);
        next();

    } catch (error) {
        console.log('unauthorize');
        return res.status(401).json({message:'invalid authentication token. Please Login again'});

    }
}