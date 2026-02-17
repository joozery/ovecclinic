
import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },

    certificateCode: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    templateType: { type: String, default: 'standard' },

}, { timestamps: true });

// Index for fast lookup by code
CertificateSchema.index({ certificateCode: 1 });

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
