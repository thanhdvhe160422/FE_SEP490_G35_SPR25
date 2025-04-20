import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  getCategoryByCampusId,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/CategoryService";
import { getCampusIdByName } from "../../services/campusService";
import Swal from "sweetalert2";
import { CategoryForm } from "./CategoryModal";

export default function CategoryEventManager() {
  const [categories, setCategories] = useState([]);
  const [campus, setCampus] = useState();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [showModal, setShowModal] = useState(false);
  const [categoryData, setCategoryData] = useState({ id: "", name: "" });
  const [modalTitle, setModalTitle] = useState("Tạo danh mục");

  useEffect(() => {
    const fetchData = async () => {
      try {
        var campusName = localStorage.getItem("campus");
        if (!campusName) {
          throw new Error("Campus not found in localStorage");
        }
        var campus = await getCampusIdByName(campusName);
        if (campus == null) {
          setCategories([]);
          throw console.error("Error to find campus with name: " + campusName);
        }
        setCampus(campus);
        var response = await getCategoryByCampusId(campus.id);

        if (response?.error === "expired") {
          Swal.fire("Hết phiên đăng nhập", "Hãy đăng nhập lại", "error");
          navigate("/login");
          return;
        }
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCreate = () => {
    setCategoryData({ id: "", name: "" });
    setModalTitle("Tạo danh mục");
    setShowModal(true);
  };

  const handleUpdate = (category) => {
    setCategoryData({ id: category.id, name: category.categoryEventName });
    setModalTitle("Cập nhật danh mục");
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleSave = (category) => {
    setShowModal(false);
    window.location.reload();
  };
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn không?",
        text: "Hành động này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Vâng, xóa nó!",
        cancelButtonText: "Hủy",
      });
      var response;
      if (result.isConfirmed) {
        var token = localStorage.getItem("token");
        response = await deleteCategory(id, token);
        if (response?.status === 400) {
          Swal.fire("Lỗi", response.message, "error");
          return;
        }
        if (response?.error) {
          Swal.fire("Lỗi", response.error, "error");
          return;
        } else {
          setCategories(categories.filter((category) => category.id !== id));
          Swal.fire("Đã xóa!", "Xóa thành công!", "success");
        }
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      Swal.fire("Lỗi", response.message, "error");
    }
  };

  return (
    <>
      <Header />
      <div style={{ marginTop: "100px" }}>
        <h1>Quản lý danh mục sự kiện</h1>
        <div className="d-flex justify-content-between me-4">
          <div>
            <h4>Cơ sở: {campus?.campusName || ""}</h4>
          </div>
          <div>
            <button onClick={handleCreate} className="btn btn-success btn-sm">
              Tạo mới
            </button>
          </div>
        </div>
        <div>
          {showModal && (
            <div
              className="modal fade show"
              style={{ display: "block" }}
              id="categoryModal"
              tabIndex="-1"
              aria-labelledby="categoryModalLabel"
              aria-hidden="true"
              onClick={handleCloseModal}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="categoryModalLabel">
                        {modalTitle}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        onClick={handleCloseModal}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <CategoryForm
                        title={modalTitle}
                        campusId={campus.id}
                        id={categoryData.id}
                        name={categoryData.name}
                        onClose={handleCloseModal}
                        onSave={handleSave}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="category-list-container">
          <table className="table table-striped table-bordered m-1">
            <thead>
              <tr>
                <th className="text-black">ID</th>
                <th className="text-black">Tên danh mục</th>
                <th className="text-black">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td className="text-black">{index + 1}</td>
                  <td className="text-black">{category.categoryEventName}</td>
                  <td className="d-flex justify-content-center">
                    <button
                      onClick={() => handleUpdate(category)}
                      className="btn btn-primary btn-sm me-2"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
