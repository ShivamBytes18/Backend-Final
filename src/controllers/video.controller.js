
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";


// 🔥 UPLOAD VIDEO
const uploadVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((f) => f?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "Upload failed");
  }

  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(200, createdVideo, "Video uploaded successfully")
  );
});


// 🔥 YOUTUBE-LIKE FEED (RANDOM + SEARCH)
const getAllVideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query } = req.query;

  const pipeline = [
    {
      $match: {
        isPublished: true,
        ...(query && { $text: { $search: query } })
      }
    },

    // 🎲 RANDOM VIDEOS
    { $sample: { size: 50 } },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },

    {
      $addFields: {
        owner: { $first: "$owner" }
      }
    }
  ];

  const videos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  );

  return res.status(200).json(
    new ApiResponse(200, videos, "Feed fetched successfully")
  );
});


// 🔥 GET SINGLE VIDEO + RELATED
const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" }
      }
    }
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video not found");
  }

  // 👁️ increment views
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 }
  });

  // 🎯 RELATED VIDEOS
  const relatedVideos = await Video.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(videoId) },
        isPublished: true
      }
    },
    { $sample: { size: 10 } }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        video: video[0],
        relatedVideos
      },
      "Video fetched successfully"
    )
  );
});


// 🔥 UPDATE VIDEO
const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { title, description } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedVideo, "Video updated")
  );
});


// 🔥 DELETE VIDEO
const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await video.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, {}, "Video deleted")
  );
});


// 🔥 TOGGLE PUBLISH
const togglePublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found");

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(
    new ApiResponse(200, video, "Publish status updated")
  );
});


// 🔥 WATCH HISTORY (LATEST FIRST)
const addToWatchHistory = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchHistory: videoId }
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      watchHistory: {
        $each: [videoId],
        $position: 0
      }
    }
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "History updated")
  );
});


// ❤️ LIKE SYSTEM
// const toggleLike = asynchandler(async (req, res) => {
//   const { videoId } = req.params;

//   const existing = await Like.findOne({
//     video: videoId,
//     likedBy: req.user._id
//   });

//   if (existing) {
//     await existing.deleteOne();
//     return res.json(
//       new ApiResponse(200, { liked: false }, "Unliked")
//     );
//   }

//   await Like.create({
//     video: videoId,
//     likedBy: req.user._id
//   });

//   return res.json(
//     new ApiResponse(200, { liked: true }, "Liked")
//   );
// });
const toggleLike = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  const existing = await Like.findOne({
    video: videoId,
    likedBy: req.user._id
  });

  if (existing) {
    await existing.deleteOne();
    return res.json(
      new ApiResponse(200, { liked: false }, "Unliked")
    );
  }

  try {
    await Like.create({
      video: videoId,
      likedBy: req.user._id
    });

    return res.json(
      new ApiResponse(200, { liked: true }, "Liked")
    );
  } catch (err) {
    // 🔥 HANDLE DUPLICATE ERROR
    if (err.code === 11000) {
      return res.json(
        new ApiResponse(200, { liked: true }, "Already liked")
      );
    }
    throw err;
  }
});

 const getMyVideos = asynchandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, videos, "My videos fetched")
  );
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  addToWatchHistory,
  toggleLike,
  getMyVideos
};