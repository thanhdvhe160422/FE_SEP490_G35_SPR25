import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { createCategory, updateCategory, deleteCategory } from "../../services/CategoryService";

export function CategoryForm({ title, campusId, id, name, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState(name);
      const { enqueueSnackbar } = useSnackbar();

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleCreate = () => {
    const categoryData = {
        id: 0,
        categoryEventName: categoryName,
        campusId: campusId
    };
    const token = localStorage.getItem('token')
    createCategory(categoryData,token)
      .then((response) => {
        enqueueSnackbar("Category Created", {
            variant: "success",
        });
        onSave(response);
      })
      .catch((error) => {
        console.error("Error creating category:", error);
        enqueueSnackbar("Error creating category", {
            variant: "error",
        });
      });
  };

  const handleUpdate = () => {
    const categoryData = {
      id: id,
      categoryEventName: categoryName,
      campusId: campusId
    };

    const token = localStorage.getItem('token')
    updateCategory(categoryData,token)
      .then((response) => {
        enqueueSnackbar("Category Updated", {
            variant: "success",
        });
        onSave(response);
      })
      .catch((error) => {
        console.error("Error updating category:", error);
        enqueueSnackbar("Error updating category", {
            variant: "error",
        });
      });
  };
  useEffect(() => {
    setCategoryName(name);
  }, [name]);
  return (
    <div className="">
        <div className="form-body">
          <form id="category-form">
            <input id="categoryId" value={id} hidden />
            <label className="me-2">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={handleInputChange}
              required
            />
          </form>
        </div>
        <div className="m-2">
          <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal" onClick={onClose}>
            Cancel
          </button>
          {title === "Create Category" ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
            >
              Create
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Update
            </button>
          )}
        </div>
      </div>
  );
}
