import mongoose from 'mongoose';

const AdSchema = new mongoose.Schema({
    title: { type: String, trim: true, default: '' },
    content: { type: String, required: true, trim: true },
    mediaUrl: { type: String, trim: true, default: '' },
    category: {
        type: String,
        enum: ['offer', 'competition', 'general'],
        default: 'offer',
    },
    adType: {
        type: String,
        enum: ['popup', 'banner', 'toast', 'badge', 'flyer', 'floating'],
        default: 'popup',
        required: true,
    },
    ctaText: { type: String, trim: true, default: 'Learn More' },
    ctaLink: { type: String, trim: true, default: '' },
    autoCloseSeconds: { type: Number, min: 0, max: 300, default: 0 },
    showCloseButton: { type: Boolean, default: true },
    frequency: {
        type: String,
        enum: ['always', 'once', 'session', 'daily'],
        default: 'session',
    },
    targetAudience: {
        type: String,
        enum: ['all', 'new', 'returning'],
        default: 'all',
    },
    placement: {
        type: String,
        enum: ['homepage', 'menu', 'both'],
        default: 'both',
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    position: {
        type: String,
        enum: ['center', 'top', 'bottom-right', 'bottom-left', 'top-right'],
        default: 'center',
    },
    priority: { type: Number, min: 1, max: 10, default: 5 },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    borderRadius: { type: Number, min: 0, max: 48, default: 12 },
    animationType: {
        type: String,
        enum: ['fade', 'slide', 'scale'],
        default: 'fade',
    },
    animationDuration: { type: Number, min: 100, max: 2000, default: 500 },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
}, { timestamps: true });

AdSchema.index({ status: 1, placement: 1, priority: -1 });

export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
