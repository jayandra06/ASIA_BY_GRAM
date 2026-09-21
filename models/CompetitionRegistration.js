import mongoose from 'mongoose';

const CompetitionRegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    age: { type: Number, min: 5, max: 100 },
    experience: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
    },
    notes: { type: String, trim: true, default: '' },
    entryFee: { type: Number, default: 500 },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    competition: { type: String, default: 'Chess Championship 2026' },
    tableNumber: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.CompetitionRegistration ||
    mongoose.model('CompetitionRegistration', CompetitionRegistrationSchema);
