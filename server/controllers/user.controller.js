// utils
import makeValidation from '@withvoid/make-validation';
import UserModel, { USER_TYPE } from '../models/user.js';

export default {
    onGetAllUsers: async (req, res) => {
        try {
            let users = await UserModel.find().select('-password');
            return res.status(200).json({ success: true, data: users })
        } catch (error) {
            return res.status(500).json({ success: false, error: error?.message });
        }
    },
    onGetUserById: async (req, res) => {
        try {
            let user = await UserModel.findById(req.params.id).select('-password');
            return res.status(200).json({ success: true, data: user })
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },
    onCreateUser: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    name: { type: types.string },
                    email: { type: types.string },
                    type: { type: types.enum, options: { enum: USER_TYPE } },
                    password: { type: types.string }
                }
            }));

            let findUser = await UserModel.findOne({ email: req.body.email });

            if (findUser) {
                return res.status(400).json({ success: false, message: 'Already registered a user with this email.' })
            }

            if (!validation.success) {
                return res.status(400).json(validation);
            }

            const query = await UserModel.create(req.body);

            let user = await UserModel.findById({ _id: query._id }).select('-password');

            return res.status(201).json({ success: true, data: user })
        } catch (error) {
            return res.status(500).json({ success: false, error: error?.message });
        }
    },
    onDereleteUserById: async (req, res) => {
        try {
            let findUser = await UserModel.findOne({ _id: req.params.id });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }
            let user = await UserModel.deleteOne({ _id: req.params.id });
            return res.status(200).json({ success: true, message: 'User deleted successfully!' })
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },
}