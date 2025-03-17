import React, { useEffect, useState } from "react";
import { getGroupDetails } from "../../services/groupService";
import { getGroupTasks } from "../../services/taskService";
import "../../styles/Group/GroupDetail.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGroupDetails(id);
        if (data?.error === "expired") {
          Swal.fire("Login session expired", "Please log in again.", "error");
          navigate("/login");
        } else if (data) {
          setGroup(data);
        }
        if (data) {
          setGroup(data);
          console.log("Group Details:", data);

          const tasksData = await getGroupTasks(data.id);
          console.log("Tasks Data:", tasksData);

          if (Array.isArray(tasksData)) {
            setTasks(tasksData);
          } else {
            console.error("Invalid task data format", tasksData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <Header />
      <div className="group-detail-container">
        <div className="group-detail-member">
          <h1>Group: {group?.groupName || "N/A"}</h1>
          <div className="member-list">
            {group?.joinGroups?.length > 0 ? (
              group.joinGroups.map((join) => {
                const member = join.implementer;
                return (
                  <div className="item-member" key={member.id}>
                    <img
                      src="/default-avatar.png"
                      alt={member.firstName}
                      className="avatar"
                    />
                    <span className="member-name">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                );
              })
            ) : (
              <p>No members available</p>
            )}
          </div>
        </div>

        <div className="list-task">
          <h2>Task List</h2>
          <table className="task-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Name Task</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th>Assign</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {group?.tasks?.length > 0 ? (
                group.tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    onClick={() => navigate(`/task-detail/${task.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{task.taskName}</td>
                    <td>{task.status === 1 ? "✅ Completed" : "❌ Pending"}</td>
                    <td>{task.deadline || "N/A"}</td>
                    <td>
                      <div style={{ width: 50, height: 50 }}>
                        <CircularProgressbar
                          value={task.progress * 100}
                          text={`${Math.round(task.progress * 100)}%`}
                          styles={buildStyles({
                            textSize: "30px",
                            pathColor: `rgba(62, 152, 199, ${task.progress})`,
                            textColor: "#333",
                            trailColor: "#d6d6d6",
                          })}
                        />
                      </div>
                    </td>
                    <td></td>
                    <td>
                      {task.amountBudget.toLocaleString("vi-VN") || "N/A"} VNĐ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No tasks available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default GroupDetail;
