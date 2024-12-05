const express = require('express');
const cors = require('cors');
const routes = require('./routes/route.js'); // Import routes

const app = express();
const PORT = process.env.PORT || 3000; // Dynamic port (from environment or default to 3000)

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON body
app.use('/api/', routes); // Use routes with '/api' prefix

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
