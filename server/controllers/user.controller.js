// utils
import makeValidation from '@withvoid/make-validation';
import UserModel, { USER_TYPE } from '../models/user.js';

export default {
    onGetAllUsers: async (req, res) => { },
    onGetUserById: async (req, res) => { },
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

            const user = await UserModel.create(req.body);

            return res.status(200).json({ success: true, message: user })
        } catch (error) {
            return res.status(500).json({ success: false, error: error?.message });
        }
    },
    onDereleteUserById: async (req, res) => { },
}