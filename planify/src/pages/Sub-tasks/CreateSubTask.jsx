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
  const [error, setError] = useState(null);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!subTask.subTaskName.trim()) {
      enqueueSnackbar("Vui lòng nhập tên SubTask!", { variant: "warning" });
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
      enqueueSnackbar("SubTask đã được tạo thành công!", {
        variant: "success",
      });
      //   navigate(`/task/${fixedTaskId}`);
    } catch (errorResponse) {
      console.error("❌ API lỗi:", errorResponse);
      setError(errorResponse.errors || { message: "Đã có lỗi xảy ra!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="create-subtask-container">
        <h2 className="text-center mt-4">Tạo SubTask</h2>

        {error && (
          <Alert variant="danger">
            <h5>Lỗi khi tạo SubTask</h5>
            <ul>
              {typeof error === "object"
                ? Object.entries(error).map(([field, messages]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {messages.join(", ")}
                    </li>
                  ))
                : error.message}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="subtask-form">
          <Form.Group className="mb-3">
            <Form.Label>Tên SubTask</Form.Label>
            <Form.Control
              type="text"
              name="subTaskName"
              value={subTask.subTaskName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="subTaskDescription"
              value={subTask.subTaskDescription}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thời gian bắt đầu</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startTime"
              value={subTask.startTime}
              onChange={handleChange}
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
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngân sách</Form.Label>
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
                <Spinner animation="border" size="sm" className="me-2" /> Đang
                tạo...
              </>
            ) : (
              "Tạo SubTask"
            )}
          </Button>
        </Form>
      </Container>
      <Footer />
    </>
  );
};

export default CreateSubTask;
