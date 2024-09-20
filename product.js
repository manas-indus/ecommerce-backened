const express = require('express');
const router = express.Router();
const db = require('./db'); // Correctly import the db connection
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Create a new product
router.post('/products', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.buffer : null; // Get image from request
  const query = 'INSERT INTO product (name, description, price, image) VALUES (?, ?, ?, ?)';

  db.query(query, [name, description, price, image], (err, result) => {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    res.status(201).json({ id: result.insertId, name, description, price });
  });
});

// Read all products
router.get('/products', (req, res) => {
  const query = 'SELECT * FROM product';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving products:', err);
      return res.status(500).json({ error: 'Failed to retrieve products' });
    }
    res.status(200).json(results);
  });
});

// Read a single product by ID
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM product WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving product:', err);
      return res.status(500).json({ error: 'Failed to retrieve product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Serve image
router.get('/products/image/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT image FROM product WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving image:', err);
      return res.status(500).json({ error: 'Failed to retrieve image' });
    }
    if (results.length === 0 || !results[0].image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.contentType('image/png'); // Adjust content type based on image format
    res.send(results[0].image);
  });
});

// Update a product by ID
router.put('/products/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const image = req.file ? req.file.buffer : null;
  const query = 'UPDATE product SET name = ?, description = ?, price = ?, image = ? WHERE id = ?';

  db.query(query, [name, description, price, image, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  });
});

// Delete a product by ID
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM product WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;
