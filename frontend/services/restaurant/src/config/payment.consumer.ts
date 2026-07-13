import axios from 'axios';
import Order from '../models/Order.js';
import {getChannel} from './rabbitmq.js'

export const startPaymentConsumer=async()=>{
    const channel=getChannel()
    channel.consume(process.env.PAYMENT_QUEUE!,async(msg)=>{
        if(!msg){
            return ;
        }
        try{
            const event=JSON.parse(msg.content.toString())
            if(event.type !== "PAYMENT_SUCCESS"){
                channel.ack(msg)
                return;
            }
            const {orderId}=event.data;
            const order=await Order.findByIdAndUpdate(
                {
                    _id:orderId,
                    paymentStatus:{$ne:"paid"}
                },{
                    $set:{
                        paymentStatus:"paid",
                        status:"placed"
                    },
                    $unset:{
                        expiresAt:1
                    },
                },{
                    new:true
                }
            )

            if(!order){
                channel.ack(msg)
                return;
            }
            console.log("✅Order Placed:",orderId)

            const realtimeService = process.env.REALTIME_SERVICE;
            if (realtimeService) {
                await axios.post(
                    `${realtimeService}/api/v1/internal/emit`,{
                        event:"order:new",
                        room:`restaurant:${order.restaurantId}`,
                        payload:{
                            orderId:order._id,
                        }
                    },{
                        headers:{
                            "x-internal-key":process.env.INTERNAL_SERVICE_KEY
                        }
                    }
                )
            } else {
                console.warn("REALTIME_SERVICE is not configured, skipping order:new emit")
            }

            channel.ack(msg);
        }catch(error){
            console.error("❌ payment consumer failed:",error)
        }
    })
}