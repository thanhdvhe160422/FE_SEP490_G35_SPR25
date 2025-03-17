import React, { useEffect, useState } from "react";
import { getGroupDetails } from "../../services/groupService";
import { getGroupTasks } from "../../services/taskService";
import "../../styles/Group/GroupDetail.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useParams } from "react-router-dom";
function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGroupDetails(id);
        if (data && data.length > 0) {
          const selectedGroup = data[0];
          setGroup(selectedGroup);

          console.log("Group Details:", selectedGroup);

          const tasksData = await getGroupTasks(selectedGroup.id);
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
          <h1>Group: {group?.groupName}</h1>
          <div className="member-list">
            {group?.joinGroups?.map((join) => {
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
            })}
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
                <th>Assign</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.taskName}</td>
                    <td>{task.status === 1 ? "✅ Completed" : "❌ Pending"}</td>
                    <td>{task.deadline || "N/A"}</td>
                    <td>Unassigned</td>
                    <td>${task.amountBudget || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No tasks available</td>
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
