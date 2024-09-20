const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors());
const productRoutes = require('./product');// Import the product routes
app.use('/api', productRoutes);// Use the product routes

const orderRoutes = require('./order'); // Import the order routes
app.use('/api', orderRoutes); // Use the order routes



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
