const Cart = require('../models/cart');
const Product = require('../models/product');
const Checkout = require('../models/checkout');

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
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());
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


exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);
    const cartResponse = {
      items: cart.items.map(item => ({
        product: {
          id: item.product._id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images,
        },
        quantity: item.quantity,
      })),
      totalPrice,
    };

    res.status(200).json(cartResponse);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

exports.updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity > product.quantity.balance) {
      return res.status(400).json({ message: `Only ${product.quantity.balance} items available in stock.` });
    }
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    console.log(itemIndex);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not in cart' });
    }
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
   
    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart', error });
  }
};

exports.deleteCartItem = async (req, res) => {
  const { id } = req.params; 
  const userId = req.user.userId; 
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });
    const itemIndex = cart.items.findIndex(item => item.product.toString() === id);
    if (itemIndex === -1) return res.status(404).json({ error: 'Product not found in cart.' });
    cart.items.splice(itemIndex, 1);
    await cart.save();
    res.json({ message: 'Cart item deleted successfully', cart });
  } catch (error) {
    console.error('Delete Cart Item Error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error.' });
  }
};
 
exports.checkoutCart = async (req, res) => {
  const userId = req.user.userId;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }
    const validItems = cart.items.filter(item => item.product !== null);
    const totalPrice = validItems.reduce((sum, item) => 
      sum + (item.quantity * item.product.price), 0
    );
    const newCheckout = new Checkout({
      user: userId,
      items: validItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        totalPrice: item.quantity * item.product.price,
      })),
      totalAmount: totalPrice,
    });
    await newCheckout.save();
    for (const item of validItems) {
      const product = await Product.findById(item.product._id);
      product.quantity.balance -= item.quantity;  
      product.quantity.selling += item.quantity;  
      await product.save();
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Checkout successful.', checkout: newCheckout });
  } catch (error) {
    console.error('Error during checkout:', error.message, error.stack);
    res.status(500).json({ message: 'Error during checkout', error });
  }
};

// exports.getCart = async (req, res) => {
//   try { 
//     const cart = await Cart.find({ user: req.user.userId }).populate('items.product');
//     if (!cart || cart.length === 0) {
//       return res.status(404).json({ message: 'Cart not found.' });
//     }
//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching cart', error });
//   }
// };



// exports.checkoutCart = async (req, res) => {
//   const userId = req.user.userId; 
//   try {
//     const cart = await Cart.findOne({ user: userId }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Your cart is empty.' });
//     }
     
//     const validItems = cart.items.filter(item => item.product !== null);

//     const totalPrice = validItems.reduce((sum, item) => 
//       sum + item.quantity * item.product.price, 0
//     );

//     const order = new Order({
//       user: userId,
//       products: validItems.map(item => ({
//         productId: item.product._id,
//         quantity: item.quantity,
//         price: item.product.price
//       })),
//       totalPrice,
//     });
//     await order.save();

//     for (const item of validItems) {
//       const product = await Product.findById(item.product._id);
//       product.quantity.balance -= item.quantity;
//       product.quantity.selling += item.quantity;
//       await product.save();
//     }

//     cart.items = [];
//     await cart.save();

//     res.status(200).json({ message: 'Checkout successful.', order });
//   } catch (error) {
//     console.error('Error during checkout:', error.message, error.stack);
//     res.status(500).json({ message: 'Error during checkout', error });
//   }
// };


// exports.addToCart = async (req, res) => {
//   const { productId, quantity } = req.body;
//   const userId = req.user.userId; 

//   try {
//     console.log("User ID:", userId);
//     console.log("Product ID:", productId);

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     if (quantity > product.quantity.balance) {
//       return res.status(400).json({ message: `Only ${product.quantity.balance} items available in stock.` });
//     }

//     let cart = await Cart.findOne({ user: userId });
//     console.log("Cart:", cart);

//     if (!cart) {
//       cart = new Cart({
//         user: userId,
//         items: [{ product: productId, quantity }],
//       });
//     } else {
//       const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//       if (itemIndex > -1) {
//         cart.items[itemIndex].quantity += quantity;
//       } else {
//         cart.items.push({ product: productId, quantity });
//       }
//     }

//     await cart.save();
//     res.status(200).json({ message: 'Item added to cart', cart });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: 'Error adding item to cart', error });
//   }
// };