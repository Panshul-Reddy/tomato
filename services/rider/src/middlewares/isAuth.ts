import {Request, Response, NextFunction} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';

export interface IUser{
    _id: string;
    email: string;
    name: string;
    image: string;
    role: string;
    restaurantId: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction) : Promise<void> => { 
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"Please Login - No auth header",
            });
            return; 
        }

        const token = authHeader.split(" ")[1];
        if(!token){
            res.status(401).json({
                message:"Please Login - No token",
            });
            return; 
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
        if(!decodedValue || !decodedValue.user){
            res.status(401).json({
                message:"Invalid token",
            });
            return; 
        }
        req.user = decodedValue.user;
        next();
    }
    catch(error:any){
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
}

export const isSeller=async(
    req:AuthenticatedRequest,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    const user=req.user

    if(user && user.role!=="seller"){
         res.status(401).json({
            message:"you are not authorized seller",
        })
        return;
    }
    next();
}