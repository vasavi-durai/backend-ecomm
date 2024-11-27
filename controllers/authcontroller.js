const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!password || !username || !email) {
          return res.status(400).send('Please Ensure username, Email , password');
      }
      const alreadyRegistered = await User.findOne({ email });
      if (alreadyRegistered) {
          return res.status(400).send( 'Already Registered User' );
      }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
       username, 
       email,
       password: hashedPassword, 
       });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send( 'Internal Server Error' );
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      // { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      user: { id: user._id, email: user.email }, 
      token,
      username: user.username
    });
  } catch (error) {
    console.error('User Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      message: 'Login successful!',
      admin: { id: admin._id, email: admin.email, role: admin.role },
      token,
    });
  } catch (error) {
    console.error('Admin Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const registeradmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!password || !username || !email) {
        return res.status(400).json({ message: 'Please Ensure username, Email , password' });
    }
    const alreadyRegistered = await Admin.findOne({ email });
    if (alreadyRegistered) {
        return res.status(400).json({ message: 'Already Registered Admin' });
    }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({
     username, 
     email,
     password: hashedPassword, 
     role:'Admin' });
  await admin.save();
  res.status(201).send('Admin registered successfully');
} catch (error) {
  res.status(500).send(error.message);
}
};

module.exports = { register, loginAdmin, loginUser , registeradmin};


