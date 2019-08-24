const express = require('express');
const router = express.Router();
const User = require("../models/user");

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

router.get('/print', ensureAuthenticated, function(req, res, next) {
  User.find()
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      products: docs.map(doc => {
        return {
          name: doc.name,
          riderPassportPhoto: doc.riderPassportPhoto,
          _id: doc._id,
          request: {
            type: "GET",
            url: doc._id
          }
        };
      })
    };
    res.render("print", {docs: docs})
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});


module.exports = router;
