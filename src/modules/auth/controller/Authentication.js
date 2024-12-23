import userModel from "../../../../Database/models/User.Model.js";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
import AppError from "../../../utils/AppError.js";
import catchError from "../../../utils/ErrorHandling.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../email/SendEmail.js";
import { htmlCode } from "../../../email/HTMLConfirmEmail.js";
import {OAuth2Client} from 'google-auth-library';
import { customAlphabet } from "nanoid";

export const signup = catchError(async(req,res,next)=>{
    
    const cehckUser = await userModel.findOne({email:req.body.email});
    
    if (cehckUser) {
        return next(new AppError("Email already exits",409));
    }

    const ciphertextPhone = CryptoJS.AES.encrypt(req.body.phone, process.env.SECRET_KEY).toString();
    
    req.body.phone = ciphertextPhone;

    const user = await userModel.create(req.body);
    
    const userToken = jwt.sign(
        {userName:user.userName , id:user._id},
        process.env.TOKEN_SIGNATURE, {expiresIn:'1d'}
    );

    sendEmail({email:req.body.email ,userToken , subject:"Confirmation Email" , htmlCode});

    return user ? res.status(201).json({message:"Done",user , userToken}) : res.json({message:"No users added",user});
   
});

export const login = catchError(async(req,res,next)=>{

    const loggedInUser = await userModel.findOne({email:req.body.email});

    if (!loggedInUser || !bcrypt.compareSync(req.body.password , loggedInUser.password)) 
        return next(new AppError("In-Valid Email or Password"));
    
    
    const token = jwt.sign(
        {userName:loggedInUser.userName , id:loggedInUser._id},
        process.env.TOKEN_SIGNATURE, {expiresIn:'1d'}
    );

    return res.status(200).json({message:"Done",token});

});

export const signupgmail = catchError(async(req,res,next)=>{

    const {idToken} = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    async function verify() {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();
    return payload;

}
    const {email , email_verified , name , given_name , family_name , picture} = await verify();
    if (email_verified) {
        
        const user = await userModel.findOne({email:email});
        if (user) {
            //Login
            if (user.provider != 'GOOGLE') {
                return next(new AppError(`In-Valid User Provider the provider is ${user.provider}`),400);
            }

        const token = jwt.sign(
            {userName:user.userName , id:user._id},
            process.env.TOKEN_SIGNATURE, {expiresIn:'1d'}
        );
    
        return res.status(200).json({message:"Done",token});
    }

    //SIGNUP
    const customPassword = customAlphabet('0123456789asgfdsgefhewhefdsfnkjnwdngwm',9);
    
    const addUser = await userModel.create({firstName:given_name , lastName:family_name,userName:name,password:customPassword,
        email:email , confirmEmail:true , provider:'GOOGLE'
    ,profileImage:{secure_url:picture} });
    
    const userToken = jwt.sign(
        {userName:addUser.userName , id:addUser._id},
        process.env.TOKEN_SIGNATURE, {expiresIn:'1d'}
    );

    return addUser ? res.status(201).json({message:"Done",addUser,userToken}) : res.json({message:"No users added",addUser});

}
    return next(new AppError("In-Valid Gmail account",403));
    // return res.status(201).json({message:"Done",payload});
});





export const confirmEmail = catchError(async(req,res,next)=>{

    const {userToken} = req.params;

    const decodedToken = jwt.verify(userToken,process.env.TOKEN_SIGNATURE);
    
    if(!decodedToken?.id)
    {
        return next(new AppError("In-Valid token payload",400));
    }

    const user = await userModel.findByIdAndUpdate({_id:decodedToken.id},{confirmEmail:true});

    return user ? res.json({message:"Email confirmed"}) : res.json({message:"Not Confirmed"});

});

