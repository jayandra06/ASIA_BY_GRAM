import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: String, required: true },
    // Numeric base price for safe calculations (bulk %, amount updates, GST)
    basePrice: { type: Number, default: null },
    category: { type: String, required: true },
    subcategory: String,
    dietary: { type: [String], enum: ['Veg', 'Non-Veg'], default: [] }, // empty = no dietary (e.g. beverages)
    image: String,
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    // GST metadata. If gstEnabled=false, GST should not be added to menu price.
    gstEnabled: { type: Boolean, default: false },
    gstRate: { type: Number, default: null }, // e.g. 5, 12, 18
    gstIncludedInPrice: { type: Boolean, default: false },
    // Optional per-item configuration for add-ons / variants
    options: [{
        id: { type: String },                          // e.g. "milk", "size"
        name: { type: String },                        // e.g. "Type of milk"
        type: { type: String, enum: ['single', 'multi'], default: 'single' },
        required: { type: Boolean, default: false },
        choices: [{ type: String }]                    // e.g. ["Almond Milk", "Oat Milk"]
    }]
}, { timestamps: true });

// Check if the model exists before creating a new one to prevent errors during hot reloading
export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
