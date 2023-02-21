import mongoose from 'mongoose';

export const PRODUCT_TYPE = {
    CONSUMER: 'consumer',
    SUPPORT: 'support'
};

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        },
        quantity: {
            type: Number
        },
        images: {
            type: Array
        },
        color: {
            type: String,
            enum: ['black', 'brown', 'red']
        },
        ratings: [{
            star: Number,
            postedby: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
        }],
        brand: {
            type: String,
            enum: ['apple', 'samsung', 'lenovo']
        },
        sold: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }, {
        timestamps: true
    }
);

export default mongoose.model('products', productSchema);