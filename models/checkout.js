const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
       
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model('Order', orderSchema);