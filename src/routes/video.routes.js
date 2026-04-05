// // import { Router } from "express"
// // import {
// //   uploadVideo,
// //   getAllVideos,
// //   getVideoById,
// //   updateVideo,
// //   deleteVideo,
// //   togglePublishStatus,
// //   addToWatchHistory
// // } from "../controllers/video.controller.js"

// // import { upload } from "../middlewares/multer.middleware.js"
// // import { verifyJWT } from "../middlewares/auth.middleware.js"

// // const router = Router()

// // // public routes
// // router.route("/").get(getAllVideos)
// // router.route("/:videoId").get(getVideoById)

// // // secured routes
// // router.route("/upload").post(
// //   verifyJWT,
// //   upload.fields([
// //     { name: "videoFile", maxCount: 1 },
// //     { name: "thumbnail", maxCount: 1 }
// //   ]),
// //   uploadVideo
// // )

// // router.route("/:videoId").patch(verifyJWT, updateVideo)
// // router.route("/:videoId").delete(verifyJWT, deleteVideo)

// // router.route("/toggle/publish/:videoId").patch(
// //   verifyJWT,
// //   togglePublishStatus
// // )

// // router.route("/watch/:videoId").post(
// //   verifyJWT,
// //   addToWatchHistory
// // )

// // export default router


// import { Router } from "express";
// import {
//   uploadVideo,
//   getAllVideos,
//   getVideoById,
//   updateVideo,
//   deleteVideo,
//   togglePublishStatus,
//   addToWatchHistory,
//   toggleLike,
//   getMyVideos
// } from "../controllers/video.controller.js";

// import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";

// const router = Router();

// // 🌐 PUBLIC
// router.route("/").get(getAllVideos);
// router.route("/:videoId").get(getVideoById);

// // 🔐 PROTECTED
// router.route("/upload").post(
//   verifyJWT,
//   upload.fields([
//     { name: "videoFile", maxCount: 1 },
//     { name: "thumbnail", maxCount: 1 }
//   ]),
//   uploadVideo
// );

// router.route("/:videoId").patch(verifyJWT, updateVideo);
// router.route("/:videoId").delete(verifyJWT, deleteVideo);

// router.route("/toggle/publish/:videoId").patch(
//   verifyJWT,
//   togglePublishStatus
// );

// // 📜 WATCH HISTORY
// router.route("/watch/:videoId").post(
//   verifyJWT,
//   addToWatchHistory
// );

// // ❤️ LIKE SYSTEM
// router.route("/like/:videoId").post(
//   verifyJWT,
//   toggleLike
// );

// // 🔥 SPECIFIC ROUTES FIRST
// router.get("/my-videos", verifyJWT, getMyVideos);

// // THEN DYNAMIC
// router.route("/:videoId").get(getVideoById);
// router.patch("/:videoId", verifyJWT, updateVideo);
// router.delete("/:videoId", verifyJWT, deleteVideo);

// export default router;

import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  addToWatchHistory,
  toggleLike,
  getMyVideos
} from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// 🌐 PUBLIC ROUTES
router.get("/", getAllVideos);

// 🔥 SPECIFIC ROUTES FIRST (VERY IMPORTANT)
router.get("/my-videos", verifyJWT, getMyVideos);


// 🔐 PROTECTED ROUTES
router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);

router.post("/watch/:videoId", verifyJWT, addToWatchHistory);
router.post("/like/:videoId", verifyJWT, toggleLike);

router.patch("/toggle/publish/:videoId", verifyJWT, togglePublishStatus);


// 🎯 DYNAMIC ROUTES LAST (CRITICAL)
router.get("/:videoId", getVideoById);
router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);


export default router;