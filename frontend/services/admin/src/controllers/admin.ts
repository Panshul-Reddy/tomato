import {ObjectId} from 'mongodb'
import trycatch from '../middlewares/trycatch.js'
import {getRestaurantCollection,getRiderCollection} from '../util/collection.js'

export const getPendingRestaurant=trycatch(async(req,res)=>{
    const restaurants=await (await getRestaurantCollection()).find({isVerified:false}).toArray()

    res.json({
        count:restaurants.length,
        restaurants
    })
})


export const getPendingRider=trycatch(async(req,res)=>{
    const riders=await (await getRiderCollection()).find({isVerified:false}).toArray()

    res.json({
        count:riders.length,
        riders
    })
})


export const verifyRestaurant=trycatch(async(req,res)=>{
    const {id}=req.params;
    if(typeof id!=="string"){
        return res.status(400).json({
            message:"ID must be string"
        })
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message:"Invalid ObjectID"
        })
    }

    const result=await (await getRestaurantCollection()).updateOne({_id:new ObjectId(id)},{
        $set:{
            isVerified:true,
            updatedAt:new Date()
        }
    })

    if(result.matchedCount===0){
        return res.status(404).json({
            message:"Restaurant Not Found"
        })
    }

    res.json({
        message:"Restaurant Verified Succesfully"
    })

})


export const verifyRider=trycatch(async(req,res)=>{
    const {id}=req.params;
    if(typeof id!=="string"){
        return res.status(400).json({
            message:"ID must be string"
        })
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message:"Invalid ObjectID"
        })
    }

    const result=await (await getRiderCollection()).updateOne({_id:new ObjectId(id)},{
        $set:{
            isVerified:true,
            updatedAt:new Date()
        }
    })

    if(result.matchedCount===0){
        return res.status(404).json({
            message:"Rider Not Found"
        })
    }

    res.json({
        message:"Rider Verified Succesfully"
    })

})