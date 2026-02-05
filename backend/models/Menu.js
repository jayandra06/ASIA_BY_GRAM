import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID to match existing frontend logic if needed, or we can migrate to _id
    name: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true }, // Keeping as string for "₹468" format, though number is better usually.
    category: { type: String, required: true },
    dietary: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
    image: { type: String }
});

export default mongoose.model('Menu', menuSchema);
