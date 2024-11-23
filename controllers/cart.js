const Cart = require('../models/cart');
const Product = require('../models/product');

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId; 

  try {
    console.log("User ID:", userId);
    console.log("Product ID:", productId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.quantity.balance) {
      return res.status(400).json({ message: `Only ${product.quantity.balance} items available in stock.` });
    }

    let cart = await Cart.findOne({ user: userId });
    console.log("Cart:", cart);

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};
