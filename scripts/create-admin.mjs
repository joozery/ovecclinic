
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://ovecclinic_db_user:lGbmr7xo9b28bTZ8@ovecclinic.c82bluf.mongodb.net/ovecclinic?retryWrites=true&w=majority&appName=ovecclinic";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ['teacher', 'supervisor', 'admin', 'super_admin'],
        default: 'teacher',
    },
    password: { type: String, required: true },
    isProfileComplete: { type: Boolean, default: true },
    profile: {
        phone: String,
        college: String,
        position: String,
        region: String,
        affiliation: String,
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = "admin@ovec.go.th";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists!");
            process.exit(0);
        }

        await User.create({
            name: "Admin OVEC",
            email: email,
            password: hashedPassword,
            role: "super_admin",
            isProfileComplete: true,
            profile: {
                phone: "0812345678",
                college: "OVEC HQ",
                position: "System Administrator",
                region: "Central",
                affiliation: "Government",
            }
        });

        console.log("------------------------------");
        console.log("User Created Successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("Role: super_admin");
        console.log("------------------------------");

    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        await mongoose.disconnect();
    }
}

createUser();
