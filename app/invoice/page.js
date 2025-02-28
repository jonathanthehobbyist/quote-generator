"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Invoice() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [clientEmail, setClientEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [pdflist, setPdfList] = ([]);

  if (!session) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>
        <p className="mb-4">Please sign in to access the invoice generator.</p>
        <button className="bg-blue-500 text-white px-4 py-2" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </div>
    );
  }

  

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
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
    const fileName = `invoice-${pdfList.length + 1}.pdf`;
    //window.open(url);
    setPdfList((prevList) => [...prevList, { name: fileName, url}]);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Invoice Generator</h1>
        <button className="bg-red-500 text-white px-4 py-2" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <img src={session.user.image} alt="User Avatar" className="w-10 h-10 rounded-full" />
        <p>Welcome, {session.user.name}!</p>
      </div>

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
            onChange={(e) => {
              const updatedItems = [...items];
              updatedItems[index].description = e.target.value;
              setItems(updatedItems);
            }}
          />
          <input
            type="number"
            placeholder="Qty"
            className="border p-2 w-16"
            value={item.quantity}
            onChange={(e) => {
              const updatedItems = [...items];
              updatedItems[index].quantity = Number(e.target.value);
              setItems(updatedItems);
            }}
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 w-24"
            value={item.price}
            onChange={(e) => {
              const updatedItems = [...items];
              updatedItems[index].price = Number(e.target.value);
              setItems(updatedItems);
            }}
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
