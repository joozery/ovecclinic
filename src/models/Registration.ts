
import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    status: {
        type: String,
        enum: ['Registered', 'Completed', 'Cancelled'],
        default: 'Registered',
    },
    registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent duplicate registrations for the same user and activity
RegistrationSchema.index({ userId: 1, activityId: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
