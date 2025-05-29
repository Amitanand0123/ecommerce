import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password:string):Promise<string> => {
    const salt=await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
}

export const comparePassword=async(password:string,hash:string):Promise<boolean> => {
    return bcrypt.compare(password,hash)
}

export const generateToken=(userId:string):string => {
    return jwt.sign({userId},process.env.JWT_SECRET!,{
        expiresIn:"7d"
    })
}

export const verifyToken=(token:string):{userId:string} | null => {
    try {
        return jwt.verify(token,process.env.JWT_SECRET!) as {userId:string}
    } catch (_e) {
        return null
    }
}

export const generateVerificationCode = ():string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString()
}