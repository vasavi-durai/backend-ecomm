const Product = require('../models/product');
const Category= require('../models/category');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).array('images', 4); 


function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
exports.saveproduct = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      const images = req.files.map(file => file.path); 
      const product = new Product({
        title: req.body.title,
        description: req.body.description,
        images: images,
        price: req.body.price,
        category: req.body.category,
      });

      product.save()
        .then(() => res.status(201).send(product))
        .catch((error) => res.status(400).send(error));
    }
  });
};
exports.savecategory = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      const images = req.files.map(file => file.path); 
      const category = new Category({
        title: req.body.title,
        images: images,
      });

      category.save()
        .then(() => res.status(201).send(category))
        .catch((error) => res.status(400).send(error));
    }
  });
};

exports.searchproduct = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { description: { $regex: new RegExp(query, 'i') } },
        { category: { $regex: new RegExp(query, 'i') } },
      ],
    });
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getAllCategories = async (req, res) => { 
  try { const categories = await Category.find({}); 
  res.send(categories); 
} catch (error) { 
  res.status(500).send(error); 
} 
}; 

exports.getAllProducts = async (req, res) => { 
  try { 
    const products = await Product.find({});
     res.send(products);
     } catch (error) 
     { 
      res.status(500).send(error);
     }
};


// const Category = require('../models/category');
// const Product = require('../models/product');
// const upload  = require('../app');
// // exports.saveproduct = async (req, res) => {
// //   const product = new Product(req.body);
// //   try {
// //     await product.save();
// //     res.status(201).send(product);
// //   } catch (error) {
// //     res.status(400).send(error);
// //     console.log(error);
// //   }
// // };
// exports.saveproduct = (req,res) =>{
//     upload(req, res, (err) => { 
//     if (err) { res.status(400).send(err);

//      } else { 
//       const product = new Product({
//          title: req.body.title, 
//          description: req.body.description,
//           image: req.file.path,
//            price: req.body.price, 
//            category: req.body.category,
//            });
//             product.save()
//              .then(() => res.status(201).send(product)) 
//              .catch((error) => res.status(400).send(error)); 
  
//           }
//         });
// };

// exports.searchproduct = async (req, res) => {
//   const { query } = req.query;
//   try {
//     const products = await Product.find({
//       $or: [
//         { title: { $regex: new RegExp(query, 'i') } },
//         { description: { $regex: new RegExp(query, 'i') } },
//         { category: { $regex: new RegExp(query, 'i') } },
//       ],
//     });
//     res.send(products);
//   } catch (error) {
//     res.status(500).send(error);
//     console.log(error);
//   }
// };
