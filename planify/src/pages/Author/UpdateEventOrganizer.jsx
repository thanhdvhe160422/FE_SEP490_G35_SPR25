import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCampuses } from "../../services/campusService";
import { getProfileById,updateEventOrganizer } from "../../services/userService";
import { useSnackbar } from "notistack";

const UpdateEventOrganizer = () => {
    const { userId } = useParams();
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
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userId) return;
  
        setLoading(true);
        const response = await getProfileById(userId, token);
        const userProfile = response.data;

        if (userProfile) {
          setFormData({
            email: userProfile.email || "",
            firstName: userProfile.firstName || "",
            lastName: userProfile.lastName || "",
            campusId: userProfile.campusId || 0,
            dateOfBirth: userProfile.dateOfBirth || "",
            gender: userProfile.gender || true,
            phoneNumber: userProfile.phoneNumber || "",
          });
        }
  
        setLoading(false);
      } catch (error) {
        console.log("Error fetching user profile:", error);
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [userId]);

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
      await updateEventOrganizer(formData, token);
      enqueueSnackbar("Event Organizer updated successfully!", {variant: "success",});
    } catch (error) {
      enqueueSnackbar("Error updating Event Organizer!", {variant: "error",});
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
    <div>
      <h1>Update Event Organizer</h1>
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

        <div hidden>
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
          <button type="submit">Update</button>
        </div>
      </form>
    </div>
    </>
  );
};

export default UpdateEventOrganizer;
