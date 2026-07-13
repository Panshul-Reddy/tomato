import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import trycatch from "../middlewares/trycatch.js";
import Cart from "../models/Cart.js";

export const addToCart=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Please Login"
        })
    }

    const userId=req.user._id;
    const {restaurantId,itemId}=req.body;
    if(!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)){
        return res.status(400).json({
            message:"Invalid restaurant and item ID"
        })
    }

    const cartFromDifferentRestaurant=await Cart.findOne({
        userId,
        restaurantId:{$ne:restaurantId}
    })

    if(cartFromDifferentRestaurant){
        return res.status(400).json({
            message:"You can order from only one store at a time"
        })
    }

    const  cartItem=await Cart.findOneAndUpdate(
        {userId,restaurantId,itemId},
        {
            $inc:{quantity:1},
            $setOnInsert:{userId,restaurantId,itemId}
        },
        {upsert:true,new:true,setDefaultsOnInsert:true}
    );
    return res.json({
        message:"Item Added To Cart Succesfully",
        cart:cartItem
    })
})


export const fetchMyCart=trycatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Please Login"
        })
    }

    const userId=req.user._id;
    const cartItems=await Cart.find({userId})
    .populate("itemId")
    .populate("restaurantId")

    let subtotal=0;
    let cartLength=0;
    for(const cartItem of cartItems){
        const item:any=cartItem.itemId;
        subtotal+=item.price*cartItem.quantity;
        cartLength+=cartItem.quantity;

    }
    return res.json({
        success:true,
        cartLength,
        subtotal,
        cart:cartItems
    })
})

export const incrementCartItem=trycatch(async(req:AuthenticatedRequest,res)=>{
    const userId=req.user?._id
    const {itemId}=req.body;
    if(!userId || !itemId){
        return res.status(400).json({
            message:"Invalid Request"
        })
    }

    const cartItem=await Cart.findOneAndUpdate({userId,itemId},
        {$inc:{quantity:1}},
        {new:true}
    )
    if(!cartItem){
        return res.status(404).json({
            message:"Item Not Found",
        })
    }
    res.json({
        message:"Quantity Increased",
        cartItem
    })
})


export const decrementCartItem=trycatch(async(req:AuthenticatedRequest,res)=>{
    const userId=req.user?._id
    const {itemId}=req.body;
    if(!userId || !itemId){
        return res.status(400).json({
            message:"Invalid Request"
        })
    }

    const cartItem=await Cart.findOne({userId,itemId},
    )
    if(!cartItem){
        return res.status(404).json({
            message:"Item Not Found",
        })
    }

    if(cartItem.quantity===1){
        await Cart.deleteOne({userId,itemId})
        return res.json({
            message:"Item Removed From Cart"
        })
    }

    cartItem.quantity-=1;
    await cartItem.save();
    res.json({
        message:"Quantity Decreased",
        cartItem
    })
})


export const clearCart=trycatch(async (req:AuthenticatedRequest,res)=>{
    const userId=req.user?._id
    if(!userId){
        return res.status(401).json({
            message:"Unauthorized access"
        })
    }

    
    await Cart.deleteMany({userId})
    res.json({
        message:"Cart Cleared Succesfully"
    })
})