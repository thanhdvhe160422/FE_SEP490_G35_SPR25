import { useState } from "react";
import "../../styles/Tasks/CreateTask.css";
import { useSnackbar } from "notistack";
import { createTaskAPI } from "../../services/taskService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function CreateTask() {
  const { enqueueSnackbar } = useSnackbar();
  const [taskName, setTaskName] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  const handleCreateTask = async () => {
    if (
      !taskName ||
      !deadlineDate ||
      !deadlineTime ||
      !description ||
      !budget
    ) {
      enqueueSnackbar("Vui lòng nhập đầy đủ thông tin!", { variant: "error" });
      return;
    }

    const taskData = {
      taskName,
      deadline: `${deadlineDate}T${deadlineTime}`,
      description,
      budget: parseFloat(budget.replace(/,/g, "")),
    };

    try {
      await createTaskAPI(taskData);
      enqueueSnackbar("Task đã được tạo thành công!", { variant: "success" });

      // Reset form
      setTaskName("");
      setDeadlineDate("");
      setDeadlineTime("");
      setDescription("");
      setBudget("");
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả task"
            className="task-textarea"
          ></textarea>

          <label>Ngân sách (VNĐ)</label>
          <input
            type="text"
            value={budget}
            onChange={(e) =>
              setBudget(
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
