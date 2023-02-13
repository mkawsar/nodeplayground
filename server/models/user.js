import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


export const USER_TYPE = {
    CONSUMER: 'consumer',
    SUPPORT: 'support'
};

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4().replace(/\-/g, "")
        },
        name: {
            type: String,
            required: true,
            min: 3,
            max: 255
        },
        email: {
            type: String,
            required: true,
            min: 3,
            max: 255
        },
        type: String,
        password: {
            type: String,
            required: true,
            min: 6,
            max: 1024
        }
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

userSchema.pre('save', async (next) => {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        return next(error);
    }
});

export default mongoose.model('User', userSchema);
