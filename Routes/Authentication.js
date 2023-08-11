const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const database=require('../databaseConnection/connection');
require('dotenv').config();
const e=process.env;

const secretKey = e.SECRETKEY;

router.post('/register', (req, res) => {
    console.log('register run');
    const { email, password, name } = req.body;
  
    database.query('SELECT * FROM user WHERE Email = ?', [email], function (err, rows) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists. Please use another email.' });
      }
  
      const hashedPassword = bcrypt.hashSync(password, 8);
      
      const insertQuery = 'INSERT INTO user (Email, Name, Password) VALUES (?, ?, ?)';
      database.query(insertQuery, [email, name, hashedPassword], function (err) {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        
        return res.status(200).json({ message: 'User registered successfully' });
      });
    });
  });

router.post('/login' , (req,res) => {
    const { email, password, rememberMe } = req.body;

    database.query(`SELECT * FROM user WHERE Email = '${email}'`, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const dbUser = rows[0];
        const passwordIsValid = bcrypt.compareSync(password, dbUser.Password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenExpiration = rememberMe ? '7d' : '1d';

        const token = jwt.sign({ Email: dbUser.Email }, secretKey, { expiresIn: tokenExpiration });

        return res.status(200).json({ token });
      
    });
});
module.exports=router;