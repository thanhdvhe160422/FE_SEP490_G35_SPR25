import React, { useEffect, useState } from "react";
import "../../styles/Profile.css";
import { useNavigate } from "react-router";

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("http://localhost:4000/users/2");
        const userData = await userRes.json();

        const wardRes = await fetch(
          `http://localhost:4000/wards/${userData.wardId}`
        );
        const wardData = await wardRes.json();

        const districtRes = await fetch(
          `http://localhost:4000/districts/${userData.districtId}`
        );
        const districtData = await districtRes.json();

        const provinceRes = await fetch(
          `http://localhost:4000/provinces/${userData.provinceId}`
        );
        const provinceData = await provinceRes.json();

        setUser(userData);
        setWard(wardData.name);
        setDistrict(districtData.name);
        setProvince(provinceData.name);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await fetch("http://localhost:4000/users/2", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      alert("Profile updated!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data found</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src={user.avatar} alt="Avatar" className="profile-avatar" />
        <h2>
          {user.firstName} {user.lastName}
        </h2>
        <p className="profile-email">{user.email}</p>
      </div>
      <div className="profile-form">
        <h2>Update Profile</h2>
        <form>
          <div className="input-group">
            <label>First Name</label>
            <input type="text" defaultValue={user.firstName} />
            <label>Last Name</label>
            <input type="text" defaultValue={user.lastName} />
          </div>
          <label>Phone Number</label>
          <input type="text" defaultValue={user.phoneNumber} />
          <label>Ward</label>
          <input type="text" defaultValue={ward} />
          <label>District</label>
          <input type="text" defaultValue={district} />
          <label>Province</label>
          <input type="text" defaultValue={province} />
          <label>Email</label>
          <input type="email" defaultValue={user.email} disabled />
        </form>

        <div
          className="button"
          style={{ display: "flex", justifyContent: "center", gap: "30px" }}
        >
          <button
            className="btn btn-danger"
            style={{ width: "20%" }}
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            style={{ width: "20%" }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
