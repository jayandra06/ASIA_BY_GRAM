import mongoose from 'mongoose';
import Menu from './models/Menu.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800";

async function fixImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Menu.updateMany(
            { $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] },
            { $set: { image: DEFAULT_IMAGE } }
        );

        console.log(`Successfully updated ${result.modifiedCount} items with default image.`);
    } catch (err) {
        console.error('Error fixing images:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixImages();
