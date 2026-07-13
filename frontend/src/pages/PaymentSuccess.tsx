import { useNavigate, useParams } from "react-router-dom"
import { useAppData } from "../context/AppContext"
import { useEffect } from "react"
import { BiCheckCircle } from "react-icons/bi"
import { BsArrowRight } from "react-icons/bs"

const PaymentSuccess = () => {
    const {paymentId}=useParams<{paymentId:string}>()
    const navigate=useNavigate()
    const {fetchCart}=useAppData()
    useEffect(()=>{
        fetchCart();
    },[])
  return <div className="flex min-h-[70vh] items-center justify-center px-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        <BiCheckCircle size={64} className="mx-auto text-green-500" />
        <h1 className="text-2xl font-bold text-gray-800">Payment Succesfully</h1>
        <p className="text-sm text-gray-500">Your Order has been placed succesfully 🎉</p>
        {
            paymentId && <div className="rounded-lg bg-gray-500">
                <span className="text-white">
                    PaymentID: </span>
                <p className="font-mono break-all text-white">{paymentId}</p>
            </div>
        }
        <div className="space-y-2 pt-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white cursor-pointer" onClick={()=>navigate("/")}>Order More <BsArrowRight size={16}/></button>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white cursor-pointer" onClick={()=>navigate("/orders")}>Your Orders <BsArrowRight size={16}/></button>
        </div>
    </div>
  </div>
}

export default PaymentSuccess