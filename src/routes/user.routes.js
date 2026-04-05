// import { Router } from "express";
// import { loginUser,
//    logoutUser,
//     registerUser ,
//     refreshAccessToken,
//      changeCurrentPassword, 
//      getCurrentUser,
//       updateAccountDetails, 
//       updateUserAvatar, 
//       updateUsercoverImage,
//        getUserChannelprofile,
//         getWatchHistory} from "../controllers/user.controller.js";
// import {upload} from "../middlewares/multer.middleware.js"
// import {verifyJWT} from "../middlewares/auth.middleware.js"
// const router = Router()

// router.route("/register").post(
//     upload.fields([
//         {
//           name:"avatar",
//           maxCount:1  
//         },
//         {
//           name:"coverImage",
//           maxCount:1  
//         }
//     ])
//     ,registerUser)

// router.route("/login").post(loginUser)   

// // secured routes

// router.route("/logout").post(verifyJWT,logoutUser)
// router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT,changeCurrentPassword)
// router.route("/current-users").post(verifyJWT,getCurrentUser,
// router.route("/update-account").patch(verifyJWT,updateAccountDetails),
// router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar),
// router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUsercoverImage),
// router.route("/c/:username").get(verifyJWT,getUserChannelprofile),
// router.route("/history").get(verifyJWT,getWatchHistory)
// )
// export default router


import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
  getUserChannelprofile,
  getWatchHistory
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.route("/cover-image").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUsercoverImage
);

router.route("/c/:username").get(
  verifyJWT,
  getUserChannelprofile
);

router.route("/history").get(
  verifyJWT,
  getWatchHistory
);

export default router;