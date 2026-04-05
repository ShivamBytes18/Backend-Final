// import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"
// import userRouter from './routes/user.routes.js'

// const app = express ()
// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// }))
// app.use(express.json({limit:"15kb"}))
// app.use(express.urlencoded({extended:true,limit:
//     "16kb"}))
// app.use(express.static("public"))
// app.use(cookieParser())




// // routes


// console.log("Registering user routes...")
// app.use("/api/v1/users", userRouter)

// //app.use("/api/v1/users",userRouter)


// // http://localhost:8000/api/v1/users/register


// export { app }


import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js";

const app = express()

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter);
// example:
// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/videos/

export { app }