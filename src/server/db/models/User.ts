import mongoose, {Schema,Document} from 'mongoose'

export interface IUser extends Document{
    name:string;
    email:string;
    passwordHash:string;
    isVerified:boolean
    verificationCode?:string | null;
    verificationCodeExpires?:Date | null;
    interestedCategories: mongoose.Types.ObjectId[]
}

const UserSchema : Schema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verificationCode:{
        type:String,
        default:null
    },
    verificationCodeExpires:{
        type:Date,
        default:null
    },
    interestedCategories:[{type:Schema.Types.ObjectId,ref:'Category'}]
},{timestamps:true})

export default mongoose.models.User || mongoose.model<IUser>('User',UserSchema)