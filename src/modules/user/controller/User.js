import userModel from "../../../../Database/models/User.Model.js"
import catchError from "../../../utils/ErrorHandling.js";
import { sendEmail } from "../../../email/SendEmail.js";
import { htmlCode } from "../../../email/HTMLConfirmEmail.js";
import AppError from "../../../utils/AppError.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../../utils/cloudinary.js";
import CryptoJS from "crypto-js";

const  checkUserRole = (role,userId,req,next)=> {
    
    if (role != "admin")  {
        return next(new AppError("UnAuthorized to delete user",403));
    }

    if (req.body?.userId) {
        userId = req.body.userId;
    }
    else if(req.params?.userId){
        userId = req.params.userId;
    }

    const checkObj = {
        userId:userId, role:role
    }

    return checkObj;

}


export const getAllUsers = catchError(async(req,res,next)=>{
    if (req.query.id) {
        const user = await userModel.findById(req.query.id);
        return user ? res.json({message:"Done",user}) : res.json({message:"In-Valid ID",user});
    }

    const allUsers = await userModel.find();

    return allUsers.length ? res.status(200).json({message:"Done",allUsers}) : res.json({message:"No users",allUsers});

});


export const updateUser = catchError(async(req,res,next)=>{

    if (req.body?.phone) {
        const ciphertextPhone = CryptoJS.AES.encrypt(req.body.phone, process.env.SECRET_KEY).toString();
        req.body.phone = ciphertextPhone; 
    }

    const updatedUser = await userModel.findByIdAndUpdate({_id:req.user._id},req.body,{new:true});

    if (req.body?.email) {
        sendEmail({email:req.body.email ,userToken:req.token , subject:"Confirmation Email" , htmlCode});
    }

    return updatedUser ? res.json({message:"Done",updatedUser}) : res.json({message:"Not Updated"});
    
});


export const deleteUser = catchError(async(req,res,next)=>{

    // const checkObj = checkUserRole(req.user.role,req.body.userId,req,next);
    const checkObj = checkUserRole(req.user.role,req.body.userId,req,next);
    const user = await userModel.findByIdAndDelete({_id:checkObj.userId});

    return user ? res.json({message:"Done",user}) : res.json({message:"Not Deleted"});

});

export const changeUserPassword = catchError(async(req,res,next)=>{

    const hashPasword = bcrypt.hashSync(req.body.password,parseInt(process.env.SALT_ROUND));

    const updatedUser = await userModel.findByIdAndUpdate({_id:req.user.id},{password:hashPasword},{new:true});

    return updatedUser ? res.json({message:"Done",updatedUser}) : res.json({message:"Password is not updated"});

});

export const uploadProfileImage = catchError(async(req,res,next)=>{

    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {folder:`C40Saraha/user/${req.user.id}/profile`});
    const user = await userModel.findByIdAndUpdate({_id:req.user.id},
        {profileImage:{secure_url , public_id}}
        ,{new:true});

    return res.json({message:"Done",user});

});


export const coverImages = catchError(async(req,res,next)=>{

    const images=[];
    const coverImagesPath = `C40Saraha/user/${req.user.id}/cover`;
    
    for (const file of req.files) {
        const {secure_url , public_id} = await cloudinary.uploader.upload(file.path, {folder:coverImagesPath});
        images.push({secure_url , public_id});
    }

    const user = await userModel.findByIdAndUpdate({_id:req.user.id},
        {coverImages:images}
        ,{new:true});

    return res.json({message:"Done",user});

});