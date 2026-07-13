import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addMenuItem, deleteMenuItems, getAllItems, toggleMenuItemAvailability } from "../controllers/menuitems.js";
import uploadFile from "../middlewares/multer.js";

const router=express.Router()

router.post('/new',isAuth,isSeller,uploadFile,addMenuItem);
router.get('/all/:id',isAuth,getAllItems)//probally getallitems is the function that has to be called
router.delete("/:itemId",isAuth,isSeller,deleteMenuItems)
router.put("/status/:itemId",isAuth,isSeller,toggleMenuItemAvailability)

export default router;