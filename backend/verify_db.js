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

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const items = await Menu.find({ image: { $exists: true, $ne: null } }).limit(5);
        console.log(`Found ${items.length} items with images`);
        items.forEach((item, idx) => {
            console.log(`--- ITEM ${idx + 1} ---`);
            console.log('ID:', item.id);
            console.log('Name:', item.name);
            console.log('Image:', item.image);
        });

        const totalItems = await Menu.countDocuments();
        const itemsWithoutImage = await Menu.countDocuments({ $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] });
        console.log(`Total items: ${totalItems}, Items without image: ${itemsWithoutImage}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
