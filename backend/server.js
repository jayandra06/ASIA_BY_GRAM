import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import compression from 'compression';

dns.setServers(['8.8.8.8', '1.1.1.1']); // Set public DNS to resolve Atlas SRV records
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import reservationRoutes from './routes/reservations.js';
import tableRoutes from './routes/tables.js';
import categoryRoutes from './routes/categories.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded from:', path.join(__dirname, '.env'));
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(compression());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asia_by_gram')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);

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
