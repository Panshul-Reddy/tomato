import {Request, Response, RequestHandler,NextFunction} from 'express';

const tryCatch = (handler:RequestHandler):RequestHandler => {
    return async (req:Request, res:Response, next:NextFunction) => {
        try {
            await handler(req, res, next);
        }
        catch(error:any){
            res.status(500).json({
                message:error.message || "Something went wrong"
            });
        }
    }
}

export default tryCatch;