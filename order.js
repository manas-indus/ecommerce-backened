const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming db.js exports the database connection

// Create a new order with order details
router.post('/orders', (req, res) => {
  const { user_id, status, total_amount, orderDetails } = req.body; // Expecting orderDetails to be an array of objects
  // Begin a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to start transaction' });
    }
    // Insert into the 'order' table
    const orderQuery = 'INSERT INTO `order` (user_id, status, total_amount) VALUES (?, ?, ?)';
    db.query(orderQuery, [user_id, status, total_amount], (orderErr, orderResult) =>{
      if (orderErr) {
        return db.rollback(() => {
          console.error('Error creating order:', orderErr);
          res.status(500).json({ error: 'Failed to create order' });
        });
      }

      const orderId = orderResult.insertId;
      
      // Prepare data for bulk insert into 'order_detail'
      const orderDetailData = orderDetails.map(detail => [orderId, detail.product_id, detail.quantity, detail.price]);

      // Insert into the 'order_detail' table
      const orderDetailQuery = 'INSERT INTO order_detail (order_id, product_id, quantity, price) VALUES ?';
      db.query(orderDetailQuery, [orderDetailData], (detailErr, detailResult) => {
        if (detailErr) {
          return db.rollback(() => {
            console.error('Error creating order details:', detailErr);
            res.status(500).json({ error: 'Failed to create order details' });
          });
        }

        // Commit transaction
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              console.error('Error committing transaction:', commitErr);
              res.status(500).json({ error: 'Failed to commit transaction' });
            });
          }

          res.status(201).json({  
            order_id: orderId, 
            message: 'Order and order details created successfully' 
          });
        });
      });
    });
  });
});

module.exports = router;
