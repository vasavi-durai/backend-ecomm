const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const productrouter = require('./routes/productr');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;


connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); 

app.use('/api', productrouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
