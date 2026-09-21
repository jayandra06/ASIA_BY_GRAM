import mongoose from 'mongoose';

const EventLeadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 1, max: 120, required: true },
    eventName: { type: String, trim: true, default: '' },
    adId: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: 'register' },
}, { timestamps: true });

EventLeadSchema.index({ phone: 1, eventName: 1 });

export default mongoose.models.EventLead || mongoose.model('EventLead', EventLeadSchema);
