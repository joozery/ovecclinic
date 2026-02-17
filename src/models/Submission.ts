
import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },

    files: [{
        name: String,
        url: String, // In production, this would be an S3/Cloudinary URL
        type: String, // e.g., 'application/pdf', 'image/png'
        size: Number,
    }],
    links: [{ type: String }],

    status: {
        type: String,
        enum: ['Pending', 'In Review', 'Approved', 'Rejected', 'Request Changes'],
        default: 'Pending',
    },

    feedback: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
