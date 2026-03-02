import mongoose from "mongoose";

export interface IOtp extends mongoose.Document {
    email: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true
        },
        code: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
    },
    { timestamps: true }
);

// Delete document automatically after 5 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
