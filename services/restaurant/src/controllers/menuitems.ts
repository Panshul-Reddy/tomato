import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import trycatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import MenuItems from "../models/MenuItems.js";

export const addMenuItem=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Please Login",
        })
    }
    const restaurant=await Restaurant.findOne({ownerId:req.user._id})
    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant Found",
        })
    }
    const {name,description,price} =req.body;
    if(!name || !price){
        return res.status(400).json({
            message:"please fill all the required fields"
        })
    }
    const file=req.file;
    if(!file){
        return res.status(400).json({
            message:"Please give all details no file found"
        })
    }
    const fileBuffer=getBuffer(file)

    if(!fileBuffer?.content){
        return res.status(500).json({
            message:"failed to create file buffer"
        })
    }

    const {data:uploadResult}=await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
        buffer:fileBuffer.content,
    })

    const item=await MenuItems.create({
        name,
        description,
        price,
        restaurantId:restaurant._id,
        image:uploadResult.url,
        // isAvailable:true,
    })

    res.json({
        message:"item added succesfully",
        item,
    })

})

export const getAllItems=trycatch(async(req:AuthenticatedRequest,res)=>{
    const {id}=req.params
    if(!id){
        return res.status(400).json({
            message:"ID is required"
        })
    }
    const items=await MenuItems.find({restaurantId:id})
    res.json(items)
})

export const deleteMenuItems=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"please login",
        })
    }
    const {itemId}=req.params;
    if(!itemId){
        return res.status(400).json({
            message:"ID is required",
        })
    }
    const item=await MenuItems.findById(itemId)
    if(!item){
        return res.status(404).json({
            message:"no item found",
        })
    }
    const restaurant=await Restaurant.findOne({
        _id:item.restaurantId,
        ownerId:req.user._id
    })
    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant Found",
        })
    }
    await item.deleteOne()
    res.json({
        message:"Menu item deleted succesfully"
    })
})


export const toggleMenuItemAvailability=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"please login",
        })
    }
    const {itemId}=req.params;
    if(!itemId){
        return res.status(400).json({
            message:"ID is required",
        })
    }
    const item=await MenuItems.findById(itemId)
    if(!item){
        return res.status(404).json({
            message:"no item found",
        })
    }
    const restaurant=await Restaurant.findOne({
        _id:item.restaurantId,
        ownerId:req.user._id
    })
    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant Found",
        })
    }
    item.isAvailable=!item.isAvailable
    await item.save()

    res.json({
        message:`Item marked as ${item.isAvailable ?"Available":"UnAvailable"}`,
        item,
    })
})