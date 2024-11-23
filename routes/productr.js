const express = require('express');
const router = express.Router();
const saveProductController = require('../controllers/product');
const { adminOnly } = require('../middleware/auth'); 


router.post('/storep', adminOnly, saveProductController.saveProduct);
router.put('/updatep/:id', adminOnly, saveProductController.updateProduct); 
router.delete('/deletep/:id', adminOnly, saveProductController.deleteProduct);

module.exports = router;
