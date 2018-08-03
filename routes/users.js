const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser=require('body-parser');
const gravatar = require('gravatar');
const User = require('../models/User');
const keys = require('../config/keys');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/test', (req,res) =>
 res.json({msg:"this is a test"}));

 router.post('/register', (req, res) => {
 
    User.findOne({ email: req.body.email }).then(user => {
    if (user) {
        return res.status(400).json({email:"Email already exists"});
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm' // Default
        });
  
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });
  
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });



  router.post('/login', (req,res)=> {

    const email= req.body.email;
    const password= req.body.password;

    User.findOne({email}).then(user => {
        if(!user)
        {
            return res.status(400).json({email:"User account does not exist"});

        }

        else{
            bcrypt.compare(password,user.password).then(isMatch=> {
                if(isMatch)
                {
                   const payload ={id:user.id, name:user.name};

                   // Sign Token
        jwt.sign(
            payload,
            keys.secret,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
                name: user.name
              });
            }
          );


                }

                else{
                    return res.status(400).json({email:"Passwords is invalid"});
                }
            })
        }
    })

  });



module.exports = router;