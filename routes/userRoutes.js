import express from 'express'
import User from '../models/User.js'
import { registerUser,loginUser,getUser,logoutUser} from '../controls/usercontrols.js';
import { body } from 'express-validator';
import { authUser } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/register',[
body('email').isEmail().withMessage('Invalid Email'),
body('firstName').isLength({min:3}).withMessage('First Name must be more than 3 characters'),
 body('password').isLength({min:6}).withMessage('Password must be more than 6 letters')
],registerUser);

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage('Password must be more than 6 letters')
],loginUser);

router.get('/getUser',authUser,getUser);

router.post('/logout',authUser,logoutUser);
export default router;