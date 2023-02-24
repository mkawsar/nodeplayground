import mongoose from 'mongoose';


export const validateMongodbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        // return res.status(400).json({success: false, error: 'This id is not valid or not found'});
        throw new Error('This id is not valid or not found');
    }
};
