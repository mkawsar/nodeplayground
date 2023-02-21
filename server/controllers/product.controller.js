import slugify from 'slugify';
import Product from '../models/products.js';
import {createProductValidation} from '../validators/product.validator.js';

export default {
    handleGetAllProduct: async (req, res) => {
        try {
            let products = await Product.find().sort({ createdAt: '-1' });
            return res.status(200).json({success: true, message: 'Get all products', data: products});
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