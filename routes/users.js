const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
require('dotenv').config();
var mongo = require('mongodb').MongoClient;
var assert = require('assert')
// Load User model
const User = require('../models/user');
const multer = require('multer');
var nodemailer = require("nodemailer");
var fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config()

//generate random ID
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  //name file using unique ID
  filename: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg') {
      cb(null, Math.floor(Math.random() * 100) + makeid(15) + ".jpg");
    } else {
      cb(null, Math.floor(Math.random() * 100) + makeid(15) + ".png");
    }

  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


// Register
router.post("/register", upload.single('profile'), (req, res, next) => {
  console.log(req.file);
  const {
    name,
    email,
    password,
    password2,
    username,
    phoneNo,
    idNo,
    dob,
    gender,
    station,
    county,
    education,
    institution
  } = req.body;
  const profile = req.file.path.substring(8);
  let errors = [];

  if (!name || !email || !password || !password2 || !username || !phoneNo || !idNo || !dob || !gender || !station || !county
    || !education || !institution) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors
    });
  } else {
    User.findOne({ idNo: idNo }).then(user => {
      if (user) {
        errors.push({ msg: 'This ID is already registered, please log in' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          username,
          phoneNo,
          idNo,
          dob,
          gender,
          station,
          county,
          education,
          institution,

        });
      }
      else {
        const newUser = new User({
          name,
          email,
          password,
          username,
          phoneNo,
          idNo,
          dob,
          gender,
          station,
          county,
          education,
          profile,
          institution

        });


        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "patrickotieno39@gmail.com",
            pass: process.env.PASSCODE
          }
        });
        // Create a document
        const doc = new PDFDocument;

        doc.pipe(fs.createWriteStream('PAG-KENYA.pdf'));

        // Embed a font, set the font size, and render some text
        doc.font('Times-Bold')
          .fontSize(25)
          .text('Pentecostal Assembies of God - Kenya', 100, 100);

        //Move down to next line
        doc.moveDown();
        doc.font('Times-Roman')
          .fontSize(16)
          .text(`Name: ${newUser.name} \nUsername: ${newUser.username}\nEmail: ${newUser.email}\nPhone Number: ${newUser.phoneNo}\nID Number: ${newUser.idNo}\nGender: ${newUser.gender}\nStation: ${newUser.station}\nEducation: ${newUser.education}\nInstitution: ${newUser.institution}\nStation: ${newUser.station}\nCounty: ${newUser.county}`, {
            width: 410,
            align: 'left'
          }
          );


        // Finalize PDF file
        doc.end();

        var mailOptions = {
          from: "patrickotieno39@gmail.com",
          to: newUser.email,
          subject: "Thank You For Registering With PAG-Kenya",
          text: `Below are your user details`,
          attachments: [{   // file on disk as an attachment
            filename: "PAG-KENYA.pdf",
            content: fs.createReadStream('PAG-KENYA.pdf')
            // stream this file
          }]
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                console.log(user.password);
                res.status(200).redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }

});




// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
