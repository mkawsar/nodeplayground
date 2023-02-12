import mongoose from 'mongoose';
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
        name: String,
        email: String,
        type: String,
        password: String
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

export default mongoose.model('User', userSchema);
