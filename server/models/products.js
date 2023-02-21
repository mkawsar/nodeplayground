import mongoose from 'mongoose';

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
            type: Number,
            required: true
        },
        images: {
            type: Array
        },
        color: {
            type: String,
            required: true
        },
        ratings: [{
            star: Number,
            postedby: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
        }],
        brand: {
            type: String,
            required: true
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