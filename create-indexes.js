// Run this script once to create database indexes for better performance
// Usage: node create-indexes.js

import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers for SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = 'mongodb://asiabygram:Asia2025@cluster0-shard-00-00.qr3nvbx.mongodb.net:27017,cluster0-shard-00-01.qr3nvbx.mongodb.net:27017,cluster0-shard-00-02.qr3nvbx.mongodb.net:27017/asia-by-gram?ssl=true&authSource=admin&replicaSet=atlas-fvfxf3-shard-0&retryWrites=true&w=majority';

async function createIndexes() {
    try {
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            family: 4,
        });

        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const menuCollection = db.collection('menus');

        // Create indexes for frequently queried fields
        await menuCollection.createIndex({ category: 1 });
        await menuCollection.createIndex({ dietary: 1 });
        await menuCollection.createIndex({ category: 1, dietary: 1 });
        await menuCollection.createIndex({ available: 1 });

        console.log('✅ Indexes created successfully:');
        console.log('  - category');
        console.log('  - dietary');
        console.log('  - category + dietary (compound)');
        console.log('  - available');

        const indexes = await menuCollection.indexes();
        console.log('\nAll indexes:', indexes);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error creating indexes:', error);
        process.exit(1);
    }
}

createIndexes();
