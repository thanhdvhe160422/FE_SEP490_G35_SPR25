import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/products';

const CostDetailBootstrap = () => {
  const [items, setItems] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: 1 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(API_URL)
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  };

  const increaseQty = (item) => {
    const updatedItem = { ...item, quantity: item.quantity + 1 };
    axios.put(`${API_URL}/${item.id}`, updatedItem)
      .then(() => fetchProducts());
  };

  const decreaseQty = (item) => {
    if (item.quantity === 0) return;
    const updatedItem = { ...item, quantity: item.quantity - 1 };
    axios.put(`${API_URL}/${item.id}`, updatedItem)
      .then(() => fetchProducts());
  };

  const deleteItem = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => fetchProducts());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      name: newProduct.name,
      price: parseInt(newProduct.price),
      quantity: parseInt(newProduct.quantity),
    };
    axios.post(API_URL, product)
      .then(() => {
        fetchProducts();
        setNewProduct({ name: '', price: '', quantity: 1 });
      });
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Chi tiết chi phí</h4>
        </div>
        <div className="card-body">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="text-start">{item.name}</td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => decreaseQty(item)}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => increaseQty(item)}
                      >+</button>
                    </div>
                  </td>
                  <td className="text-end">{(item.price * item.quantity).toLocaleString()} đ</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteItem(item.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end mt-4">
            <h5>
              Tổng chi phí: <span className="text-success fw-bold">{calculateTotal().toLocaleString()} đ</span>
            </h5>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5>Thêm sản phẩm mới</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddProduct} className="row g-3">
            <div className="col-md-5">
              <input
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                className="form-control"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                name="price"
                placeholder="Giá (VNĐ)"
                className="form-control"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                name="quantity"
                min="1"
                className="form-control"
                value={newProduct.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CostDetailBootstrap;
