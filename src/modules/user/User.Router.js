import { Router } from "express";
import * as validators from "../../validation/SchemaValidation.js";
import * as userController from "./controller/User.js";
import { auth } from "../auth/controller/Middleware.js";
import { validationMethod } from "../../validation/RequestMethodsValidation.js";
import { uploadFile , validFileExtensions} from "../../utils/multer.cloud.js";

const router = Router();


router.get("/getAllUsers",auth,userController.getAllUsers);
router.put("/updateUser",validationMethod(validators.updateUserSchema),auth,userController.updateUser);
router.delete("/deleteUser",validationMethod(validators.deleteUserSchema),auth,userController.deleteUser);
router.post("/changeUserPassword",validationMethod(validators.updateUserPassword),auth,userController.changeUserPassword);
router.patch("/profile/image",auth,uploadFile(validFileExtensions['image']).single("image"),userController.uploadProfileImage);
router.patch("/cover/profile/images",auth,uploadFile(validFileExtensions['image']).array("image",5),userController.coverImages);



export default router;
