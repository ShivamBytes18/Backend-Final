import {asynchandler} from "../utils/asynchandler.js"

const registerUser = asynchandler(async (req,res)=>{
res.status(400).json({
    message :"Shivam First postmon"
})
})

export {registerUser}