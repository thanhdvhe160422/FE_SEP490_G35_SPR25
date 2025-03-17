import React, { useState } from "react";
import { Form, Button, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { createSubTask } from "../../services/subTaskService";
import "../../styles/Sub-tasks/CreateSubTask.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const CreateSubTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const fixedTaskId = taskId ? parseInt(taskId) : 1;
  const [loading, setLoading] = useState(false);
  const [subTask, setSubTask] = useState({
    subTaskName: "",
    subTaskDescription: "",
    startTime: "",
    deadline: "",
    amountBudget: "",
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubTask({ ...subTask, [name]: value });
  };
  const validateTime = () => {
    const now = new Date().toISOString().slice(0, 16);

    if (subTask.startTime && subTask.startTime < now) {
      enqueueSnackbar("Start time must be greater than current!", {
        variant: "error",
      });
      return false;
    }

    if (
      subTask.startTime &&
      subTask.deadline &&
      subTask.deadline <= subTask.startTime
    ) {
      enqueueSnackbar("Deadline must be greater than start time!", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!subTask.subTaskName.trim()) {
      enqueueSnackbar("Please enter SubTask name!", { variant: "warning" });
      setLoading(false);
      return;
    }
    if (!validateTime()) {
      setLoading(false);
      return;
    }

    const requestData = {
      subTaskName: subTask.subTaskName,
      subTaskDescription: subTask.subTaskDescription,
      startTime: subTask.startTime,
      deadline: subTask.deadline,
      amountBudget: parseFloat(subTask.amountBudget) || 0,
      status: 0,
      taskId: fixedTaskId,
      implementerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };

    console.log(
      "📤 Dữ liệu gửi lên API:",
      JSON.stringify(requestData, null, 2)
    );

    try {
      await createSubTask(requestData, token);
      enqueueSnackbar("SubTask created successfully!", {
        variant: "success",
      });
      //   navigate(`/task/${fixedTaskId}`);
    } catch (errorResponse) {
      console.error("❌ API lỗi:", errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="create-subtask-container">
        <h2 className="text-center mt-4">Create SubTask</h2>

        <Form onSubmit={handleSubmit} className="subtask-form">
          <Form.Group className="mb-3">
            <Form.Label>SubTask name</Form.Label>
            <Form.Control
              type="text"
              name="subTaskName"
              value={subTask.subTaskName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Discription</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="subTaskDescription"
              value={subTask.subTaskDescription}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startTime"
              value={subTask.startTime}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="datetime-local"
              name="deadline"
              value={subTask.deadline}
              onChange={handleChange}
              min={subTask.startTime || new Date().toISOString().slice(0, 16)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Budget</Form.Label>
            <Form.Control
              type="number"
              name="amountBudget"
              value={subTask.amountBudget}
              onChange={handleChange}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100 d-flex align-items-center justify-content-center"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Loading...
              </>
            ) : (
              "Create SubTask"
            )}
          </Button>
        </Form>
      </Container>
      <Footer />
    </>
  );
};

export default CreateSubTask;
