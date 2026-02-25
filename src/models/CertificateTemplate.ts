
import mongoose from 'mongoose';

const TextFieldSchema = new mongoose.Schema({
    id: { type: String, required: true },       // e.g. 'recipientName'
    label: { type: String, required: true },     // Display label (Thai)
    x: { type: Number, default: 50 },           // % from left
    y: { type: Number, default: 50 },           // % from top
    fontSize: { type: Number, default: 24 },
    fontWeight: { type: String, default: 'bold' },
    color: { type: String, default: '#1a237e' },
    align: { type: String, default: 'center' },  // left, center, right
}, { _id: false });

const CertificateTemplateSchema = new mongoose.Schema({
    name: { type: String, default: 'แม่แบบมาตรฐาน' },
    backgroundImageUrl: { type: String },       // URL to uploaded background
    fields: [TextFieldSchema],
    signerName: { type: String, default: '' },
    signerPosition: { type: String, default: '' },
    orgName: { type: String, default: 'สำนักงานคณะกรรมการการอาชีวศึกษา' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.CertificateTemplate || mongoose.model('CertificateTemplate', CertificateTemplateSchema);
