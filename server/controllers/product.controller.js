import slugify from 'slugify';
import Product from '../models/products.js';
import {createProductValidation} from '../validators/product.validator.js';

export default {
    handleGetAllProduct: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            let products = await Product.find().skip((page - 1) * limit).limit(limit * 1).sort({ createdAt: '-1' }).exec();
            const count = await Product.countDocuments();
            return res.status(200).json({success: true, message: 'Get all products', data: products, totalPages: Math.ceil(count / limit), currentPage: page});
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