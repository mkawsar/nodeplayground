import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


export const USER_TYPE = {
    CONSUMER: 'consumer',
    SUPPORT: 'support'
};

const userSchema = new mongoose.Schema(
    {
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
            max: 255,
            unique: true
        },
        type: String,
        password: {
            type: String,
            required: true,
            min: 6,
            max: 1024
        },
        mobile: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            default: 'user'
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        cart: {
            type: Array,
            default: []
        },
        address: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        return next(error);
    }
});


userSchema.methods.isPasswordMatched = async function (enterPassword) {
    // console.log(await bcrypt.compare(enterPassword, this.password));
    return await bcrypt.compare(enterPassword, this.password);
};

export default mongoose.model('users', userSchema);
