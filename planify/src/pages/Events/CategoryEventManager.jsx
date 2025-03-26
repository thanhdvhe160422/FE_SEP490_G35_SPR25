import React, {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getCategoryByCampusId, createCategory, updateCategory, deleteCategory } from "../../services/CategoryService";
import { getCampusIdByName } from "../../services/campusService";
import Swal from "sweetalert2";
import { CategoryForm } from "./CategoryModal";

export default function CategoryEventManager(){
    const [categories,setCategories] = useState([]);
    const [campus,setCampus] = useState();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    
  const [showModal, setShowModal] = useState(false);
  const [categoryData, setCategoryData] = useState({ id: "", name: "" });
  const [modalTitle, setModalTitle] = useState("Create Category");

    useEffect(()=>{
        const fetchData = async () =>{
            try{
                var campusName = localStorage.getItem('campus');
                if (!campusName) {
                    throw new Error('Campus not found in localStorage');
                }
                var campus = await getCampusIdByName(campusName);
                if (campus==null){
                    setCategories([]);
                    throw console.error("Error to find campus with name: "+ campusName);
                }
                setCampus(campus);
                var response = await getCategoryByCampusId(campus.id);
                
                if (response?.error === "expired") {
                    Swal.fire("Login session expired", "Please log in again.", "error");
                    navigate("/login");
                    return;
                }
                setCategories(response.data);
                
            }catch(error){
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    },[])
    
    const handleCreate = () => {
        setCategoryData({ id: "", name: "" });
        setModalTitle("Create Category");
        setShowModal(true);
      };

    const handleUpdate = (category) => {
        setCategoryData({ id: category.id, name: category.categoryEventName });
        setModalTitle("Update Category");
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
      };
    const handleSave = (category) => {
        console.log("Category saved:", category);
        setShowModal(false);
        window.location.reload();
    };
    const handleDelete = (id) => {
        console.log(`Deleting category with id: ${id}`);
    };
    return <>
        <Header/>
        <div style={{marginTop:'100px'}}>
            <h1>Category Manager</h1>
            <div className="d-flex justify-content-between me-4">
                <div><h4>Campus: {campus?.campusName||""}</h4></div>
                <div>
                    <button
                        onClick={handleCreate}
                        className="btn btn-success btn-sm">
                            Create
                    </button>
                </div>
            </div>
            <div>
                {showModal && (
                    <CategoryForm
                    title={modalTitle}
                    campusId={campus.id}
                    id={categoryData.id}
                    name={categoryData.name}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    />
                )}
            </div>
            <div id="category-list-container">
                <table className="table table-striped table-bordered m-1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((category) => (
                    <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.categoryEventName}</td>
                    <td>
                        <button
                        onClick={() => handleUpdate(category)}
                        className="btn btn-primary btn-sm me-2"
                        >
                        Update
                        </button>
                        <button
                        onClick={() => handleDelete(category.id)}
                        className="btn btn-danger btn-sm"
                        >
                        Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
            </div>
        </div>
        
        <Footer/>
    </>
}