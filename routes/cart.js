
var express = require('express');
var router = express.Router();
var addtocartcontroller = require('../controllers/cart');

const { authenticateToken } = require('../middleware/auth');
router.post('/addtocart', authenticateToken, addtocartcontroller.addToCart);
router.get('/getcart', authenticateToken, addtocartcontroller.getCart);
router.delete('/delcart/:id', authenticateToken, addtocartcontroller.deleteCartItem);
router.post('/checkout', authenticateToken, addtocartcontroller.checkoutCart);
module.exports = router;
