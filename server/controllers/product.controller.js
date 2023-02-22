import slugify from 'slugify';
import Product from '../models/products.js';
import {createProductValidation} from '../validators/product.validator.js';

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
            const product = await query;

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
                return res.status(500).json({ success: false, error: err?.errors });
            }
        }
    }
};