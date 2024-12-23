import databaseConnection from "../Database/Connection.js";
import authRouter from "./modules/auth/Auth.Router.js";
import userRouter from "./modules/user/User.Router.js";
import globalErrorHandlong from "./utils/GlobalErrorHadnling.js";
import messageRouter from "./modules/message/Message.Router.js"; 
import dotenv from "dotenv";
import cors from "cors";

const boostrap = (app,express)=>{
    app.use(cors());
    dotenv.config();
    app.use("/uploads",express.static("uploads"));
    app.use(express.json());
    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/message",messageRouter);
    databaseConnection();
    app.use(globalErrorHandlong);   //Error Handling Middleware
    app.use("*",(req,res,next)=>{
        return res.json({message:"In-Valid Routing"});
    });
}

export default boostrap;