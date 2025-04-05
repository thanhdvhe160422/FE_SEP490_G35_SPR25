import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Spin,
  Card,
  Typography,
  Popconfirm,
  DatePicker,
  InputNumber,
  Empty,
  Tooltip,
  Drawer,
  List,
  Checkbox,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import "../styles/Tasks/ListTask.css";
import { createTaskAPI, updateTask, deleteTask } from "../services/taskService";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

function ListTask({ eventId, data }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubTaskModalVisible, setIsSubTaskModalVisible] = useState(false);
  const [subTaskForm] = Form.useForm();
  const [isSubTaskSubmitting, setIsSubTaskSubmitting] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subTasksVisible, setSubTasksVisible] = useState(false);
  const [subTasks, setSubTasks] = useState([]);
  const [loadingSubTasks, setLoadingSubTasks] = useState(false);
  const [isEditSubTaskModalVisible, setIsEditSubTaskModalVisible] =
    useState(false);
  const [editSubTaskForm] = Form.useForm();
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [isEditSubTaskSubmitting, setIsEditSubTaskSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const userId = localStorage.getItem("userId");
  const showEditSubTaskModal = (subTask) => {
    setSelectedSubTask(subTask);
    editSubTaskForm.setFieldsValue({
      subTaskName: subTask.subTaskName,
      subTaskDescription: subTask.subTaskDescription,
      startTime: subTask.startTime ? moment(subTask.startTime) : null,
      deadline: subTask.deadline ? moment(subTask.deadline) : null,
      amountBudget: subTask.amountBudget,
    });
    setIsEditSubTaskModalVisible(true);
  };
  const updateSubTask = async (values) => {
    try {
      setIsEditSubTaskSubmitting(true);

      const token = localStorage.getItem("token");
      const updatedSubTaskData = {
        subTaskName: values.subTaskName,
        subTaskDescription: values.subTaskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        status: selectedSubTask.status,
      };

      await axios.put(
        `https://localhost:44320/api/SubTasks/update/${selectedSubTask.id}`,
        updatedSubTaskData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "Update Sub-Task Successful!",
        icon: "success",
        draggable: true,
      });
      setIsEditSubTaskModalVisible(false);

      fetchTasksFromAPI().then(() => {
        const updatedTask = tasks.find((task) => task.id === selectedTask.id);
        if (updatedTask) {
          showSubTasks(updatedTask);
        }
      });

      return true;
    } catch (error) {
      console.error("Error updating subtask:", error);
      message.error("Không thể cập nhật công việc con");
      return false;
    } finally {
      setIsEditSubTaskSubmitting(false);
    }
  };
  useEffect(() => {
    if (data && data.tasks && Array.isArray(data.tasks)) {
      console.log("Using tasks data from props:", data.tasks);
      setTasks(data.tasks);
      setLoading(false);
    } else if (eventId) {
      fetchTasksFromAPI();
    } else {
      setLoading(false);
      setTasks([]);
    }
  }, [eventId, data]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const activeTasksOnly = tasks.filter((task) => task.status !== 0);
      setFilteredTasks(activeTasksOnly);
      setPagination((prev) => ({
        ...prev,
        total: activeTasksOnly.length,
      }));
    } else {
      setFilteredTasks([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    }
  }, [tasks]);

  useEffect(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    setDisplayedTasks(paginatedTasks);
  }, [filteredTasks, pagination.current, pagination.pageSize]);

  const fetchTasksFromAPI = async () => {
    setReloading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.result) {
        const tasksData = response.data.result.tasks || [];
        setTasks(tasksData);
        if (!loading) {
          message.success("Đã tải lại danh sách công việc thành công");
        }
        return tasksData;
      } else {
        setTasks([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Không thể tải danh sách công việc");
      setError("Không thể tải danh sách công việc");
      return [];
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };
  const createSubTask = async (values) => {
    try {
      setIsSubTaskSubmitting(true);

      const token = localStorage.getItem("token");
      const newSubTaskData = {
        subTaskName: values.subTaskName,
        subTaskDescription: values.subTaskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        taskId: selectedTask.id,
      };

      await axios.post(
        "https://localhost:44320/api/SubTasks/create",
        newSubTaskData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "Create Sub-Task Success!",
        icon: "success",
        draggable: true,
      });
      subTaskForm.resetFields();
      setIsSubTaskModalVisible(false);
      const updatedTasks = await fetchTasksFromAPI();
      if (updatedTasks && updatedTasks.length > 0) {
        const refreshedTask = updatedTasks.find(
          (task) => task.id === selectedTask.id
        );
        if (refreshedTask) {
          setSelectedTask(refreshedTask);
          showSubTasks(refreshedTask);
        }
      }

      return true;
    } catch (error) {
      console.error("Error creating subtask:", error);
      message.error("Không thể tạo công việc con");
      return false;
    } finally {
      setIsSubTaskSubmitting(false);
    }
  };

  const showCreateSubTaskModal = () => {
    subTaskForm.resetFields();
    setIsSubTaskModalVisible(true);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const showCreateModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setSelectedTask(null);
    setIsTaskModalVisible(true);
  };

  const showEditModal = (task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    form.setFieldsValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      startTime: task.startTime ? moment(task.startTime) : null,
      deadline: task.deadline ? moment(task.deadline) : null,
      amountBudget: task.amountBudget,
    });
    setIsTaskModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalVisible(false);
  };

  const createTask = async (values) => {
    try {
      setIsSubmitting(true);
      setReloading(true);

      const newTaskData = {
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        eventId: eventId,
        status: 1,
      };

      await createTaskAPI(newTaskData);
      Swal.fire({
        title: "Create Task Successfully!",
        icon: "success",
        draggable: true,
      });
      handleCloseModal();

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Không thể tạo công việc mới");
      setReloading(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskData = async (values) => {
    try {
      setIsSubmitting(true);
      setReloading(true);

      const updatedTaskData = {
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        eventId: eventId,
        status: 1,
      };

      await updateTask(selectedTask.id, updatedTaskData);
      Swal.fire({
        title: "Update Task Successfully!",
        icon: "success",
        draggable: true,
      });
      handleCloseModal();

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      message.error("Không thể cập nhật công việc");
      setReloading(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (taskId) => {
    try {
      setReloading(true);

      await deleteTask(taskId, -1);
      Swal.fire({
        title: "Delete Task Successfully!",
        icon: "success",
        draggable: true,
      });

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Không thể xóa công việc");
      setReloading(false);
      return false;
    }
  };

  const handleSubmit = (values) => {
    if (isEditMode) {
      updateTaskData(values);
    } else {
      createTask(values);
    }
  };

  const showSubTasks = (task) => {
    setSelectedTask(task);
    setLoadingSubTasks(true);
    setSubTasksVisible(true);

    if (task.subTasks && Array.isArray(task.subTasks)) {
      console.log("SubTasks original:", task.subTasks);

      const processedSubTasks = task.subTasks.map((subTask) => {
        console.log("Original subtask:", subTask);

        let status = 0;

        if (typeof subTask.status === "number") {
          status = subTask.status;
        } else if (
          subTask.status === true ||
          subTask.status === "true" ||
          subTask.status === "1" ||
          subTask.status === 1
        ) {
          status = 1;
        } else if (
          subTask.completed === true ||
          subTask.completed === "true" ||
          subTask.completed === "1" ||
          subTask.completed === 1
        ) {
          status = 1;
        }

        console.log(
          `Subtask ID: ${subTask.id}, Original status: ${subTask.status}, Processed status: ${status}`
        );

        return {
          ...subTask,
          status: status,
        };
      });

      console.log("Processed subtasks:", processedSubTasks);
      setSubTasks(processedSubTasks);
    } else {
      setSubTasks([]);
    }

    setLoadingSubTasks(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };
  const toggleSubTaskStatus = async (subTaskId, completed) => {
    try {
      const token = localStorage.getItem("token");
      const status = completed ? 1 : 0;

      await axios.put(
        `https://localhost:44320/api/SubTasks/update-status/${subTaskId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubTasks((prev) =>
        prev.map((item) =>
          item.id === subTaskId ? { ...item, status: status } : item
        )
      );

      await fetchTasksFromAPI();

      if (selectedTask) {
        const updatedTask = tasks.find((task) => task.id === selectedTask.id);
        if (updatedTask) {
          showSubTasks(updatedTask);
        }
      }
    } catch (error) {
      console.error("Error updating subtask status:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const deleteSubTask = async (subTaskId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://localhost:44320/api/SubTasks/update-status/${subTaskId}`,
        { status: -1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubTasks((prev) => prev.filter((item) => item.id !== subTaskId));

      Swal.fire({
        title: "Delete subtask successfully",
        icon: "success",
        draggable: true,
      });

      fetchTasksFromAPI();
    } catch (error) {
      console.error("Error deleting subtask:", error);
      message.error("Không thể xóa công việc con");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: "5%",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Title",
      dataIndex: "taskName",
      key: "taskName",
      width: "15%",
      render: (text, record) => (
        <div>
          {text}
          {record.subTasks && record.subTasks.length > 0 && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.subTasks.length} Subtask
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: "25%",
      ellipsis: true,
      render: (text) => text || "No description",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      width: "12%",
      render: (text) => formatDate(text),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      width: "12%",
      render: (text, record) => {
        const isOverdue = text && new Date(text) < new Date();
        return (
          <span style={{ color: isOverdue ? "#ff4d4f" : "inherit" }}>
            {formatDate(text)}
          </span>
        );
      },
    },
    {
      title: "Budget",
      dataIndex: "amountBudget",
      key: "amountBudget",
      width: "13%",
      render: (text) => formatCurrency(text),
    },
    {
      title: "Action",
      key: "action",
      width: "18%",
      render: (_, record) => (
        <Space size="small" onClick={handleActionClick}>
          <Tooltip title="Display list subtasks">
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => showSubTasks(record)}
              size="small"
              className="details-button"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
            className="edit-button"
          />
          <Popconfirm
            title="Confirm task deletion"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="delete-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && !reloading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "15px" }}>Loading task list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "30px" }}>
        <Title level={4} style={{ color: "#ff4d4f" }}>
          {error}
        </Title>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={fetchTasksFromAPI}
        >
          Retry
        </Button>
      </div>
    );
  }

  const calculateProgress = (subTasks) => {
    if (!subTasks || subTasks.length === 0) return 0;

    const completedCount = subTasks.filter((task) => {
      return (
        task.status === 1 || task.status === true || task.completed === true
      );
    }).length;

    return Math.round((completedCount / subTasks.length) * 100);
  };

  return (
    <div className="task-management-container">
      <Card className="task-list-card">
        <div className="task-header">
          <Title level={3} className="task-title">
            List Task ({filteredTasks.length})
          </Title>

          <div className="task-actions">
            <Space>
              {userId === data.createdBy.id && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                  className="add-task-button"
                >
                  Create Task
                </Button>
              )}
            </Space>
          </div>
        </div>

        <Spin spinning={reloading} tip="Loading data...">
          {displayedTasks.length === 0 ? (
            <Empty
              image="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
              imageStyle={{ height: 120 }}
              description="No tasks yet"
            >
              {userId === data.createdBy.id && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                >
                  Create your first task
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              className="task-table"
              dataSource={displayedTasks}
              columns={columns}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong ${total} công việc`,
                pageSizeOptions: ["10", "20", "50"],
                hideOnSinglePage: displayedTasks.length <= 10,
              }}
              onChange={handleTableChange}
              locale={{
                emptyText: "No tasks available",
              }}
              rowClassName={(record) =>
                record.deadline && new Date(record.deadline) < new Date()
                  ? "overdue-row"
                  : ""
              }
              onRow={(record) => ({
                onClick: () => showSubTasks(record),
                style: { cursor: "pointer" },
              })}
            />
          )}
        </Spin>

        <Modal
          title={isEditMode ? "Update Task" : "Create New Task"}
          open={isTaskModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          className="task-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              taskName: "",
              taskDescription: "",
              startTime: null,
              deadline: null,
              amountBudget: 0,
            }}
          >
            <Form.Item
              name="taskName"
              label="Title"
              rules={[{ required: true, message: "Please enter title!" }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="taskDescription"
              label="Description"
              rules={[{ required: true, message: "Please enter description!" }]}
            >
              <TextArea rows={3} placeholder="Enter task description" />
            </Form.Item>

            <Form.Item
              name="startTime"
              label={
                <Space>
                  <CalendarOutlined /> Start Time
                </Space>
              }
              rules={[
                { required: true, message: "Please choose a start time!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime={{ format: "HH:mm" }}
                placeholder="Choose a start time"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                disabledTime={(selectedDate) => {
                  if (!selectedDate) return {};
                  const now = dayjs();
                  return selectedDate.isSame(now, "day")
                    ? {
                        disabledHours: () => [...Array(now.hour()).keys()],
                        disabledMinutes: (hour) =>
                          hour === now.hour()
                            ? [...Array(now.minute()).keys()]
                            : [],
                      }
                    : {};
                }}
              />
            </Form.Item>

            <Form.Item
              name="deadline"
              label={
                <Space>
                  <ClockCircleOutlined /> Deadline
                </Space>
              }
              dependencies={["startTime"]}
              rules={[
                { required: true, message: "Please choose a deadline!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue("startTime");
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startTime)) {
                      return Promise.reject(
                        new Error("Deadline must be after Start Time!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                showTime={{ format: "HH:mm" }}
                placeholder="Choose a deadline"
                disabledDate={(current) => {
                  const startTime = form.getFieldValue("startTime");
                  return startTime
                    ? current && current < startTime.startOf("day")
                    : false;
                }}
              />
            </Form.Item>

            <Form.Item name="amountBudget" label="Budget (VND)">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                controls={false}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => value.replace(/[^0-9]/g, "")}
                placeholder="Enter budget"
              />
            </Form.Item>

            <Form.Item>
              <Space className="form-actions" style={{ float: "right" }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Drawer
          title={
            <div>
              <div className="task-drawer-title">
                <span>Task details: {selectedTask?.taskName}</span>
                <Tag color="blue">
                  Complete: {calculateProgress(selectedTask?.subTasks)}%
                </Tag>
              </div>
              <div className="task-detail-info">
                <div>
                  <span className="detail-label">Start Time:</span>{" "}
                  {formatDate(selectedTask?.startTime)}
                </div>
                <div>
                  <span className="detail-label">Deadline:</span>{" "}
                  {formatDate(selectedTask?.deadline)}
                </div>
                {selectedTask?.amountBudget > 0 && (
                  <div>
                    <span className="detail-label">Budget:</span>{" "}
                    {formatCurrency(selectedTask?.amountBudget)}
                  </div>
                )}
              </div>
              {selectedTask?.taskDescription && (
                <div className="task-description">
                  <span className="detail-label">Description:</span>{" "}
                  {selectedTask.taskDescription}
                </div>
              )}
            </div>
          }
          placement="right"
          width={500}
          onClose={() => setSubTasksVisible(false)}
          open={subTasksVisible}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateSubTaskModal}
            >
              Create New
            </Button>
          }
        >
          <Modal
            title="Add new subtask"
            open={isSubTaskModalVisible}
            onCancel={() => setIsSubTaskModalVisible(false)}
            footer={null}
            className="subtask-modal"
          >
            <Form
              form={subTaskForm}
              layout="vertical"
              onFinish={createSubTask}
              initialValues={{
                subTaskName: "",
                subTaskDescription: "",
                startTime: null,
                deadline: null,
                amountBudget: 0,
              }}
            >
              <Form.Item
                name="subTaskName"
                label="Title"
                rules={[
                  {
                    required: true,
                    message: "Please enter a subtask title!",
                  },
                ]}
              >
                <Input placeholder="Enter subtask title" />
              </Form.Item>

              <Form.Item
                name="subTaskDescription"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: "Please enter a subtask description!",
                  },
                ]}
              >
                <TextArea rows={2} placeholder="Enter subtask description" />
              </Form.Item>

              <Form.Item
                name="startTime"
                label={
                  <Space>
                    <CalendarOutlined /> Start Time
                  </Space>
                }
                rules={[
                  { required: true, message: "Please choose a start time!" },
                ]}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                disabledTime={(selectedDate) => {
                  if (!selectedDate) return {};
                  const now = dayjs();
                  return selectedDate.isSame(now, "day")
                    ? {
                        disabledHours: () => [...Array(now.hour()).keys()],
                        disabledMinutes: (hour) =>
                          hour === now.hour()
                            ? [...Array(now.minute()).keys()]
                            : [],
                      }
                    : {};
                }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  showTime={{ format: "HH:mm" }}
                  placeholder="Choose a start time"
                />
              </Form.Item>

              <Form.Item
                name="deadline"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    Deadline
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: "Please choose a deadline!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startTime = getFieldValue("startTime");
                      if (!value || !startTime || value.isAfter(startTime)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Deadline must be after the start time")
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  showTime={{ format: "HH:mm" }}
                  placeholder="Choose a deadline"
                  disabledDate={(current) => {
                    const startTime = form.getFieldValue("startTime");
                    return startTime
                      ? current && current <= startTime.startOf("day")
                      : false;
                  }}
                />
              </Form.Item>

              <Form.Item name="amountBudget" label="Ngân sách (VND)">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập ngân sách"
                />
              </Form.Item>

              <Form.Item>
                <Space className="form-actions" style={{ float: "right" }}>
                  <Button onClick={() => setIsSubTaskModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubTaskSubmitting}
                  >
                    Create
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          <div className="sub-tasks-section">
            <Title level={5}>List Subtask ({subTasks.length})</Title>

            <Spin spinning={loadingSubTasks}>
              {!subTasks || subTasks.length === 0 ? (
                <Empty
                  description="No subtasks yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  className="sub-task-list"
                  itemLayout="horizontal"
                  dataSource={subTasks}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => {
                            showEditSubTaskModal(item);
                          }}
                        />,
                        <Popconfirm
                          title="Confirm deletion"
                          description="Are you sure you want to delete this subtask?"
                          onConfirm={() => deleteSubTask(item.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          icon={
                            <ExclamationCircleOutlined
                              style={{ color: "red" }}
                            />
                          }
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <div className="sub-task-item">
                        {item.status === 1 ? (
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<CheckOutlined />}
                            size="small"
                            style={{
                              backgroundColor: "#52c41a",
                              marginRight: "8px",
                              cursor: "default",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubTaskStatus(item.id, false);
                            }}
                          />
                        ) : (
                          <Checkbox
                            onChange={(e) =>
                              toggleSubTaskStatus(item.id, e.target.checked)
                            }
                          />
                        )}

                        <div
                          className={`sub-task-content ${
                            item.status === 1 ? "completed" : ""
                          }`}
                        >
                          <div className="sub-task-title">
                            {item.subTaskName}
                          </div>
                          {item.deadline && (
                            <div className="sub-task-date">
                              Deadline: {formatDate(item.deadline)}
                            </div>
                          )}
                          {item.subTaskDescription && (
                            <div className="sub-task-description">
                              {item.subTaskDescription}
                            </div>
                          )}
                        </div>
                        {item.priority && (
                          <Tag
                            color={
                              item.priority === "high"
                                ? "red"
                                : item.priority === "medium"
                                ? "orange"
                                : "green"
                            }
                          >
                            {item.priority === "high"
                              ? "Cao"
                              : item.priority === "medium"
                              ? "Trung bình"
                              : "Thấp"}
                          </Tag>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              )}
              <Modal
                title="Update Subtask"
                open={isEditSubTaskModalVisible}
                onCancel={() => setIsEditSubTaskModalVisible(false)}
                footer={null}
                className="subtask-modal"
              >
                <Form
                  form={editSubTaskForm}
                  layout="vertical"
                  onFinish={updateSubTask}
                  initialValues={{
                    subTaskName: "",
                    subTaskDescription: "",
                    startTime: null,
                    deadline: null,
                    amountBudget: 0,
                  }}
                >
                  <Form.Item
                    name="subTaskName"
                    label="Title"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a subtask title!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter subtask title" />
                  </Form.Item>

                  <Form.Item name="subTaskDescription" label="Describe">
                    <TextArea rows={2} placeholder="Describe subtask" />
                  </Form.Item>

                  <Form.Item
                    name="startTime"
                    label={
                      <Space>
                        <CalendarOutlined /> Start Time
                      </Space>
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Choose a start time"
                    />
                  </Form.Item>

                  <Form.Item
                    name="deadline"
                    label={
                      <Space>
                        <ClockCircleOutlined /> Deadline
                      </Space>
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Choose a deadline"
                    />
                  </Form.Item>

                  <Form.Item name="amountBudget" label="Budget (VND)">
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Enter budget"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space className="form-actions" style={{ float: "right" }}>
                      <Button
                        onClick={() => setIsEditSubTaskModalVisible(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isEditSubTaskSubmitting}
                      >
                        Update
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Modal>
            </Spin>
          </div>
        </Drawer>
      </Card>
    </div>
  );
}

export default ListTask;
