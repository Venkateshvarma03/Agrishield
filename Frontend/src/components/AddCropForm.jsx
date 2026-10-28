import { useState } from "react";

function AddCropForm() {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    harvestDate: "",
    price: "",
    change: "",
    EstRevenue: "",
    status: "Growing",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/crops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Crop added:", data);
        setIsSubmitting(false);
        setFormData({ name: "", quantity: "", harvestDate: "", price: "", change: "", EstRevenue: "", status: "Growing" });
      });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <p className="font-semibold text-gray-800 text-lg mb-2">Add New Crop</p>

      <input name="name" placeholder="Crop name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="quantity" placeholder="Quantity (e.g. 20 Quintals)" value={formData.quantity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="harvestDate" placeholder="Harvest Date (e.g. 28 May 2026)" value={formData.harvestDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="price" placeholder="Price (e.g. 2150)" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="change" placeholder="Change % (e.g. 2.4 or -1.2)" value={formData.change} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="EstRevenue" placeholder="Est. Revenue (e.g. 43000)" value={formData.EstRevenue} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      <input name="status" placeholder="Status (Growing / Ready to Sell)" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
      >
        {isSubmitting ? "Adding..." : "Add Crop"}
      </button>
    </form>
  );
}

export default AddCropForm;