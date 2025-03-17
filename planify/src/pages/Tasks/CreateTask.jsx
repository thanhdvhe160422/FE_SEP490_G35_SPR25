import { useState } from "react";
import "../../styles/Tasks/CreateTask.css";
import { useSnackbar } from "notistack";
import { createTaskAPI } from "../../services/taskService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useParams } from 'react-router-dom';

export default function CreateTask() {
  const { enqueueSnackbar } = useSnackbar();
  const [taskName, setTaskName] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [amountBudget, setAmountBudget] = useState("");
  const { groupId } = useParams();
  const currentDate = new Date();
  const createDate = currentDate.toISOString();
  const startTime = currentDate.toISOString();
  const organizerId = localStorage.getItem("userId");
  const handleCreateTask = async () => {
    if (
      !taskName ||
      !deadlineDate ||
      !deadlineTime ||
      !taskDescription ||
      !amountBudget
    ) {
      enqueueSnackbar("Vui lòng nhập đầy đủ thông tin!", { variant: "error" });
      return;
    }
    
    const taskData = {
      groupId,
      taskName,
      deadline: `${deadlineDate}T${deadlineTime}`,
      taskDescription,
      amountBudget: parseFloat(amountBudget.replace(/,/g, "")),
      createDate,
      startTime,
      organizerId,
      status: 1,
      progress: 0,
    };

    try {
      const token = localStorage.getItem('token');
      console.log(taskData.budget);
      await createTaskAPI(taskData,token);
      enqueueSnackbar("Task đã được tạo thành công!", { variant: "success" });

      setTaskName("");
      setDeadlineDate("");
      setDeadlineTime("");
      setTaskDescription("");
      setAmountBudget("");
    } catch (error) {
      enqueueSnackbar("Lỗi khi tạo task!", { variant: "error" });
    }
  };

  return (
    <>
      <Header></Header>
      <div className="task-container">
        <h3 className="task-title">Create Task </h3>
        <div className="task-form">
          <label>Tên Task</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Nhập tên task"
            className="task-input"
          />

          <label>Deadline</label>
          <div className="task-deadline">
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="task-input"
            />
            <input
              style={{ marginTop: "10px" }}
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="task-input"
            />
          </div>

          <label>Mô tả</label>
          <textarea
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Nhập mô tả task"
            className="task-textarea"
          ></textarea>

          <label>Ngân sách (VNĐ)</label>
          <input
            type="text"
            value={amountBudget}
            onChange={(e) =>
              setAmountBudget(
                e.target.value
                  .replace(/\D/g, "")
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              )
            }
            placeholder="Nhập ngân sách"
            className="task-input"
          />

          <button className="task-button" onClick={handleCreateTask}>
            Tạo Task
          </button>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
