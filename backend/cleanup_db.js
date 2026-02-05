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

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Delete items with random-looking IDs or known bad IDs
        const result = await Menu.deleteMany({
            $or: [
                { id: /item_123/ },
                { id: /-[a-z0-9]{4}$/ } // Matches the 4-char random suffix I added earlier
            ]
        });
        console.log(`Cleaned up ${result.deletedCount} duplicate/test items.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
