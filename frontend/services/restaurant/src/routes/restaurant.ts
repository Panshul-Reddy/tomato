import express from 'express'
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { addRestraunt, fetchMyRestaurant, fetchSingleRestaurant, getNearByRestaurant, updateRestaurant, updateStatusRestaurant} from '../controllers/restaurant.js';
import uploadFile from '../middlewares/multer.js';

const router=express.Router()

router.post("/new",isAuth,isSeller,uploadFile,addRestraunt)
router.get("/my",isAuth,isSeller,fetchMyRestaurant)
router.put("/status",isAuth,isSeller,updateStatusRestaurant)
router.put("/edit",isAuth,isSeller,updateRestaurant)
router.get("/all", isAuth, getNearByRestaurant);
router.get("/:id", isAuth, fetchSingleRestaurant);
export default router;