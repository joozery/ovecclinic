
import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },

    files: [{
        name: String,
        url: String,
        type: { type: String }, // 'type' is a reserved keyword in Mongoose, so we define it like this
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

delete mongoose.models.Submission;
export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
