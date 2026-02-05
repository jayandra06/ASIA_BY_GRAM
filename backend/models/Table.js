import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    qrCodeData: {
        type: String // Optional: Store generated base64 or just rely on dynamic client-side generation
    }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
