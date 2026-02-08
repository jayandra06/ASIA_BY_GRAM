import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
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
        type: String
    }
}, { timestamps: true });

export default mongoose.models.Table || mongoose.model('Table', TableSchema);
