import * as yup from 'yup';
import {BRANDS, COLORS} from '../enum/product.js';

export const createProductValidation = yup.object({
    title: yup.string().trim().required().min(5).max(100),
    description: yup.string().trim().required().min(5),
    price: yup.number().required(),
    quantity: yup.number().required(),
    color: yup.string().required().oneOf([COLORS.BLACK, COLORS.BROWN, COLORS.GREEN, COLORS.PINK, COLORS.RED, COLORS.WHITE]),
    brand: yup.string().required().oneOf([BRANDS.APPLE, BRANDS.LENOVO, BRANDS.SAMSUNG])

}).required();

export const updateProductValidation = yup.object({
    title: yup.string().trim().required().min(5).max(100),
    description: yup.string().trim().required().min(5),
    price: yup.number().required(),
    quantity: yup.number().required(),
    color: yup.string().required().oneOf([COLORS.BLACK, COLORS.BROWN, COLORS.GREEN, COLORS.PINK, COLORS.RED, COLORS.WHITE]),
    brand: yup.string().required().oneOf([BRANDS.APPLE, BRANDS.LENOVO, BRANDS.SAMSUNG])
}).required();

export const wishlistProductValidator = yup.object({
    product_id: yup.string().trim().required()
}).required();
