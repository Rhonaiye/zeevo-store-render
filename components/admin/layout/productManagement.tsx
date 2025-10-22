'use client';
import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  seller: string;
  image: string;
  createdAt: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Zeevo T-shirt",
      price: 7500,
      seller: "Rhona Store",
      image: "/images/tee1.jpg",
      createdAt: "2025-10-21T09:00:00Z",
    },
    {
      id: "2",
      name: "Zeevo Cap",
      price: 5500,
      seller: "Zeevo Fashion",
      image: "/images/cap1.jpg",
      createdAt: "2025-10-20T10:30:00Z",
    },
    {
      id: "3",
      name: "Wireless Headphones",
      price: 24500,
      seller: "SoundPro NG",
      image: "/images/headphones.jpg",
      createdAt: "2025-10-19T11:15:00Z",
    },
    {
      id: "4",
      name: "Zeevo Hoodie",
      price: 15000,
      seller: "Rhona Apparel",
      image: "/images/hoodie.jpg",
      createdAt: "2025-10-22T13:45:00Z",
    },
  ]);

  const [search, setSearch] = useState("");

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "10px" }}>
        Product Management
      </h2>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#555" }}>
            No products found
          </p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />
              <div style={{ padding: "10px" }}>
                <h3 style={{ fontWeight: "600", marginBottom: "6px" }}>
                  {product.name}
                </h3>
                <p style={{ marginBottom: "6px" }}>₦{product.price.toLocaleString()}</p>
                <p style={{ fontSize: "13px", color: "#777", marginBottom: "10px" }}>
                  Seller: {product.seller}
                </p>
                <p style={{ fontSize: "12px", color: "#999", marginBottom: "10px" }}>
                  Added: {new Date(product.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={{
                    padding: "6px 10px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
