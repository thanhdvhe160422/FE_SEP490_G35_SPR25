import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupDetails,
  updateGroup,
  addImplementer,
} from "../../services/GroupService";
import Swal from "sweetalert2";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import axios from "axios";

function UpdateGroup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isValidMember, setIsValidMember] = useState(false);
  const [selectedImplementers, setSelectedImplementers] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      const data = await getGroupDetails(id);
      if (data && !data.error) {
        setGroup(data);
      } else if (data?.error === "expired") {
        Swal.fire("Error", "Session expired. Please login again.", "error");
        navigate("/login");
      }
      setLoading(false);
    };

    fetchGroup();
  }, [id, navigate]);
  const handleSelectImplementer = (user) => {
    if (!user || !user.id) {
      console.error("❌ User không hợp lệ:", user);
      return;
    }

    if (!selectedImplementers.some((impl) => impl.id === user.id)) {
      setSelectedImplementers((prev) => [...prev, user]);
    }
  };

  const handleRemoveImplementer = (id) => {
    setSelectedImplementers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleNewMemberChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setIsValidMember(false);
      return;
    }

    let token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `https://localhost:44320/api/Users/search?input=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const filteredUsers = response.data || [];
      const currentGroupMembers = group?.joinGroups || [];

      const availableUsers = filteredUsers.filter(
        (user) => !currentGroupMembers.some((member) => member.id === user.id)
      );

      setSuggestions(availableUsers);
      setIsValidMember(availableUsers.length > 0);
    } catch (error) {
      console.error("Lỗi khi tìm implementer:", error.response?.data);
      setSuggestions([]);
      setIsValidMember(false);
    }
  };

  const handleUpdate = async () => {
    if (!group || !group.groupName.trim()) {
      Swal.fire("Warning", "Group name cannot be empty!", "warning");
      return;
    }

    setUpdating(true);

    const updatedGroup = {
      id: group.id,
      groupName: group.groupName,
      eventId: group.eventId,
      createBy: group.createByNavigation.id,
      amountBudget: group.amountBudget,
      joinGroups: group.joinGroups,
    };
    console.log("id manager:", group.createBy.id);

    const result = await updateGroup(id, updatedGroup);
    setUpdating(false);

    if (result && !result.error) {
      Swal.fire("Success", "Group updated successfully!", "success").then(() =>
        navigate(`/group-detail/${id}`)
      );
    } else if (result?.error === "expired") {
      Swal.fire("Error", "Session expired. Please login again.", "error");
      navigate("/login");
    }
  };
  const handleAddImplementer = async () => {
    if (selectedImplementers.length === 0) {
      Swal.fire(
        "Warning",
        "Please select at least one implementer!",
        "warning"
      );
      return;
    }

    const validImplementers = selectedImplementers.filter(
      (user) => user && user.id
    );

    if (validImplementers.length === 0) {
      Swal.fire("Error", "No valid implementers to add!", "error");
      return;
    }

    const requestData = {
      implementerIds: validImplementers.map((user) => user.id),
      groupId: group.id,
    };

    console.log("📤 Gửi request đến API:", requestData);

    try {
      const result = await addImplementer(requestData);
      if (result && !result.error) {
        Swal.fire("Success", "Implementers added successfully!", "success");

        setGroup((prev) => ({
          ...prev,
          joinGroups: [
            ...prev.joinGroups,
            ...validImplementers.map((impl) => ({ implementer: impl })),
          ],
        }));

        setSelectedImplementers([]); // Xóa danh sách sau khi thêm thành công
      } else {
        Swal.fire("Error", "Failed to add implementers.", "error");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi thêm implementer:",
        error.response?.data || error
      );
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  if (loading) return <p>Loading group data...</p>;
  if (!group) return <p>Error: Group data not found.</p>;

  return (
    <>
      <Header></Header>
      <div style={{marginTop:'90px'}} className="update-group-container">
        <h2 className="update-group-title">Update Group</h2>
        <div className="form-group">
          <label className="form-label">Group Name:</label>
          <input
            type="text"
            className="form-input"
            value={group?.groupName || ""}
            onChange={(e) => setGroup({ ...group, groupName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount Budget:</label>
          <input
            type="text"
            className="form-input"
            value={group?.amountBudget?.toLocaleString("en-US") || ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, "");
              const numberValue = Number(rawValue);
              if (!isNaN(numberValue)) {
                setGroup({ ...group, amountBudget: numberValue });
              }
            }}
          />
        </div>
        <div className="group-members">
          <h3 className="members-title">Join Groups</h3>
          {group?.joinGroups?.length > 0 ? (
            group.joinGroups.map((member) => (
              <div key={member.id} className="member-item">
                <span className="member-text">
                  {member.implementer.firstName} {member.implementer.lastName} (
                  {member.implementer.email})
                </span>
              </div>
            ))
          ) : (
            <p className="no-members-text">No members in this group.</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Search Implementer:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search implementer..."
            value={searchTerm}
            onChange={handleNewMemberChange}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((user) =>
                user ? (
                  <li
                    key={user.id}
                    onClick={() => {
                      if (user && user.id) {
                        handleSelectImplementer(user);
                      }
                    }}
                  >
                    {user.firstName} {user.lastName} ({user.email})
                  </li>
                ) : null
              )}
            </ul>
          )}

          {!isValidMember && searchTerm && (
            <p className="error-text">No implementers found.</p>
          )}
        </div>
        <div className="selected-implementers">
          <h3>Selected Implementers:</h3>
          {selectedImplementers.length > 0 ? (
            selectedImplementers.map((user) => (
              <div key={user.id} className="selected-user">
                <span>
                  {user.firstName} {user.lastName} ({user.email})
                </span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveImplementer(user.id)}
                >
                  X
                </button>
              </div>
            ))
          ) : (
            <p>No implementers selected.</p>
          )}
        </div>

        <button className="add-button" onClick={handleAddImplementer}>
          Add Implementer
        </button>

        <button
          className="update-button"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </div>
      <Footer></Footer>
    </>
  );
}

export default UpdateGroup;
