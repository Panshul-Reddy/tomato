import axios from "axios";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { restaurantService , utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import {loadStripe} from '@stripe/stripe-js'
 

interface Address{
  _id:string;
  formattedAddress:string;
  mobile:number;
}

const Checkout = () => {
  const {cart,subTotal,quantity}=useAppData()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [loadingAddress,setLoadingAddress]=useState(true)
  const [loadingRazorpay, setLoadingRazorpay] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)

  const [creatingOrder, setCreatingOrder] = useState(false)
  useEffect(()=>{
    const fetchAddresses=async()=>{
      if(!cart || cart.length===0){
        setLoadingAddress(false)
        return
      }

      try{
        const {data}=await axios.get(`${restaurantService}/api/address/all`,{
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        })
        setAddresses(data || [])
      }catch(error){
        console.log(error)
      }finally{
        setLoadingAddress(false)
      }
    }
    fetchAddresses()
  },[cart])
  const navigate=useNavigate()
  if(!cart || cart.length===0){
      return <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your Cart Is Empty</p>
      </div>
    }
    
    const restaurant=cart[0].restaurantId as IRestaurant;
    const deliveryFee=subTotal<250 ?49:0;
    const platformFee=19;
    const grandTotal=subTotal+deliveryFee+platformFee;
    const createOrder=async(paymentMethod:"razorpay" | "stripe")=>{
      if(!selectedAddressId) return null
      setCreatingOrder(true)
      try {
        const {data}=await axios.post(`${restaurantService}/api/order/new`,{
          paymentMethod,
          addressId:selectedAddressId
        },{
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        })
        return data;
      } catch (error) {
        toast.error("Failed to create order")
      }finally{
        setCreatingOrder(false)
      }
    };
    const payWithRazorpay=async()=>{
      try {
        setLoadingRazorpay(true)
        const order =await createOrder("razorpay")
        if(!order) return;
        const {orderId,amount}=order
        const {data}=await axios.post(`${utilsService}/api/payment/create`,{
          orderId
        })
        const {razorpayOrderId,key}=data
        const options={
          key,
          amount:amount*100,
          currency:"INR",
          name:"Dine Flow",
          description:"Food Order Payment",
          order_id:razorpayOrderId,
          handler:async(response:any)=>{
            try {
              await axios.post(`${utilsService}/api/payment/verify`,{
                razorpay_order_id:response.razorpay_order_id,
                razorpay_payment_id:response.razorpay_payment_id,
                razorpay_signature:response.razorpay_signature,
                orderId,
              })
              toast.success("Payment Succesfully 🎉")
              navigate('/paymentsuccess/'+response.razorpay_payment_id)
              
            } catch (error) {
              toast.error("Payment verification Failed")
            }
          },
          theme:{
            color:"#E23744"
          }
        }
        const razorpay=new (window as any).Razorpay(options);
        razorpay.open()
      } catch (error) {
        console.log(error)
        toast.error("Payment Failed,Please Refresh the page")
      }finally{
        setLoadingRazorpay(false)
      }
  }

  const stripePromise=loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)


  const payWithStripe=async()=>{
    try {
      setLoadingStripe(true)
      const order=await createOrder("stripe")
      if(!order) return;
      const {orderId}=order
      try{
        await stripePromise;
        const{data}=await axios.post(`${utilsService}/api/payment/stripe/create`,{
          orderId
        })
        if(data.url){
          window.location.href=data.url
        }else{
          toast.error("failed to create payment session")
        }
      }catch(error){
        toast.error("payment failed")
      }
    } catch (error) {
      console.log(error)
      toast.error("Payment Failed")
    }finally{
      setLoadingStripe(false)
    }
  }

  return (
  <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
    <h1 className="text-2xl font-bold">Checkout</h1>

    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{restaurant.name}</h2>
      <p className="text-sm text-gray-500">
        {restaurant.autoLocation.formattedAddress}
      </p>
    </div>

    <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <h3 className="font-semibold">Delivery Address</h3>

      {loadingAddress ? (
        <p className="text-sm text-gray-500">Loading Address...</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500">
          No Address Found, Please add one
        </p>
      ) : (
        addresses.map((add) => (
          <label
            key={add._id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              selectedAddressId === add._id
                ? "border-[#e23744] bg-red-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              className="mt-1 accent-[#e23744]"
              checked={selectedAddressId === add._id}
              onChange={() => setSelectedAddressId(add._id)}
            />

            <div>
              <p className="text-sm font-medium">{add.formattedAddress}</p>
              <p className="text-xs text-gray-500">{add.mobile}</p>
            </div>
          </label>
        ))
      )}
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
      <h3 className="font-semibold">Order Summary</h3>

      {
        cart.map((cartItem:ICart)=>{
          const item=cartItem.itemId as IMenuItem;
          return <div className="flex justify-between text-sm" key={cartItem._id}>
            <span>
              {item.name} x {cartItem.quantity}
            </span>
            <span>₹{item.price * cartItem.quantity}</span>
          </div>
        })
      }
      <hr />

      <div className="flex justify-between text-sm">
        <span>Items ({quantity})</span>
        <span>₹{subTotal}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Delivery Fee</span>
        <span>{deliveryFee===0 ? "Free":`₹${deliveryFee}`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>PlatForm Fee</span>
        <span>₹{platformFee}</span>
      </div>
      {
        subTotal<250 && <p className="text-xs  text-gray-500 ">
          Add item worth ₹{250-subTotal} more to get free delivery
        </p>
      }

      <div className="flex justify-between text-base font-semibold border-t pt-2">
        <span>Grand Total</span>
        <span>₹{grandTotal}</span>
      </div>
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-semibold">Payment Method</h3>
      <button disabled={!selectedAddressId || loadingRazorpay|| creatingOrder} onClick={payWithRazorpay} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d7ff9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{loadingRazorpay ? <BiLoader size={18} className="animate-spin" />: <BiCreditCard size={18} />} Pay with Razorpay</button>

      <button disabled={!selectedAddressId || loadingStripe|| creatingOrder} onClick={payWithStripe} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">{loadingRazorpay ? <BiLoader size={18} className="animate-spin" />: <BiCreditCard size={18} />} Pay with Stripe</button>
    </div>
  </div>
);
}

export default Checkout