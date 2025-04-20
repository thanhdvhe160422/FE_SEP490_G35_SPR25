import { useEffect, useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/CategoryService";
import Swal from "sweetalert2";

export function CategoryForm({ title, campusId, id, name, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState(name);
  const [errors, setErrors] = useState();

  const handleInputChange = (e) => {
    var value = e.target.value;
    const name = "tên loại sự kiện";
    var error = validateMaxLength(value, name);
    if (error !== "") {
      setCategoryName(value.substring(0, 255));
      setErrors({ ...errors, name: error });
      return;
    }
    error = validateNull(value, name);
    if (error !== "") {
      setCategoryName(value);
      setErrors({ ...errors, name: error });
      return;
    }
    error = validateNoSpecialChars(value, name);
    if (error !== "") {
      setErrors({ ...errors, name: error });
      return;
    }
    setErrors({ ...errors, name: "" });
    setCategoryName(e.target.value);
  };

  const validateNull = (value, name) => {
    if (!value) {
      return `vui lòng nhập ${name}`;
    }
    return "";
  };

  const validateNoSpecialChars = (value, name) => {
    const regex = /^[\p{L}0-9\s]+$/u;
    if (!regex.test(value)) {
      return `${name} không được chứa ký tự đặc biệt`;
    }
    return "";
  };
  const validateMaxLength = (value, name) => {
    if (value.length > 255) {
      return `${name} không được vượt quá 255 ký tự`;
    }
    return "";
  };
  const handleCreate = () => {
    const categoryData = {
      id: 0,
      categoryEventName: categoryName,
      campusId: campusId,
    };
    if (errors?.name !== "") {
      Swal.fire({
        title: "Dữ liệu không hợp lệ",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: true,
      });
      return;
    }
    const token = localStorage.getItem("token");
    createCategory(categoryData, token)
      .then((response) => {
        if (response?.status === 200) {
          Swal.fire({
            title: "Tạo thành công",
            text: response.message,
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
          });
          onSave(response);
        } else {
          Swal.fire({
            title: "Lỗi khi tạo",
            text: response.message,
            icon: "error",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error creating category:", error);
        Swal.fire({
          title: "Lỗi khi tạo",
          text: error,
          icon: "error",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: true,
        });
      });
  };

  const handleUpdate = () => {
    const categoryData = {
      id: id,
      categoryEventName: categoryName,
      campusId: campusId,
    };

    if (errors?.name !== "") {
      Swal.fire({
        title: "Dữ liệu không hợp lệ",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: true,
      });
      return;
    }
    const token = localStorage.getItem("token");
    updateCategory(categoryData, token)
      .then((response) => {
        if (response?.status === 200) {
          Swal.fire({
            title: "Cập nhật thành công",
            text: response.message,
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
          });
          onSave(response);
        } else {
          Swal.fire({
            title: "Lỗi khi cập nhật",
            text: response.message,
            icon: "error",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating category:", error);
        Swal.fire({
          title: "Lỗi khi cập nhật",
          text: error,
          icon: "error",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: true,
        });
      });
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    setCategoryName(name);
  }, [name]);
  return (
    <div className="">
      <div className="form-body">
        <form id="category-form">
          <input id="categoryId" value={id} hidden />
          <label className="me-2">Tên</label>
          <input
            type="text"
            value={categoryName}
            onChange={handleInputChange}
            style={{ width: "400px" }}
            required
          />
          <br></br>
          {errors?.name && (
            <span className="text-danger">
              {capitalizeFirstLetter(errors?.name)}
            </span>
          )}
        </form>
      </div>
      <div className="m-2 d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary me-2"
          data-bs-dismiss="modal"
          onClick={onClose}
        >
          Hủy
        </button>
        {title === "Tạo danh mục" ? (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleCreate}
          >
            Tạo
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdate}
          >
            Cập nhật
          </button>
        )}
      </div>
    </div>
  );
}
