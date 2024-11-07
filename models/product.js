const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [String],
    price: Number,
    category: String,
}
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;