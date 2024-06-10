const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require('../middleware/fetchuser');

require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET; //process.env.JWT_SECRET;

// ROUTE 1 : Create a user :POST '/api/auth/signup' 

// express router handler

router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    check("email")
      .isEmail()
      .withMessage("Enter a valid email address"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    let success = false;
    //if validationResults (function) returns an error it will store in errors variable
    //like if there are errors in req
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    //whether user with this email already exists
    try {
      let user = await Users.findOne({ email: req.body.email });
      // The variable user likely contains the result of a database query
      if (user) {
        return res
          .status(400)
          .json({ success , error: "User with this email already exists" });
      }
      //use await because it returns promise
      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await Users.create({
        name: req.body.name,
        password: secpass,
        email: req.body.email,
      });
      //generating a jwt
      //we use id to get user details from db in jwt thats why we add it here
      // it is the payload 
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      // authToken is the name which is used to set token in browser in forntend
      res.json({ success, authToken });

      //response to the user it can be a message
      // res.json(user)

      // then(user =>res.json(user))
      // .catch(err => console.log(err))
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error occured");
    }
  }
);

// ROUTE 2 : Authenticate a user  :POST '/api/auth/login' .
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password").exists().withMessage("Password can not be blank")
  ],
  async (req, res) => {
    let success = false;
    //if there are errors return bad requests with error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password} = req.body;
    try{
        // Wait for the promise to resolve and get the user
        //it searches of email in db and returns a user if exists
          let user = await Users.findOne({email});
          if(!user){
            return res.status(400).json({error:'Please try to login with correct credentials'})
          }
          
          //it returns true or flase
          //user.password is the password from the db
          const passComapre = await  bcrypt.compare(password,user.password)
          if(!passComapre){
            return res.status(400).json({error:'Please try to login with correct credentials'})
          }

          // const user = req.user;
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, JWT_SECRET);
          success = true;
          //here data is the payload that you want to enter in jwt
          res.json({ success,authToken });



    } catch{
      console.log(error.message);
      res.status(500).send("Internal server error occured");
    }
  } 
)

// ROUTE 3 : Get loggedin user details :POST '/api/auth/getuser' . Login required

router.post(
  "/getuser",fetchuser, async (req, res) => {

        try {
          const userId = req.user.id;
          const user = await Users.findById(userId).select("-password");
          console.log(user);
          res.send(user);
        } catch (error) {
          console.log(error.message);
              res.status(500).send("Internal server error occured");
        }
   }
)
module.exports = router;


