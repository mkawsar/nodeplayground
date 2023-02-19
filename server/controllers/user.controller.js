// utils
import makeValidation from '@withvoid/make-validation';
import UserModel, { USER_TYPE } from '../models/user.js';
import { generateToken } from '../config/jwt.js'

export default {
    onGetAllUsers: async (req, res) => {
        try {
            let users = await UserModel.find().select('-password');
            return res.status(200).json({success: true, data: users})
        } catch (error) {
            return res.status(500).json({success: false, error: error?.message});
        }
    },
    onGetUserById: async (req, res) => {
        try {
            let user = await UserModel.findById(req.params.id).select('-password');
            return res.status(200).json({success: true, data: user})
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    },
    onCreateUser: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    name: {type: types.string},
                    email: {type: types.string},
                    type: {type: types.enum, options: {enum: USER_TYPE}},
                    password: {type: types.string},
                    mobile: {type: types.string}
                }
            }));

            let findUser = await UserModel.findOne({email: req.body.email});

            if (findUser) {
                return res.status(400).json({success: false, message: 'Already registered a user with this email.'})
            }

            if (!validation.success) {
                return res.status(400).json(validation);
            }

            const query = await UserModel.create(req.body);

            let user = await UserModel.findById({_id: query._id}).select('-password');

            return res.status(201).json({success: true, data: user})
        } catch (error) {
            return res.status(500).json({success: false, error: error?.message});
        }
    },
    onDeleteUserById: async (req, res) => {
        try {
            let findUser = await UserModel.findOne({_id: req.params.id});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'Data not found!'})
            }
            let user = await UserModel.deleteOne({_id: req.params.id});
            return res.status(200).json({success: true, message: 'User deleted successfully!'})
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    },

    onUserLogin: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    email: {type: types.string},
                    password: {type: types.string}
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }
            const {email, password} = req.body;

            let findUser = await UserModel.findOne({email: email});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'User not found'})
            }
            if (!await findUser.isPasswordMatched(password)) {
                return res.status(400).json({success: false, message: 'Invalid credentials'})
            }

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
            return res.status(500).json({success: false, error: err?.message});
        }
    },

    onUpdateUserById: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req?.body,
                checks: {
                    name: {type: types.string, options: {empty: false}},
                    type: {type: types.enum, options: {enum: USER_TYPE}},
                    mobile: {type: types.string}
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }

            let findUser = await UserModel.findOne({_id: req.params.id});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'Data not found!'})
            }

            const user = await UserModel.findOneAndUpdate({_id: req?.params?.id}, {
                name: req?.body?.name,
                type: req?.body?.type,
                mobile: req?.body?.mobile
            }, {
                returnOriginal: false
            }).select('-password');
            return res.status(200).json({success: true, message: user});
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    },

    handleMyProfileUpdate: async (req, res) => {
        try {
            const {id} = req?.user;
            const validation = makeValidation(types => ({
                payload: req?.body,
                checks: {
                    name: {type: types.string, options: {empty: false}},
                    type: {type: types.enum, options: {enum: USER_TYPE}},
                    mobile: {type: types.string}
                }
            }));
            if (!validation.success) {
                return res.status(400).json(validation);
            }

            let findUser = await UserModel.findOne({_id: id});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'Data not found!'})
            }

            const user = await UserModel.findOneAndUpdate({_id: id}, {
                name: req?.body?.name,
                type: req?.body?.type,
                mobile: req?.body?.mobile
            }, {
                returnOriginal: false
            });
            return res.status(200).json({success: true, message: user});
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    },

    handleBlockUser: async (req, res) => {
        try {
            let findUser = await UserModel.findOne({_id: req?.params?.id});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'Data not found!'})
            }

            const user = await UserModel.findOneAndUpdate({_id: req?.params?.id}, {
                isBlocked: true
            }, {
                returnOriginal: false
            });
            return res.status(200).json({success: true, message: user});
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    },
    handleUnblockUser: async (req, res) => {
        try {
            let findUser = await UserModel.findOne({_id: req?.params?.id});

            if (!findUser) {
                return res.status(404).json({success: false, message: 'Data not found!'})
            }

            const user = await UserModel.findOneAndUpdate({_id: req?.params?.id}, {
                isBlocked: false
            }, {
                returnOriginal: false
            });
            return res.status(200).json({success: true, message: user});
        } catch (err) {
            return res.status(500).json({success: false, error: err?.message});
        }
    }
}
