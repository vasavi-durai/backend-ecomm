const express = require('express');
const router = express.Router();
const saveProductController = require('../controllers/product');
const { adminOnly } = require('../middleware/auth'); 
var allcategories = require('../controllers/product');
var allproducts = require('../controllers/product');

router.post('/storep', adminOnly, saveProductController.saveProduct);
router.put('/updatep/:id', adminOnly, saveProductController.updateProduct); 
router.delete('/deletep/:id', adminOnly, saveProductController.deleteProduct);
router.post('/storec', adminOnly, saveProductController.saveCategory);
router.get('/getallc', allcategories.getAllCategories);
router.get('/getallp', allproducts.getAllProducts);
module.exports = router;
