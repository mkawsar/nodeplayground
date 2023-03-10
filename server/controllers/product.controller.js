import slugify from 'slugify';
import User from '../models/user.js';
import Product from '../models/products.js';
import { validateMongodbId } from '../utils/validateMongodbId.js';
import {createProductValidation, updateProductValidation, wishlistProductValidator} from '../validators/product.validator.js';

export default {
    handleGetAllProduct: async (req, res) => {
        try {
            // Filtering
            const queryObj = { ...req.query };
            const excludeFields = ['page', 'limit', 'sort', 'fields'];
            excludeFields.forEach(el => delete queryObj[el]);
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

            let query = Product.find(JSON.parse(queryStr));
            if (req.query.sort) {
                const sortBy = req.query.sort.split(',').join(' ');
                query = query.sort(sortBy);
            } else {
                query = query.sort('-createdAt');
            }

            // Limiting
            if (req.query.fields) {
                const fields = req.query.fields.split(',').join(' ');
                query = query.select(fields);
            } else {
                query = query.select('-__v');
            }

            // Pagination
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
            const ProductCount = await Product.countDocuments();

            if (req.query.page) {
                if (skip > ProductCount) {
                    return res.status(404).json({ success: false, error: 'This page does not exists.' });
                }
            }
            const product = await query.populate({path: 'createdBy', select: 'name _id'}).populate({path: 'updatedBy', select: 'name _id'});

            return res.status(200).json({success: true, message: 'Get all products', data: product, pages: Math.ceil(ProductCount / limit), current: page});
    
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    handleCreateProduct: async (req, res) => {
        try {
            const {id} = req?.user;
            const {body} = req;
            const data = createProductValidation.validateSync(body, {abortEarly: false, stripUnknown: true});
            if (req.body.title) {
                req.body.slug = slugify(req.body.title.toLowerCase());
            }

            req.body.createdBy = id;
            req.body.updatedBy = id;

            const product = await Product.create(data);
            return res.status(201).json({success: true, message: product});
        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },

    handleGetProductDetails: async (req, res) => {
        const {id} = req.params;
        let checkID = validateMongodbId(id);

        if (!checkID) {
            return res.status(404).json({ success: false, error: 'This id is not valid or not found' });
        }

        try {
            const product = await Product.findById(id).populate({path: 'createdBy', select: 'name _id'}).populate({path: 'updatedBy', select: 'name _id'}).select('-__v');
            return res.status(200).json({success: true, data: product});
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.errors });
        }
    },

    handleUpdateProduct: async (req, res) => {
        const {id} = req.params;
        let checkID = validateMongodbId(id);

        if (!checkID) {
            return res.status(404).json({ success: false, error: 'This id is not valid or not found' });
        }

        try {
            const userID = req?.user?._id;
            const {body} = req;

            updateProductValidation.validateSync(body, {abortEarly: false, stripUnknown: true});

            if (req.body.title) {
                req.body.slug = slugify(req.body.title.toLowerCase());
            }
            req.body.updatedBy = userID;

            const product = await Product.findOneAndUpdate({_id: id}, req?.body, {returnOriginal: false});

            return res.status(200).json({success: true, message: product});
        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },

    handleDeleteProduct: async (req, res) => {
        const {id} = req.params;

        let checkID = validateMongodbId(id);

        if (!checkID) {
            return res.status(404).json({ success: false, error: 'This id is not valid or not found' });
        }

        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }

            const deletedProduct = await Product.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
                data: deletedProduct
            });
        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },

    handleAddProductWishlist: async (req, res) => {
        try {
            const userID = req?.user?._id;
            const {body} = req;

            wishlistProductValidator.validateSync(body, {abortEarly: false, stripUnknown: true});
            const checkID = validateMongodbId(body?.product_id);
            if (!checkID) {
                return res.status(404).json({ success: false, error: 'This id is not valid or not found' });
            }

            const user = await User.findById(userID);
            const alreadyAdded = user.wishlist.find((id) => id.toString() === body?.product_id);
            if (alreadyAdded) {
                let user = await User.findByIdAndUpdate(userID, {
                    $pull: {wishlist: body?.product_id},
                }, {
                    new: true
                });
                return res.status(201).json({success: true, data: user});
            } else {
                return res.status(200).json({success: true, message: 'Already added this product on your wishlist.'});
            }
        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },

    handleProductRating: async (req, res) => {
        const userID = req?.user?._id;
        try {
            const {star, productID, comment} = req?.body;

            const product = await Product.findById(productID);
            let existsProductRated = product.ratings.find((userID) => userID.postedby.toString() === userID.toString());
            if (existsProductRated) {
                const updateRating = await Product.updateOne(
                    {ratings: { $elemMatch: existsProductRated }},
                    { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
                    { new: true }
                );
            } else {
                const rateProduct = await Product.findByIdAndUpdate(productID,
                    {
                        $push: {
                            ratings: { star: star, comment: comment, postedby: userID }
                        }
                    },
                    {
                        new: true
                    }
                );
            }

            const getAllRatings = await Product.findById(productID);
        
            let totalRating = getAllRatings.ratings.length;
            let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
            let actualRating = Math.round(ratingSum / totalRating);
            let finalProduct = await Product.findByIdAndUpdate(productID,
                {total_rating: actualRating},
                {new: true}
            );
            return res.status(200).json({success: true, message: 'Added rating successfully this product', data: finalProduct});
        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },
};