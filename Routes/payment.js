const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51NdEOwSBS3hIoQBZJ3b4g7z4DlNBOuheFtDaTMFVH5DheqewyxAeDr1S0hiOHYRhYqI26IhrluaewLjxoR54DfHg00jpiCGEvi');
const database=require('../databaseConnection/connection');

const productData=[{Regular:'price_1NdfTzSBS3hIoQBZkbuoZ6zD',Premium:'price_1NdfTfSBS3hIoQBZ1rjmwHst',Standard:'price_1NdfScSBS3hIoQBZKlOdujJo',Basic:'price_1NdfRGSBS3hIoQBZCRnRzcM5'},
{Regular:'price_1NdfX2SBS3hIoQBZyuOWX4tx',Premium:'price_1NdfVcSBS3hIoQBZ6LulZaiH',Standard:'price_1NdfVFSBS3hIoQBZknm841G1',Basic:'price_1NdfUnSBS3hIoQBZbp8I9ImV'}]

router.post('/payment',async(req,res)=>{
    const paymentMethodId = req.body.paymentMethod;
    const {token,index,plan} = req.body;
    const decodedToken = jwt.decode(token);
    const {Email}=decodedToken;

    database.query('SELECT * FROM user WHERE Email = ?', [Email], async function (err, rows) {
        if (err) {
            
          return res.status(500).json({ message: 'Database error' });
        }
        if(rows[0].Subscription.length!==0)
        {
            const subscriptionId=rows[0].Subscription;
            stripe.subscriptions.del(subscriptionId).then(async(sub)=>{
                await sub;
                    const productID = productData[index][plan];

                    const customer = await stripe.customers.create({
                        payment_method: paymentMethodId,
                        email: Email,
                        invoice_settings: {
                        default_payment_method: paymentMethodId,
                        },
                    });

                    const subscription = await stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{ price: productID }],
                    payment_settings: {
                        payment_method_types: ["card"],
                        save_default_payment_method: "on_subscription",
                    },
                    expand: ["latest_invoice.payment_intent"],
                    });

                    const subscriptionId = subscription.id;

                    const updateQuery = `UPDATE user SET Subscription = '${subscriptionId}' WHERE Email = '${Email}'`;
                    database.query(updateQuery, function (err) {
                        if (err) {
                        return res.status(500).json({ message: 'Database error' });
                        }
                        
                        res.status(200).json({
                            message: "Subscription successfully initiated",
                            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                        });
                    });
                });
        }
        else
        {
            const productID = productData[index][plan];
                    
                const customer = await stripe.customers.create({
                    payment_method: paymentMethodId,
                    email: Email,
                    invoice_settings: {
                    default_payment_method: paymentMethodId,
                    },
                });

                const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: productID }],
                payment_settings: {
                payment_method_types: ["card"],
                save_default_payment_method: "on_subscription",
                },
                expand: ["latest_invoice.payment_intent"],
                });

                const subscriptionId = subscription.id;

                const updateQuery = `UPDATE user SET Subscription = '${subscriptionId}' WHERE Email = '${Email}'`;
                database.query(updateQuery, function (err) {
                if (err) {
                return res.status(500).json({ message: 'Database error' });
                }
                        
                res.status(200).json({
                    message: "Subscription successfully initiated",
                    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                });
            });
        }
    })
});

router.post('/cancelSubscription',async (req,res)=>{
    const {token} = req.body;
    const decodedToken = jwt.decode(token);
    const {Email}=decodedToken;
    database.query('SELECT * FROM user WHERE Email = ?', [Email], async function (err, rows) {
        if (err) {
            
          return res.status(500).json({ message: 'Database error' });
        }
        const subscriptionId=rows[0].Subscription;
        stripe.subscriptions.del(subscriptionId).then(async(subscription)=>{
            await subscription;
            database.query(`UPDATE user SET Subscription = NULL WHERE Email = '${Email}'`, async function (err, rows) {
                if (err) {
                    
                  return res.status(500).json({ message: 'Database error' });
                }
                res.status(200).json({message:"subscription cancelled"});
            });
        }).catch(err=>{
            res.status(500).json({ message:'Database Error' });
        });
    }) 
})

router.post('/getSubscription',(req,res)=>{

    const {token} = req.body;
    const decodedToken = jwt.decode(token);
    const {Email}=decodedToken;
    database.query('SELECT * FROM user WHERE Email = ?', [Email], function (err, rows) {
        if (err) {
          return res.status(500).json({ message: 'Database error occured' });
        }
        const subscriptionId=rows[0].Subscription;
        async function getSubscriptionDetails(subscriptionId) {
            try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;
                const price = await stripe.prices.retrieve(priceId);
                const productId = price.product;
                const product = await stripe.products.retrieve(productId);
                database.query('SELECT * FROM plans WHERE `Plan Name` = ?', [product.name], function (err, rows) {
                    if (err) {
                        return res.status(500).json({ message: 'Database error occured' });
                      }
                    res.status(200).json(rows[0]);
                });
            } catch (error) {
                res.status(500).json({message:'Some error occured'});
            }
        }
        getSubscriptionDetails(subscriptionId);
    })  
})

module.exports=router;