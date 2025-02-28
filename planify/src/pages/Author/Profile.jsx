import React, { useEffect, useState } from "react";
import "../../styles/Profile.css";
import { useNavigate } from "react-router";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {

        const userRes = await fetch("http://localhost:4000/users/2");

        const userData = await userRes.json();

        const wardRes = await fetch(`http://localhost:4000/wards/${userData.wardId}`);
        const wardData = await wardRes.json();

        const districtRes = await fetch(`http://localhost:4000/districts/${userData.districtId}`);
        const districtData = await districtRes.json();

        const provinceRes = await fetch(`http://localhost:4000/provinces/${userData.provinceId}`);
        const provinceData = await provinceRes.json();

        const fullAddress = `${wardData.name}, ${districtData.name}, ${provinceData.name}`;

        setUser(userData);
        setAddress(fullAddress);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data found</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src={user.avatar} alt="Avatar" className="profile-avatar" />
        <h2>{user.firstName} {user.lastName}</h2>
        <p className="profile-email">{user.email}</p>
      </div>
      <div className="profile-form">
        <h2>Profile Infomation</h2>
        <form>
          <div className="input-group">
            <label>First Name</label>
            <input type="text" defaultValue={user.firstName} readOnly/>
            <label>Last Name</label>
            <input type="text" defaultValue={user.lastName} readOnly/>
          </div>
          <label>Phone Number</label>
          <input type="text" defaultValue={user.phoneNumber} readOnly/>
          <label>Address</label>
          <input type="text" defaultValue={address} readOnly />
          <label>Email</label>
          <input type="email" defaultValue={user.email} readOnly/>
        </form>
        <button onClick={() => navigate("/editprofile")}>Edit Profile</button>
      </div>

    </div>
  );
};

export default Profile;
