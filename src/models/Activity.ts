
import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    quota: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    targetBranch: { type: String }, // สาขาวิชาที่สอน
    meetingId: { type: String },
    meetingPassword: { type: String },
    bannerImage: { type: String },
    externalSourceLink: { type: String }, // ลิงก์เอกสารเพิ่มเติม (Google Drive, etc.)
    documents: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String },
        size: { type: Number },
    }],
    status: {
        type: String,
        enum: ['Open', 'Full', 'Closed', 'Postponed'],
        default: 'Open',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }], // Future use
}, { timestamps: true });

// Virtual to check current registration count (placeholder logic for now)
ActivitySchema.virtual('currentRegistrations', {
    ref: 'Registration', // We will strictly define this later
    localField: '_id',
    foreignField: 'activityId',
    count: true,
});

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
