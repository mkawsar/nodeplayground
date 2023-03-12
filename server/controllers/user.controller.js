// utils
import jwt from 'jsonwebtoken';
import { config as envconfig } from 'dotenv';
import makeValidation from '@withvoid/make-validation';
import UserModel, { USER_TYPE } from '../models/user.js';
import { validateMongodbId } from '../utils/validateMongodbId.js';
import { generateToken, generateRefreshToken } from '../config/jwt.js'
import { userResetPasswordValidation } from '../validators/user.validator.js';

envconfig();

export default {
    onGetAllUsers: async (req, res) => {
        try {
            let users = await UserModel.find().select('-password').sort({ 'createdAt': -1 });
            return res.status(200).json({ success: true, data: users })
        } catch (error) {
            return res.status(500).json({ success: false, error: error?.message });
        }
    },

    onGetUserById: async (req, res) => {
        try {
            validateMongodbId(req.params.id);
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
                    password: { type: types.string },
                    mobile: { type: types.string }
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

    onDeleteUserById: async (req, res) => {
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

    onUserLogin: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    email: { type: types.string },
                    password: { type: types.string }
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }
            const { email, password } = req.body;

            let findUser = await UserModel.findOne({ email: email });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'User not found' })
            }
            if (!await findUser.isPasswordMatched(password)) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' })
            }

            const refreshToken = generateRefreshToken(findUser?._id);
            const updateUser = await UserModel.findByIdAndUpdate(findUser?._id, {
                refreshToken: refreshToken,
            }, {
                new: true
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                success: true,
                data: {
                    _id: findUser?.id,
                    name: findUser?.name,
                    email: findUser?.email,
                    mobile: findUser?.mobile,
                    _token: generateToken(findUser?._id)
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    onUpdateUserById: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req?.body,
                checks: {
                    name: { type: types.string, options: { empty: false } },
                    type: { type: types.enum, options: { enum: USER_TYPE } },
                    mobile: { type: types.string }
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }

            let findUser = await UserModel.findOne({ _id: req.params.id });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }

            const user = await UserModel.findOneAndUpdate({ _id: req?.params?.id }, {
                name: req?.body?.name,
                type: req?.body?.type,
                mobile: req?.body?.mobile
            }, {
                returnOriginal: false
            }).select('-password');
            return res.status(200).json({ success: true, message: user });
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    handleMyProfileUpdate: async (req, res) => {
        try {
            const { id } = req?.user;
            const validation = makeValidation(types => ({
                payload: req?.body,
                checks: {
                    name: { type: types.string, options: { empty: false } },
                    type: { type: types.enum, options: { enum: USER_TYPE } },
                    mobile: { type: types.string }
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }

            let findUser = await UserModel.findOne({ _id: id });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }

            const user = await UserModel.findOneAndUpdate({ _id: id }, {
                name: req?.body?.name,
                type: req?.body?.type,
                mobile: req?.body?.mobile
            }, {
                returnOriginal: false
            });
            return res.status(200).json({ success: true, message: user });
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    handleBlockedUser: async (req, res) => {
        try {
            const { id } = req?.user;
            if (id === req?.params?.id) {
                return res.status(400).json({ success: false, message: 'You are currently currently logged in.' });
            }
            let findUser = await UserModel.findOne({ _id: req?.params?.id });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }

            const user = await UserModel.findOneAndUpdate({ _id: req?.params?.id }, {
                isBlocked: true
            }, {
                returnOriginal: false
            });
            return res.status(200).json({ success: true, message: user });
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    handleUnblockUser: async (req, res) => {
        try {
            let findUser = await UserModel.findOne({ _id: req?.params?.id });

            if (!findUser) {
                return res.status(404).json({ success: false, message: 'Data not found!' })
            }

            const user = await UserModel.findOneAndUpdate({ _id: req?.params?.id }, {
                isBlocked: false
            }, {
                returnOriginal: false
            });
            return res.status(200).json({ success: true, message: user });
        } catch (err) {
            return res.status(500).json({ success: false, error: err?.message });
        }
    },

    handleRefreshToken: async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) {
            return res.status(404).json({ success: false, message: 'No refresh token in cookies' });
        }

        const refreshToken = cookie?.refreshToken;
        const user = await UserModel.findOne({ refreshToken });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No refresh token present in database or not matched' });
        }
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user?.id !== decoded.id) {
                return res.status(404).json({ success: false, message: 'There is something wrong with refresh token' });
            }
            const accessToken = generateToken(user?.id);
            return res.status(200).json({ success: false, message: 'Generated new access token', 'token': accessToken });
        });
    },

    handleLogout: async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) {
            return res.status(404).json({ success: false, message: 'No refresh token in cookies' });
        }
        const refreshToken = cookie?.refreshToken;
        const user = await UserModel.findOne({ refreshToken });
        if (!user) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true
            });
            return res.status(404).json({ success: false, message: 'No refresh token present in database or not matched' });
        }

        await UserModel.findOneAndUpdate({ refreshToken }, {
            refreshToken: ''
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        });

        return res.status(200).json({ success: false, message: 'Successfully logout' });
    },

    handlePasswordReset: async (req, res) => {
        try {
            const { _id } = req?.user?._id;
            const { body } = req;

            userResetPasswordValidation.validateSync(body, { abortEarly: false, stripUnknown: true });

            let checkID = validateMongodbId(_id);

            if (!checkID) {
                return res.status(404).json({ success: false, error: 'This id is not valid or not found' });
            }

            const user = await UserModel.findById(_id);
            if (req?.body?.password) {
                user.password = req?.body?.password;
                const updatePassword = await user.save();
                return res.status(200).json({ success: true, data: updatePassword });
            }

        } catch (err) {
            if (!err?.errors) {
                return res.status(500).json({ success: false, error: err?.message });
            } else {
                return res.status(428).json({ success: false, error: err?.errors });
            }
        }
    },
}
