"use client"; // Ensure it's a Client Component

import { useState } from "react";

export default function Invoice() {
  const [items, setItems] = useState([]);
  const [clientEmail, setClientEmail] = useState("");
  const [logo, setLogo] = useState(null);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setLogo(reader.result);
  };

  const generateInvoice = async () => {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total: getTotal(), clientEmail, logo }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>

      <input
        type="email"
        placeholder="Client Email"
        className="border p-2 w-full mb-4"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        className="border p-2 w-full mb-4"
        onChange={handleLogoUpload}
      />
      {logo && <img src={logo} alt="Logo Preview" className="h-16 mb-4" />}

      <button className="bg-blue-500 text-white px-4 py-2" onClick={addItem}>
        + Add Item
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex space-x-2 mt-2">
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-full"
            value={item.description}
            onChange={(e) => updateItem(index, "description", e.target.value)}
          />
          <input
            type="number"
            placeholder="Qty"
            className="border p-2 w-16"
            value={item.quantity}
            onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 w-24"
            value={item.price}
            onChange={(e) => updateItem(index, "price", Number(e.target.value))}
          />
        </div>
      ))}

      <h2 className="text-lg font-semibold mt-4">Total: ${getTotal()}</h2>

      <button className="bg-green-500 text-white px-4 py-2 mt-4" onClick={generateInvoice}>
        Generate PDF
      </button>
    </div>
  );
}
