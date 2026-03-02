
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: {
        type: String,
        enum: ['teacher', 'supervisor', 'admin', 'super_admin'],
        default: 'teacher',
    },
    username: { type: String, unique: true, sparse: true }, // Optional for OAuth users
    password: { type: String, select: false }, // Optional for OAuth users
    providerAccounts: [{
        provider: { type: String, required: true },
        providerAccountId: { type: String, required: true },
    }],
    idCard: { type: String, unique: true, sparse: true },
    profile: {
        registrantType: {
            type: String,
            enum: ['Thai', 'Foreigner', 'Stateless'],
            default: 'Thai'
        },
        prefixTH: String,
        firstNameTH: String,
        lastNameTH: String,
        prefixEN: String,
        firstNameEN: String,
        lastNameEN: String,
        birthDate: Date,
        phone: String,
        college: String,
        position: String,
        province: String,
        region: {
            type: String,
            enum: ['North', 'South', 'Central', 'Northeast', 'East_Bangkok'],
        },
        affiliation: {
            type: String,
            enum: ['Government', 'Private', 'Supervisor_Unit'],
        },
        academicStanding: String,
        teachingSubject: String,
    },
    isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent overwrite during hot reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);
