import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import reservationRoutes from './routes/reservations.js';
import tableRoutes from './routes/tables.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asia_by_gram';
console.log('Attempting to connect to MongoDB...', MONGODB_URI.split('@')[1] || MONGODB_URI); // Log redacted URI

mongoose.connect(MONGODB_URI, { family: 4 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ Could not connect to MongoDB');
        console.error('Error details:', err.message);
        if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
            console.log('\nTIP: This error usually means your local DNS or Firewall is blocking MongoDB Atlas.');
            console.log('Try switching to a different network or using a VPN.');
        }
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Asia By Gram API is running');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Process interrupted');
    });
});
