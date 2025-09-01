import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot,
    setDoc, 
    getDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/Dashboard.css";


export default function Dashboard() {
    const authUser = JSON.parse(localStorage.getItem("authUser"));

    if (!authUser) {
        window.location.href = "/login";
    }
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ title: "", description: "", price: "", imageUrl: "" });

    const isAdmin = authUser?.email === "hamza@gmail.com";

    // Load products from Firestore
    useEffect(() => {
        const productsRef = collection(db, "products");
        const q = query(productsRef);
        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setProducts(items);
        });
        return () => unsub();
    }, []);

    // Modal handlers
    const handleShowModal = (product = null) => {
        setEditingProduct(product);
        if (product) setFormData(product);
        else setFormData({ title: "", description: "", price: "", imageUrl: "" });
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const productRef = doc(db, "products", editingProduct.id);
                await updateDoc(productRef, formData);
                Swal.fire("Updated!", "Product updated successfully.", "success");
            } else {
                await addDoc(collection(db, "products"), { ...formData });
                Swal.fire("Added!", "New product added successfully.", "success");
            }
            handleCloseModal();
        } catch (err) {
            console.error(err);
            Swal.fire("Error!", "Something went wrong.", "error");
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the product.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteDoc(doc(db, "products", id));
                Swal.fire("Deleted!", "Product has been deleted.", "success");
            }
        });
    };

    const handleAddToCart = async (id) => {
        try {
          const cartRef = doc(db, "cart", authUser?.uid);
          const snap = await getDoc(cartRef);
      
          if (snap.exists()) {
            const data = snap.data();
            const items = data.items || [];
            if (!items.includes(id)) {
              await updateDoc(cartRef, {
                items: [...items, id],
              });
            }
          } else {
            // create new cart doc
            await setDoc(cartRef, { items: [id] });
          }
      
          Swal.fire("Added!", "Product added to cart.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      };
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className="sidebar d-flex flex-column p-3" style={{ background: "#1e1e2f", minHeight: "100vh", color: "#f1f1f1", width: "250px" }}>
                <h4>{isAdmin ? "Admin Panel" : "Dashboard"}</h4>
                {isAdmin && <Button onClick={() => handleShowModal()} className="mb-3">Add Product</Button>}
                <Button variant="warning" href="/cart">View Cart ({authUser?.email})</Button>
                <Button variant="danger" className="mt-auto" onClick={() => {
                    localStorage.removeItem("authUser");
                    window.location.href = "/login";
                }}>Logout</Button>
            </div>

            {/* Main */}
            <div className="product-main flex-grow-1 p-4">
                <h2>Welcome, {authUser?.displayName || "User"}!</h2>
                <p>This is your dashboard. {isAdmin ? "Manage products below." : "Your products and cart are here."}</p>
                <div className="container mt-4">
                    <h4>Products</h4>
                    <div className="row g-4">
                        {products.map((product) => (
                            <div key={product.id} className="col-md-6">
                                <div className="card h-100 shadow-sm border-0">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="card-img-top product-img"
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{product.title}</h5>
                                        <p className="card-text text-muted">{product.description}</p>
                                        <p className="fw-bold text-success">${product.price}</p>
                                    </div>
                                    <div className="card-footer bg-transparent border-0">
                                        {isAdmin ? (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleShowModal(product)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="success" size="sm" className="w-100" onClick={() => handleAddToCart(product.id)}>
                                                Add to Cart
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveProduct}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control name="title" value={formData.title} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" name="description" value={formData.description} onChange={handleInputChange} rows={3} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        <Button variant="primary" type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
