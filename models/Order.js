import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    menuItemId: { type: String },
    name: { type: String, required: true },
    price: { type: String, required: true }, // e.g. "₹100"
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true }, // human-readable e.g. ORD-ABC123
    items: [OrderItemSchema],
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderType: { type: String, enum: ['Dine-in', 'Take away'], required: true },
    tableNumber: { type: String }, // for Dine-in
    status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Served', 'Cancelled'], default: 'Pending' },
    specialRequests: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
