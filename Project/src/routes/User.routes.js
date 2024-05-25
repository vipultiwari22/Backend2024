import { Router } from 'express';
import {
    registerUser, login, logOutUser, RefreshaccsessToken,
    changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar,
    updateUserCoverImage
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middelwaare.js';

const router = Router();

router.route('/register').post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser);

router.route('/login').post(login);
router.route('/logout').post(verifyJWT, logOutUser);
router.route('/refresh-token').post(RefreshaccsessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-CoverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
