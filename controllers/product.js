const Product = require('../models/product');
const multer = require('multer');
const path = require('path');
const Category= require('../models/category');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array('images', 4);


function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

exports.saveCategory = (req,res) => {
  upload(req,res, (err) =>
  {
    if(err){
      return res.status(400).send(err);
    }
    const images = req.files.map(file => file.path);
    const title = req.body.title;
    const category = new Category({
      title,
      images
    });
    category.save()
    .then(()=> res.status(201).send(category))
    .catch((error)=> res.status(400).send(error));
  });
};

exports.saveProduct = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send(err);
    }
    const images = req.files.map(file => file.path);
    const { title, description, price, category } = req.body;

    let quantity = { sold: 0, balance: 0 };
    if (req.body.quantity) {
      quantity = JSON.parse(req.body.quantity);
    }

    const product = new Product({
      title,
      description,
      images,
      price,
      category: category || '1',
      quantity: {
        sold: quantity.sold || 0,
        balance: quantity.balance || 0,
      },
    });

    product.save()
      .then(() => res.status(201).send(product))
      .catch(error => res.status(400).send(error));
  });
};

// exports.updateProduct = async (req, res) => {
//   const { id } = req.params; 
//   const { title, description, price, category, quantity } = req.body;

//   try {
//     const updatedData = {
//       title,
//       description,
//       price,
//       category,
//       quantity,
//     };

//     const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({ message: 'Product updated successfully', product });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating product', error });
//   }
// };


exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).send({ message: 'Product not found' });
    }

    res.status(200).send({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting product', error });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
};


exports.updateProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err);
    }
    const { id } = req.params;
    const { title, description, price, category, quantity } = req.body;
    const updatedData = {};

    if (title) updatedData.title = title;
    if (description) updatedData.description = description;
    if (price) updatedData.price = price;
    if (category) updatedData.category = category;
    if (quantity) {
      updatedData.quantity = {};
      if (quantity.sold !== undefined) updatedData.quantity.sold = quantity.sold;
      if (quantity.selling !== undefined) updatedData.quantity.selling = quantity.selling;
      if (quantity.balance !== undefined) updatedData.quantity.balance = quantity.balance;
    }

    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => file.path);
    }
    try {
      const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
      res.status(500).json({ message: 'Error updating product', error });
    }
  });
};
