import mongoose from 'mongoose';

const EventRegistrationSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    note: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.EventRegistration || mongoose.model('EventRegistration', EventRegistrationSchema);
