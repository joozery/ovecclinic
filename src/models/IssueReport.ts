
import mongoose from 'mongoose';

const IssueReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        enum: ['bug', 'account', 'activity', 'certificate', 'other'],
        required: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
    },
    adminNote: { type: String },
    resolvedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.IssueReport || mongoose.model('IssueReport', IssueReportSchema);
