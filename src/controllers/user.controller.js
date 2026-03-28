import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"


const registerUser = asynchandler(async (req,res)=>{

const {fullName,email,username,password}=req.body
console.log("fullName",fullName);
console.log("Email",email);
console.log("Password",password);

if(
    [fullName,email,username,password].some((field)=>
    field?.trim() === "")
){
    throw new ApiError(400,"All Fields are required")
}
   const existedUser = User.findOne({
 $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with email or username already exist")
}
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
})

export {registerUser}