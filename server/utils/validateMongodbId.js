import mongoose from 'mongoose';


export const validateMongodbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        return false;
    }
    return true;
};
