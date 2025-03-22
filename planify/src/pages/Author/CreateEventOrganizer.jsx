import React, { useState, useEffect } from "react";
import { getCampuses } from "../../services/campusService";
import { createEventOrganizer } from "../../services/userService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useSnackbar } from "notistack";

export default function CreateEventOrganizer(){
  const [campuses, setCampuses] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    campusId: 0,
    dateOfBirth: "",
    gender: true,
    phoneNumber: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      await createEventOrganizer(formData, token);
      enqueueSnackbar("Task created successfully!", { variant: "success" });
    } catch (error) {
        enqueueSnackbar("Error creating Event Organizer!", { variant: "error" });
    }
  };

  return (
    <>
    <Header></Header>
    <div style={{marginTop:'100px'}}>
      <h1>Create Event Organizer</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value={true}>Male</option>
            <option value={false}>Female</option>
          </select>
        </div>

        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Campus:</label>
          <select
            name="campusId"
            value={formData.campusId}
            onChange={handleInputChange}
          >
            <option value={0}>Select Campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.campusName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
    <Footer></Footer>
    </>
  );
};

