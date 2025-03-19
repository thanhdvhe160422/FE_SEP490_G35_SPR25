import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupDetails,
  updateGroup,
  addImplementer,
} from "../../services/groupService";
import Swal from "sweetalert2";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

function UpdateGroup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newImplementerEmail, setNewImplementerEmail] = useState("");

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
    if (!newImplementerEmail.trim()) {
      Swal.fire("Warning", "Please enter an implementer's email!", "warning");
      return;
    }

    const result = await addImplementer(id, newImplementerEmail);
    if (result && !result.error) {
      Swal.fire("Success", "Implementer added successfully!", "success");
      setGroup((prev) => ({
        ...prev,
        joinGroups: [...prev.joinGroups, result],
      }));
      setNewImplementerEmail("");
    } else {
      Swal.fire("Error", "Failed to add implementer.", "error");
    }
  };

  if (loading) return <p>Loading group data...</p>;
  if (!group) return <p>Error: Group data not found.</p>;

  return (
    <>
      <Header></Header>
      <div className="update-group-container">
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
          <label className="form-label">Add Implementer:</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter implementer email"
            value={newImplementerEmail}
            onChange={(e) => setNewImplementerEmail(e.target.value)}
          />
          <button className="add-button" onClick={handleAddImplementer}>
            Add Implementer
          </button>
        </div>
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
