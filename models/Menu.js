import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    dietary: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
    image: String,
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

// Check if the model exists before creating a new one to prevent errors during hot reloading
export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
