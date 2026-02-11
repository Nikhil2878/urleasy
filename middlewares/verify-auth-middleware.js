import { verifyJWTToken } from "../services/auth.services.js";

export const verifyAuthentication = (req,res,next) => {
     let token = req.cookies?.access_token;
    if(!token){
        req.user = null;
        return next();
    }
    try{
        const decodedToken = verifyJWTToken(token);
        req.user = decodedToken;
        console.log("req.user",req.user);
    }catch(error){
        req.user = null;
    }
    return next();
}