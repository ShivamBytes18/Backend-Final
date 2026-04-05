import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { response } from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessandRefereshTokens = async(userId) =>{
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       
       user.refreshToken = refreshToken
       await user.save({ValiditeBeforeSave : false})
       return {accessToken,refreshToken}

    } catch (error) {
         console.log("ACTUAL ERROR 👉", error); 
        throw new ApiError(500 , "Something went Wrong while generating refresh and access token")
    }
}

const registerUser = asynchandler(async (req,res)=>{

const {fullName,email,username,password}=req.body
// console.log("fullName",fullName);
// console.log("Email",email);
// console.log("Password",password);

if(   
    [fullName,email,username,password].some((field)=>
    field?.trim() === "")
){
    throw new ApiError(400,"All Fields are required")
}
   const existedUser = await User.findOne({
 $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with email or username already exist")
}
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

   /*let coverImageLocalPath
  if(req.files && Array.
    isArray(req.files.coverImage) && req.
    files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
  //console.log(req.files)*/
if(! avatarLocalPath)
{
    throw new ApiError(400,"Avatar file is required")
}
 
 const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar){

     throw new ApiError(400,"Avatar file is required")
  }
 const user =await  User.create({
    fullName,
    avatar :avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
  )
if(!createdUser)
{
   
    throw new ApiError(505,"Something went Wrong while Regestering the User")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registred Successfully")
)
})


const loginUser = asynchandler(async (req,res)=>{
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refress token 
    // send cookies 

    const {email , username, password} = req.body
    if(!username && !email){
        throw new ApiError(400 , "username or password is required")
    }
  const user= await User.findOne({
        $or:[{username},{email}]
    }).select("+password")
    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }
  const isPasswordValid=  await user.isPasswordCorrect(password)
  if(!isPasswordValid){
        throw new ApiError(401,"Invalid User credentials")
    }
   
    const {accessToken,refreshToken}=await
    generateAccessandRefereshTokens(user._id)


   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken")

   const options = {
     httpOnly:true,
     secure:false,
     sameSite:"lax"
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,
        {
          user:loggedInUser,accessToken,refreshToken
        },  
        "User Logged in SuccessFully"
    )
   )
})

const logoutUser = asynchandler(async(req,res) =>{
  await User.findByIdAndUpdate(req.user._id
    ,{
      $unset:{ refreshToken :1}
 
    }  
  )
   const options = {
     httpOnly:true,
     secure:false
   }
   return res 
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User Logout Successfully"))
})

const refreshAccessToken = asynchandler(async(req,res)=>{
   const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken){
    throw new ApiError(401,"unauthorised Request")
  }
  try {
    const decodedToken= jwt.verify(
    incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const user =await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401 ,"invalid Refresh Token")
    }
      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is Expired or Used")
      }

      const options ={
        httpOnly:true,
        secure:true
      }
   const {accessToken,refreshToken:newrefreshToken} = await generateAccessandRefereshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,refreshToken:newrefreshToken
        },
        "Access Token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message ||
     "Invalid refresh Token")
  }
  })

const changeCurrentPassword = asynchandler(async(req,res)=>{
    const {oldPassword , newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) 
    if(!isPasswordCorrect)
    {
      throw new ApiError(400,"Invalid old password")
    }
    user.password = newPassword
    await user.save({ValiditeBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
  })

// const getCurrentUser = asynchandler(async(req,res)=>{
//   return res 
//   .status(200)
//   .json(200,req.user,"current user Fetched successfully")
// })  
const getCurrentUser = asynchandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  );
});

const updateAccountDetails = asynchandler(async(req,res)=>{
  const {fullName,email} = req.body
  if(!fullName || !email)
  {
    throw new ApiError(400, "All fields are Required")
  }

 const user = await  User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new :true}
  ).select("-password")

  return res 
  .status(200)
  .json(new ApiResponse(200,user,"Account details uploaded successfully"))
})

const updateUserAvatar = asynchandler(async(req,res) =>{
 const avatarLocalPath= req.file?.path
 if(!avatarLocalPath)
 {
  throw new ApiError(400,"Avatar file is Misssing")
 }
 const avatar=await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url){
  throw new ApiError(400,"Error while uploading Avatar")
 }
 const user =await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      avatar:avatar.url
    }
  },
  {new:true}
 ).select("-password")
 return res
.status(200)
.json(
  new ApiResponse(200,user,"Avatar updated Successfully")
)
})

const updateUsercoverImage= asynchandler(async(req,res)=>{
const coverKeyLocalImage= req.file?.path
 if(!coverKeyLocalImage)
 {
  throw new ApiError(400,"coverImage file is Misssing")
 }
 const coverImage = await uploadOnCloudinary(coverKeyLocalImage)
 if(!coverImage.url)
 {
  throw new ApiError(400,"Error while uploading coverImage")
 }
 const user = await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      coverImage:coverImage.url
    }
  },
  {new:true}
).select("-password")
return res
.status(200)
.json(
  new ApiResponse(200,user,"Cover Image updated Successfully")
)
})

const getUserChannelprofile = asynchandler(async(req,res)=>{
  const {username}=req.params
  if(!username?.trim()){
    throw new ApiError(400,"username is missing")
  }

 const channel = User.aggregate([
  {
    $match :{
      username:username?.toLowerCase()
    }},
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
       $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size :"$subscribers"
        },
        channelSubscribedToCount:{
           $size :"$subscribedTo"
        },
        isSubscribed:{
          $cond: {
           if : {$in:[req.user?._id,"$subscribers.subscriber"]},
           then :true,
           else:false
          }
        }
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
         subscribersCount:1,
         channelSubscribedToCount:1,
         isSubscribed:1,
         avatar:1,
         coverImage:1,
         email:1
      }
    }
 ])
 if(!channel?.length){
  throw new ApiError(400, "channel does not exists")
 }
 return res.status(200)
 .json(
 new ApiResponse( 200, channel[0],"user channel fetched successfully")
)
})

const getWatchHistory = asynchandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)  
      }
    },
    {
      $lookup:{
        from :"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"videos",
              localField:"watchHistory",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
            {
             $addFields:{
              owner:{
                $first:"$owner"
              }
             } 
          }
        ]
      }
    }
  ])
  return  res 
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,"Watch History fetched Successfully")
  )
})
export { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUsercoverImage,
         getUserChannelprofile,
         getWatchHistory
}