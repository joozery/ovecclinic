import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IManual extends Document {
    title: string;
    description: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const manualSchema = new Schema<IManual>(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        imageUrl: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Manual: Model<IManual> =
    mongoose.models.Manual || mongoose.model<IManual>('Manual', manualSchema);

export default Manual;
