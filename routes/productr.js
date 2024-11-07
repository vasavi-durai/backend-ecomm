var express = require('express');
var router = express.Router();

var storeproductcontroller = require('../controllers/product');
var storecategorycontroller = require('../controllers/product');
var getsearchcontroller = require('../controllers/product');
router.post('/storep', storeproductcontroller.saveproduct);
router.get('/search', getsearchcontroller.searchproduct);
router.post('/storec', storecategorycontroller.savecategory);
module.exports = router;