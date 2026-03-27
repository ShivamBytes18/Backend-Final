// const asynchandler = (requestHandler) =>{
//    return (req,res,next)=>
//     {
//         Promise.resolve(requestHandler(req,res)).
//         catch((err) => next(err))
//     }
// }
// export {asynchandler}
   










// // const asynchandler = ()=>{}
// // const asynchandler = (func) =>{() => {}}

// // const asynchandler = (fn)=> async (req,res,next)=>{
// //     try {
// //         await fn(req,res,next)
// //     } catch (error) {
// //         res.status(error.code || 500).json(
// //             {
// //                 success : false,
// //                 message : error.message
// //             }
// //         )
// //     }
// // }

const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export { asynchandler }