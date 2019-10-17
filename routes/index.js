var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Zabo Node.js Quickstart App',
    clientId: process.env.CLIENT_ID
  });
});

module.exports = router;
