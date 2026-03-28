//require('dotenv').config({path:'./env'})
//import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js"
dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is Running at port :${process.env.PORT}`);        
    })
      app.on("error",(error)=>{
      console.log("Not Connected to Database");
      throw error
        }) 
})
.catch((error)=>{
    console.log("MONGODB1 connection failed !!",error);    
})









// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import connectDB from "./db";

// import express from "express"
// const app = express()

// ;(async ()=>{
//     try {
//        await  mongoose.connect(`${process.env.MONGODB_URI}/$
//         {DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Not Connected to Database");
//             throw error
//         })   

//         app.listen(process.env.PORT, () =>{
//             console.log(`App is listening on port ${process.env.PORT}`);
            
//         })
//     } catch (error) {
//     console.log("ERROR:",error);
            
//     }
// })()
