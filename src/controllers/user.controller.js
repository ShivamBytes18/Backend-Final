import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { response } from "express"

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

  // let coverImageLocalPath
 /* if(req.files && Array.
    isArray(req.files.coverImage) && req.
    files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }*/ 
  //console.log(req.files)
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

export {registerUser}