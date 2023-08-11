const express=require('express');
const rootRouter=express.Router();

const plans=require('./plans');
const authorize=require('./authorize');
const payment=require('./payment');

rootRouter.use(authorize);
rootRouter.use('/',plans);
rootRouter.use('/',payment);

module.exports=rootRouter;