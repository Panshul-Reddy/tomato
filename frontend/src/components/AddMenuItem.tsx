import axios from "axios";
import {useState} from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

const AddMenuitem = ({onItemAdded}:{onItemAdded:()=>void}) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const resetForm=()=>{
        setName("")
        setDescription("")
        setPrice("")
        setImage(null)
    };

    const handleSubmit=async()=>{
        if(!name || !price || !image){
            alert("Name Price and image is Required")
            return;
        }
        const formData=new FormData()
        formData.append("name",name)
        formData.append("description",description)
        formData.append("price",price)
        formData.append("file",image)

        try{
            setLoading(true);
            await axios.post(`${restaurantService}/api/item/new`,formData,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            })

            toast.success("Item Added Successfully")
            resetForm();
            onItemAdded();
        }catch(error){
            console.log(error)
            toast.error("Failed to add item")
        }finally{
            setLoading(false)
        }
    }

  return (
  <div className="max-w-md mx-auto space-y-4">

    <h2 className="text-lg font-semibold">Add Menu Item</h2>

    <input
      type="text"
      placeholder="Item Name"
      value={name}
      onChange={e=>setName(e.target.value)}
      className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
    />

    <textarea
      placeholder="Item Description"
      value={description}
      onChange={e=>setDescription(e.target.value)}
      className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
    />

    <input
      type="number"
      placeholder="Price ₹"
      value={price}
      onChange={e=>setPrice(e.target.value)}
      className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
    />

    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
        <BiUpload className="h-5 w-5 text-red-500" />
        {image ? image.name : "Upload restaurant image"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={e=> setImage(e.target.files?.[0] || null)}
        />
    </label>

    <button
      disabled={loading}
      onClick={handleSubmit}
      className="w-full rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
    >
      {loading ? "Adding..." : "Add Item"}
    </button>

  </div>
  )
}

export default AddMenuitem