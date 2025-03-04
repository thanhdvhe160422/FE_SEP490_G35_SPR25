import React, { useEffect, useState } from "react";
import { getGroupDetails } from "../../services/groupService";
import { getGroupTasks } from "../../services/taskService";
import "../../styles/Group/GroupDetail.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function GroupDetail() {
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGroupDetails();
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
  }, []);

  return (
    <>
      <Header />
      <div className="group-detail-container">
        <div className="group-detail-member">
          <h1>Group: {group?.name}</h1>
          <div className="member-list">
            {group?.members?.map((member) => (
              <div className="item-member" key={member.id}>
                <img src={member.avatar} alt={member.name} className="avatar" />
                <span className="member-name">{member.name}</span>
                {member.isLeader && <span className="leader-badge">⭐</span>}
              </div>
            ))}
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
                tasks.map((task, index) => {
                  // Tìm danh sách người được assign dựa vào danh sách ID
                  const assignees = group?.members?.filter((member) =>
                    task.assignedTo?.includes(member.id)
                  );

                  return (
                    <tr key={task.id}>
                      <td>{index + 1}</td>
                      <td>{task.title}</td>
                      <td>{task.completed ? "✅ Completed" : "❌ Pending"}</td>
                      <td>{task.deadline || "N/A"}</td>
                      <td>
                        {assignees.length > 0 ? (
                          <div className="assignee-list">
                            {assignees.map((assignee) => (
                              <div key={assignee.id} className="assignee">
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className="assignee-avatar"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          "Unassigned"
                        )}
                      </td>
                      <td>${task.budget || "N/A"}</td>
                    </tr>
                  );
                })
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
