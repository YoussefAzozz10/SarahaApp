import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

const userSchema= new Schema({

    firstName:{
        type:String,
    },
    lastName:{
        type:String
    },
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true,
    },
    age:{
        type:Number
    },
    gender:{
        type:String,
        default:'Male',
        enum:['Male','Female']
    },
    phone:{
        type:String
    },
    role:{
        type:String,
        default:'normal',
        enum:['normal','admin']
    },
    profileImage:{secure_url:String , public_id:String},
    coverImages:[{secure_url:String , public_id:String}],
    provider:{
        type:String,
        default: 'system',
        enum:['system' , 'FACEBOOK','GOOGLE']
    }
},{
    timestamps:true
});


userSchema.pre('save',function(){
    this.password = bcrypt.hashSync(this.password,parseInt(process.env.SALT_ROUND));
});

userSchema.pre('find', function (next) {
    this._decryptionKey = process.env.SECRET_KEY; // Store the key for decryption in the query context
    next();
});


userSchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
      // Decrypt phone numbers for multiple documents
      docs.forEach( doc => {
        if (doc.phone && process.env.SECRET_KEY) {
          let bytes = CryptoJS.AES.decrypt(doc.phone, process.env.SECRET_KEY);
          doc.phone = bytes.toString(CryptoJS.enc.Utf8);
        }
      });
    } else if (docs.phone && process.env.SECRET_KEY) {
      // Decrypt phone number for a single document
      let bytes = CryptoJS.AES.decrypt(docs.phone, process.env.SECRET_KEY);
      docs.phone = bytes.toString(CryptoJS.enc.Utf8);
    }
});



const userModel = model("User",userSchema);

export default userModel;
