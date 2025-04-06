import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // Thêm thư viện này
import { getCampuses } from "../../services/campusService";
import { createEventOrganizer } from "../../services/userService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useSnackbar } from "notistack";
import "../../styles/Author/CreateEOG.css";

export default function CreateEventOrganizer() {
  const [campuses, setCampuses] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      campusId: 0,
      dateOfBirth: "",
      gender: true,
      phoneNumber: "",
    },
  });

  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("No token found. Please log in.", { variant: "error" });
      return;
    }

    try {
      await createEventOrganizer(data, token);
      enqueueSnackbar("Event Organizer created successfully!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Error creating Event Organizer!", { variant: "error" });
    }
  };

  return (
    <>
      <Header />
      <div className="create-organizer-container">
        <h1>Create Event Organizer</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="organizer-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              {...register("firstName", {
                required: "First Name is required",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "First Name can only contain letters and spaces",
                },
                maxLength: {
                  value: 50,
                  message: "First Name cannot exceed 50 characters",
                },
              })}
            />
            {errors.firstName && (
              <span className="error">{errors.firstName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              {...register("lastName", {
                required: "Last Name is required",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Last Name can only contain letters and spaces",
                },
                maxLength: {
                  value: 50,
                  message: "Last Name cannot exceed 50 characters",
                },
              })}
            />
            {errors.lastName && (
              <span className="error">{errors.lastName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              {...register("dateOfBirth", {
                required: "Date of Birth is required",
                validate: (value) => {
                  const dob = new Date(value);
                  const today = new Date();
                  const age = today.getFullYear() - dob.getFullYear();
                  return age >= 18 || "You must be at least 18 years old";
                },
              })}
            />
            {errors.dateOfBirth && (
              <span className="error">{errors.dateOfBirth.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Gender:</label>
            <select {...register("gender")}>
              <option value={true}>Male</option>
              <option value={false}>Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              {...register("phoneNumber", {
                required: "Phone Number is required",
                pattern: {
                  value: /^0\d{9,10}$/,
                  message: "Phone Number must be 10-11 digits starting with 0",
                },
              })}
            />
            {errors.phoneNumber && (
              <span className="error">{errors.phoneNumber.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Campus:</label>
            <select
              {...register("campusId", {
                validate: (value) => value !== "0" || "Please select a campus",
              })}
            >
              <option value="0">Select Campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.campusName}
                </option>
              ))}
            </select>
            {errors.campusId && (
              <span className="error">{errors.campusId.message}</span>
            )}
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn">
              Create
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
