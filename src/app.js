const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./routes/user.routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// HTTP request logging (morgan → winston)
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// Health check route (optional but useful)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Routes
app.use('/api/users', userRoutes);

// 404 handler (route not found)
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl
  });

  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;