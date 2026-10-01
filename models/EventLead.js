import mongoose from 'mongoose';

const EventLeadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 1, max: 120, required: true },
    eventName: { type: String, trim: true, default: '' },
    adId: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: 'register' },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded', 'Free'],
        default: 'Pending',
    },
    entryFee: { type: Number, default: 0 },
    paymentNotes: { type: String, trim: true, default: '' },
    utr: { type: String, trim: true, default: '' },
}, { timestamps: true });

EventLeadSchema.index({ phone: 1, eventName: 1 });

export default mongoose.models.EventLead || mongoose.model('EventLead', EventLeadSchema);
