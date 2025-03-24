import { useState,useEffect } from "react";
import "../../styles/Tasks/CreateTask.css";
import { useSnackbar } from "notistack";
import { updateTask,getTaskById } from "../../services/taskService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateTask() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  useEffect(() => {
    const fetchData = async ()=>{
                try{
                    const token = localStorage.getItem('token');
                    const data = await getTaskById(id,token);
                    if (data?.error === "expired") {
                        navigate("/login");
                    }
                    const task = data.data;
                    setTaskName(task.taskName);
                    const datePart = task.deadline.split('T')[0];
                    const timePart = task.deadline.split('T')[1];
                    setDeadlineDate(datePart);
                    setDeadlineTime(timePart);
                    setTaskDescription(task.taskDescription);
                    setAmountBudget(task.amountBudget);
                }catch (error) {
                    enqueueSnackbar("Error get task information!", { variant: "error" });
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();
  }, [id]);
  const handleUpdateTask = async () => {
    if (
      !taskName ||
      !deadlineDate ||
      !deadlineTime ||
      !taskDescription ||
      !amountBudget
    ) {
      enqueueSnackbar("Please enter complete information!", {
        variant: "error",
      });
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
      const token = localStorage.getItem("token");
      await updateTask(id,taskData, token);
      enqueueSnackbar("Task updated successfully!", { variant: "success" });
      navigate(`/group-detail/${groupId}`);
      setTaskName("");
      setDeadlineDate("");
      setDeadlineTime("");
      setTaskDescription("");
      setAmountBudget("");
    } catch (error) {
      enqueueSnackbar("Error creating task!", { variant: "error" });
    }
  };

  return (
    <>
      <Header></Header>
      <div className="task-container">
        <h3 className="task-title">Create Task </h3>
        <div className="task-form">
          <label>Task Name</label>
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
              min={new Date().toISOString().slice(0, 16)}
            />
            <input
              style={{ marginTop: "10px" }}
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="task-input"
            />
          </div>

          <label>Discription</label>
          <textarea
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Nhập mô tả task"
            className="task-textarea"
          ></textarea>

          <label>Budget (VNĐ)</label>
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
            className="task-input"
          />
          <button className="task-button" onClick={handleUpdateTask}>
            Create Task
          </button>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
