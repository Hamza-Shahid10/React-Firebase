import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, getDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Cart() {
  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authUser?.uid) {
      window.location.href = "/login";
      return;
    }

    const cartRef = doc(db, "cart", authUser.uid);
    const unsub = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = data.items || [];
        setCartItems(items); // items will be an array of product IDs
        calculateTotal(items);
      } else {
        setCartItems([]);
      }
    });

    return () => unsub();
  }, [authUser]);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalPrice);
  };

  const handleQuantityChange = async (id, qty) => {
    if (qty < 1) qty = 1;
  
    const cartRef = doc(db, "cart", authUser.uid);
    const snap = await getDoc(cartRef);
  
    if (snap.exists()) {
      const data = snap.data();
      let items = data.items || [];
  
      // update quantity for the matching item
      items = items.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      );
  
      await updateDoc(cartRef, { items });
    }
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
        const cartRef = doc(db, "cart", authUser.uid);
        const snap = await getDoc(cartRef);
  
        if (snap.exists()) {
          const data = snap.data();
          let items = data.items || [];
  
          // remove the item
          items = items.filter(item => item.id !== id);
  
          await updateDoc(cartRef, { items });
          Swal.fire("Removed!", "Item has been removed.", "success");
        }
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
            // console.log(item),
            <div key={item.id} className="col-md-4">
              <div className="card h-100">
                <img src={item.imageUrl} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="text-muted">{item.description}</p>
                  <p className="fw-bold text-success">${item.price}</p>
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
