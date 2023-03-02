import slugify from 'slugify';
import Product from '../models/products.js';
import { validateMongodbId } from '../utils/validateMongodbId.js';
import {createProductValidation, updateProductValidation} from '../validators/product.validator.js';

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

    handleAddProductWishList: async (req, res) => {
        const {_id} = req?.user;
        const {productID} = req?.body;

        return res.status(200).json({success: true, message: 'Product add to wish list'});
    },
};