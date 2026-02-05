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
        const items = await Menu.find({ name: /Vegan tofu wraps/i });
        console.log(`Found ${items.length} items`);
        items.forEach((item, idx) => {
            console.log(`--- ITEM ${idx + 1} ---`);
            console.log('ID:', item.id);
            console.log('Name:', item.name);
            console.log('Description:', item.description);
            console.log('Price:', item.price);
            console.log('Category:', item.category);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
