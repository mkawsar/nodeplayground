import * as yup from 'yup';

export const userResetPasswordValidation = yup.object({
    password: yup.string().required().min(6)
}).required();