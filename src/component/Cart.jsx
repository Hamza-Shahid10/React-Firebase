import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Cart() {
  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authUser) {
      window.location.href = "/login";
      return;
    }

    const q = query(collection(db, "cart"), where("userEmail", "==", authUser.email));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        quantity: docSnap.data().quantity || 1,
        ...docSnap.data()
      }));
      setCartItems(items);
      calculateTotal(items);
    });

    return () => unsub();
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalPrice);
  };

  const handleQuantityChange = async (id, qty) => {
    if (qty < 1) qty = 1;
    await updateDoc(doc(db, "cartItems", id), { quantity: qty });
  };

  const handleRemove = async (id) => {
    Swal.fire({
      title: "Remove item?",
      text: "This will delete the product from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it"
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteDoc(doc(db, "cartItems", id));
        Swal.fire("Removed!", "Item has been removed.", "success");
      }
    });
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-center text-muted">Your cart is empty 🛒</p>
      ) : (
        <div className="row g-3">
          {cartItems.map(item => (
            <div key={item.id} className="col-md-4">
              <div className="card h-100">
                <img src={item.imageUrl} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="text-muted">{item.description}</p>
                  <p className="fw-bold text-success">${item.price.toFixed(2)}</p>
                  <div className="mb-2 d-flex align-items-center">
                    <label className="me-2">Qty:</label>
                    <input type="number" value={item.quantity} min={1} className="form-control w-50"
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))} />
                  </div>
                  <button className="btn btn-danger mt-auto" onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {cartItems.length > 0 && (
        <div className="total-container text-center mt-4 p-3 bg-white shadow rounded">
          Total: <span className="fw-bold">${total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
