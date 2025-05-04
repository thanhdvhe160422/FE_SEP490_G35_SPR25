import { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { FaPlus, FaRegStar, FaStar, FaTimes, FaMinus } from "react-icons/fa";
import Header from "../../components/Header/Header";
import Swal from "sweetalert2";
import { useSnackbar } from "notistack";
import getCategories from "../../services/CategoryService";
import refreshAccessToken from "../../services/refreshToken";
import { useNavigate } from "react-router";
import { FaRobot } from "react-icons/fa";

import "../../styles/Events/CreateEvent.css";
import Loading from "../../components/Loading";

import { jwtDecode } from "jwt-decode";

export default function CreateEvent() {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedImages, setSelectedImages] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showPopupSubTask, setShowPopupSubTask] = useState(false);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [showPopupTask, setShowPopupTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState({
    index: null,
    data: null,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isValidMember, setIsValidMember] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [amountBudget, setAmountBudget] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");
  const [placed, setPlaced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [usersName, setUsersName] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isWaitingForCategory, setIsWaitingForCategory] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [isWaitingForApplyConfirmation, setIsWaitingForApplyConfirmation] =
    useState(false);
  const [pendingEventData, setPendingEventData] = useState(null);
  const [indexGselect, setindexGselect] = useState(0);
  const [goals, setGoals] = useState("");
  const [monitoringProcess, setMonitoringProcess] = useState("");
  const [measuringSuccess, setMeasuringSuccess] = useState("");
  const [sizeParticipants, setSizeParticipants] = useState("");

  const getCampusIdFromToken = () => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.campusId || 1;
    } catch (error) {
      console.error("Error decoding token:", error);
      return 1;
    }
  };

  const fetchCategories = async () => {
    const campusId = getCampusIdFromToken();
    try {
      const response = await axios.get(
        `https://localhost:44320/api/Categories/${campusId}`,
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const categoryData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoryData);
      return categoryData;
    } catch (error) {
      console.error("Error fetching categories:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Có lỗi khi lấy danh sách lĩnh vực. Vui lòng thử lại!",
        },
      ]);
      return [];
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    setChatHistory([...chatHistory, { sender: "user", text: chatMessage }]);

    if (!isWaitingForCategory && !isWaitingForApplyConfirmation) {
      setPendingPrompt(chatMessage);
      setIsWaitingForCategory(true);

      const categoryData = await fetchCategories();
      if (categoryData.length > 0) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Bạn muốn tạo sự kiện theo lĩnh vực nào? Dưới đây là các lựa chọn:",
          },
          { sender: "bot", categories: categoryData },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "Không có lĩnh vực nào để chọn." },
        ]);
        setIsWaitingForCategory(false);
      }
    } else if (isWaitingForCategory) {
      const selectedCategory = categories.find(
        (cat) =>
          cat.categoryEventName.toLowerCase() ===
          chatMessage.trim().toLowerCase()
      );

      if (selectedCategory) {
        try {
          const response = await axios.post(
            "https://localhost:44320/api/EventSuggestion/get-full-event-suggestion",
            {
              prompt: pendingPrompt,
              categoryEventId: selectedCategory.id,
            },
            {
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const botResponse = response.data;
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", data: botResponse },
            {
              sender: "bot",
              text: "Bạn có muốn áp dụng sự kiện này vào form tạo sự kiện không? (Có/Không)",
            },
          ]);
          setPendingEventData(botResponse);
          setIsWaitingForApplyConfirmation(true);
        } catch (error) {
          console.error("Error calling API:", error);
          setChatHistory((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Có lỗi xảy ra khi gọi API. Vui lòng thử lại!",
            },
          ]);
        }
        setIsWaitingForCategory(false);
        setPendingPrompt(null);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Lĩnh vực không hợp lệ. Vui lòng chọn lại từ danh sách!",
          },
        ]);
      }
    } else if (isWaitingForApplyConfirmation) {
      const userResponse = chatMessage.trim().toLowerCase();
      if (userResponse === "có" || userResponse === "co") {
        if (pendingEventData) {
          setEventName(pendingEventData.EventTitle || "");
          setDescription(pendingEventData.EventDescription || "");
          setGoals(pendingEventData.Goals || "");
          setMonitoringProcess(pendingEventData.MonitoringProcess || "");
          setMeasuringSuccess(pendingEventData.MeasuringSuccess || "");
          setSizeParticipants(
            pendingEventData.SizeParticipants?.toString() || ""
          );

          setFromDate(
            new Date(pendingEventData.StartTime).toISOString().split("T")[0]
          );
          setFromTime(
            new Date(pendingEventData.StartTime).toTimeString().slice(0, 5)
          );
          setToDate(
            new Date(pendingEventData.EndTime).toISOString().split("T")[0]
          );
          setToTime(
            new Date(pendingEventData.EndTime).toTimeString().slice(0, 5)
          );
          setAmountBudget(
            formatCurrency(pendingEventData.AmountBudget.toString())
          );
          setEventType(pendingEventData.CategoryEventId.toString());
          setPlaced("FPT");
          if (pendingEventData.Tasks && Array.isArray(pendingEventData.Tasks)) {
            const newGroups = pendingEventData.Tasks.map((task) => ({
              name: task.TaskName,
              members: [],
              isEditing: false,
              selectedStar: null,
              deadline: new Date(task.Deadline).toISOString().slice(0, 16),
              budget: task.AmountBudget.toString(),
              description: task.TaskDescription || "",
              subTasks:
                task.SubTasks?.map((subTask) => ({
                  title: subTask.SubTaskName,
                  description: subTask.SubTaskDescription || "",
                  amount: subTask.AmountBudget.toString(),
                  deadline: new Date(subTask.Deadline)
                    .toISOString()
                    .slice(0, 16),
                  completed: false,
                })) || [],
            }));
            setGroups(newGroups);
          }
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: "Đã áp dụng sự kiện vào form tạo sự kiện!" },
          ]);
        }
      } else if (userResponse === "không" || userResponse === "khong") {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Được rồi, tôi sẽ không áp dụng sự kiện này.",
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "Vui lòng trả lời 'Có' hoặc 'Không'!" },
        ]);
        return;
      }
      setIsWaitingForApplyConfirmation(false);
      setPendingEventData(null);
    }

    setChatMessage("");
  };

  const renderEventSuggestion = (data) => {
    if (!data || typeof data !== "object") {
      return <p>Không có dữ liệu hợp lệ để hiển thị.</p>;
    }

    const categoryName =
      categories.find((cat) => cat.id === data.CategoryEventId)
        ?.categoryEventName || `ID ${data.CategoryEventId}`;

    return (
      <div
        style={{
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <h5
          style={{ color: "#007bff", marginBottom: "15px", fontWeight: "bold" }}
        >
          {data.EventTitle || "Sự kiện không có tên"}
        </h5>
        <div style={{ marginBottom: "20px" }}>
          <p>
            <strong>Mô tả:</strong> {data.EventDescription || "Không có mô tả"}
          </p>
          <p>
            <strong>Thời gian:</strong>{" "}
            {new Date(data.StartTime).toLocaleString("vi-VN")} -{" "}
            {new Date(data.EndTime).toLocaleString("vi-VN")}
          </p>
          <p>
            <strong>Ngân sách:</strong>{" "}
            {Number(data.AmountBudget).toLocaleString("vi-VN")} VNĐ
          </p>
          <p>
            <strong>Loại sự kiện:</strong> {categoryName}
          </p>
        </div>

        {data.Tasks && Array.isArray(data.Tasks) && data.Tasks.length > 0 ? (
          <>
            <h6
              style={{
                color: "#343a40",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              Danh sách nhiệm vụ:
            </h6>
            {data.Tasks.map((task, taskIndex) => (
              <div
                key={taskIndex}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <h6
                  style={{
                    color: "#dc3545",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {task.TaskName}
                </h6>
                <div style={{ marginLeft: "10px" }}>
                  <p>
                    <strong>Mô tả:</strong>{" "}
                    {task.TaskDescription || "Không có mô tả"}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{" "}
                    {new Date(task.StartTime).toLocaleString("vi-VN")} -{" "}
                    {new Date(task.Deadline).toLocaleString("vi-VN")}
                  </p>
                  <p>
                    <strong>Ngân sách:</strong>{" "}
                    {Number(task.AmountBudget).toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>

                {task.SubTasks &&
                  Array.isArray(task.SubTasks) &&
                  task.SubTasks.length > 0 && (
                    <div style={{ marginTop: "15px", marginLeft: "20px" }}>
                      <strong style={{ color: "#6c757d" }}>
                        Công việc phụ:
                      </strong>
                      {task.SubTasks.map((subTask, subTaskIndex) => (
                        <div
                          key={subTaskIndex}
                          style={{
                            marginTop: "10px",
                            padding: "10px",
                            background: "#f1f3f5",
                            borderRadius: "4px",
                          }}
                        >
                          <p style={{ color: "#495057", fontWeight: "bold" }}>
                            {subTask.SubTaskName}
                          </p>
                          <div style={{ marginLeft: "10px" }}>
                            <p>
                              {subTask.SubTaskDescription || "Không có mô tả"}
                            </p>
                            <p>
                              <strong>Thời gian:</strong>{" "}
                              {new Date(subTask.StartTime).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              -{" "}
                              {new Date(subTask.Deadline).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                            <p>
                              <strong>Ngân sách:</strong>{" "}
                              {Number(subTask.AmountBudget).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </>
        ) : (
          <p style={{ color: "#6c757d" }}>Không có nhiệm vụ nào.</p>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await getCategories();
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        } else {
          console.error(
            "API returned invalid category data:",
            categoriesResponse
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        enqueueSnackbar("Error loading data", { variant: "error" });
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  const handleShowPopup = (group, index) => {
    setSelectedTask({
      index: index,
      data: {
        ...group,
        deadline: group.deadline || "",
        budget: group.budget || "",
        description: group.description || "",
      },
    });
    setShowPopupTask(true);
  };

  const handleClosePopup = () => {
    setShowPopupTask(false);
    setSelectedTask({
      index: null,
      data: null,
    });
  };

  const handleSaveTaskDetails = () => {
    if (selectedTask.index !== null && selectedTask.data) {
      const updatedGroups = [...groups];
      updatedGroups[selectedTask.index] = {
        ...updatedGroups[selectedTask.index],
        deadline: selectedTask.data.deadline,
        budget: selectedTask.data.budget,
        description: selectedTask.data.description,
      };
      setGroups(updatedGroups);
    }
    handleClosePopup();
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.filter(
      (file) =>
        !selectedImages.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        )
    );
    setSelectedImages([...selectedImages, ...newFiles]);
    event.target.value = null;
  };

  const handleDeleteImage = (index) => {
    const imageToDelete = selectedImages[index];
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageToDelete);
  };

  const toggleEditGroup = (index) => {
    setGroups(
      groups.map((group, i) =>
        i === index ? { ...group, isEditing: !group.isEditing } : group
      )
    );
  };

  const handleGroupNameChange = (index, newName) => {
    if (newName === null || newName === "") {
      newName = "Enter Task name";
    }
    setGroups(
      groups.map((group, i) =>
        i === index ? { ...group, name: newName } : group
      )
    );
  };

  const handleAddTask = () => {
    const newGroup = {
      name: `Task ${groups.length + 1}`,
      members: [],
      isEditing: true,
      selectedStar: null,
      deadline: "",
      budget: "",
      description: "",
    };
    setGroups([...groups, newGroup]);
  };

  const handleDeleteGroup = (index) => {
    const updatedGroups = groups.filter((_, i) => i !== index);
    setGroups(updatedGroups);
  };

  const handleAddMemberClick = (groupIndex) => {
    setSelectedGroupIndex(groupIndex);
    setShowAddMemberModal(true);
  };

  const handleAddMember = () => {
    if (!isValidMember || !newMember) return;
    setUsersName("");
    const updatedGroups = [...groups];
    updatedGroups[selectedGroupIndex] = {
      ...updatedGroups[selectedGroupIndex],
      members: [
        ...updatedGroups[selectedGroupIndex].members,
        {
          id: newMember.id,
          name: `${newMember.firstName} ${newMember.lastName}`,
          email: newMember.email,
        },
      ],
    };

    setGroups(updatedGroups);
    setNewMember(null);
    setShowAddMemberModal(false);
    setIsValidMember(false);
  };

  const handleNewMemberChange = async (e) => {
    const value = e.target.value;
    setUsersName(value);
    if (value.trim() === "") {
      setSuggestions([]);
      setIsValidMember(false);
      return;
    }

    let token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `https://localhost:44320/api/Users/search?input=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const filteredUsers = response.data || [];
      const currentGroupMembers = groups[selectedGroupIndex]?.members || [];

      const availableUsers = filteredUsers.filter(
        (user) => !currentGroupMembers.some((member) => member.id === user.id)
      );

      setSuggestions(availableUsers);
      setIsValidMember(availableUsers.length > 0);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("token", newToken);
          try {
            const retryResponse = await axios.get(
              `https://localhost:44320/api/Users/search?input=${value}`,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const filteredUsers = retryResponse.data || [];
            const currentGroupMembers =
              groups[selectedGroupIndex]?.members || [];

            const availableUsers = filteredUsers.filter(
              (user) =>
                !currentGroupMembers.some((member) => member.id === user.id)
            );

            setSuggestions(availableUsers);
            setIsValidMember(availableUsers.length > 0);
          } catch (retryError) {
            console.error(
              "API error after refresh:",
              retryError.response?.data
            );
            setSuggestions([]);
            setIsValidMember(false);
          }
        } else {
          console.error("Unable to refresh token, please login again.");
          setSuggestions([]);
          setIsValidMember(false);
        }
      } else {
        console.error("Error searching implementer:", error.response?.data);
        setSuggestions([]);
        setIsValidMember(false);
      }
    }
  };

  const handleSuggestionClick = (user) => {
    setNewMember(user);
    setUsersName(user.firstName + " " + user.lastName);
    setSuggestions([]);
    setIsValidMember(true);
  };

  const handleDeleteMember = (groupIndex, memberIndex) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members.splice(memberIndex, 1);
    setGroups(updatedGroups);
  };

  const handleSaveDraft = () => {
    Swal.fire({
      title: "Do you want to save the changes?",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
      }
    });
  };

  const validateFields = () => {
    const errors = [];

    if (!eventName) errors.push("Event name");
    if (!fromDate || !fromTime) errors.push("Start Time");
    if (!toDate || !toTime) errors.push("End Time");
    if (!eventType) errors.push("Type EVent");
    if (!description) errors.push("Description");
    if (!amountBudget) errors.push("Amount Budget");
    if (!placed) errors.push("Location");
    if (selectedImages.length === 0) errors.push("Image");
    if (!goals) errors.push("Goals");
    if (!monitoringProcess) errors.push("Monitoring Process");
    if (!measuringSuccess) errors.push("Measuring Success");
    if (!sizeParticipants) errors.push("Expected Participants");

    if (errors.length > 0) {
      enqueueSnackbar(`Missing information: ${errors.join(", ")}`, {
        variant: "error",
      });
      return false;
    }

    const start = new Date(`${fromDate}T${fromTime}`);
    const end = new Date(`${toDate}T${toTime}`);
    if (start >= end) {
      enqueueSnackbar("The end time must be after the start time.", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleAddSubTask = (groupIndex) => {
    setSelectedGroupIndex(groupIndex);
    console.log("sang: " + groupIndex);
    setindexGselect(groupIndex);
    setSelectedSubTask({
      title: "",
      description: "",
      deadline: "",
      amount: "",
    });
    setShowPopupSubTask(true);
  };
  const handleEditSubTask = (groupIndex, subTask) => {
    setSelectedGroupIndex(groupIndex);
    setSelectedSubTask(subTask);
    setShowPopupSubTask(true);
  };

  const handleCloseSubTaskPopup = (subtask) => {
    setShowPopupSubTask(false);
    setSelectedSubTask({
      title: "",
      description: "",
      deadline: "",
      amount: "",
    });
  };

  const handleDeleteSubTask = (groupIndex, subTaskIndex) => {
    const newGroups = [...groups];
    if (newGroups[groupIndex] && newGroups[groupIndex].subTasks) {
      newGroups[groupIndex].subTasks.splice(subTaskIndex, 1);
      setGroups(newGroups);
    } else {
      console.error("No subTasks found for the specified group index.");
    }
  };

  const handleCreateEvent = async () => {
    if (!validateFields()) return;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        html: '<span style="color: red;">This event will be sent to Campus Manager for approval!</span>',
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          setIsLoading(true);

          if (!userId || !token) {
            enqueueSnackbar("Your session has expired, please log in again.", {
              variant: "error",
            });
            return;
          }

          const eventData = {
            eventTitle: eventName,
            eventDescription: description,
            startTime: `${fromDate}T${fromTime}`,
            endTime: `${toDate}T${toTime}`,
            amountBudget: Number(amountBudget.replace(/\D/g, "")),
            categoryEventId: Number(eventType),
            placed: placed,
            goals: goals,
            monitoringProcess: monitoringProcess,
            measuringSuccess: measuringSuccess,
            sizeParticipants: Number(sizeParticipants),
            tasks: groups.map((group) => ({
              taskName: group.name,
              description: group.description,
              startTime: group.deadline
                ? group.deadline
                : `${fromDate}T${fromTime}`, // Mặc định từ event nếu không có
              deadline: group.deadline,
              budget: Number(group.budget.replace(/\D/g, "") || 0),
              subTasks:
                group.subTasks?.map((subTask) => ({
                  subTaskName: subTask.title,
                  description: subTask.description,
                  startTime: subTask.deadline
                    ? subTask.deadline
                    : `${fromDate}T${fromTime}`, // Mặc định từ task/event nếu không có
                  deadline: subTask.deadline,
                  budget: Number(subTask.amount.replace(/\D/g, "") || 0),
                })) || [],
            })),
          };

          try {
            const createResponse = await axios.post(
              "https://localhost:44320/api/Events/create",
              eventData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json", // Đảm bảo gửi JSON
                },
              }
            );
            if (createResponse.status === 201) {
              const eventId = createResponse.data.result.id;
              await handleUploadImages(eventId, token);
              swalWithBootstrapButtons
                .fire({
                  title: "Successfully!",
                  text: "Event has been created and images uploaded.",
                  icon: "success",
                })
                .then(() => {
                  navigate("/home");
                });
            }
          } catch (error) {
            if (error.response?.status === 401) {
              const newToken = await refreshAccessToken();
              if (newToken) {
                try {
                  let retryResponse = await axios.post(
                    "https://localhost:44320/api/Events/create",
                    eventData,
                    {
                      headers: {
                        Authorization: `Bearer ${newToken}`,
                        "Content-Type": "application/json", // Đảm bảo gửi JSON
                      },
                    }
                  );
                  if (retryResponse.status === 201) {
                    const eventId = retryResponse.data.result.id;
                    await handleUploadImages(eventId, newToken); // Dùng newToken cho consistency
                    swalWithBootstrapButtons
                      .fire({
                        title: "Successfully!",
                        text: "Event has been created and images uploaded.",
                        icon: "success",
                      })
                      .then(() => {
                        navigate("/home");
                      });
                  }
                } catch (retryError) {
                  console.error(
                    "API error after refresh:",
                    retryError.response?.data
                  );
                  enqueueSnackbar(
                    `API Error: ${
                      retryError.response?.data?.message || "Unknown error"
                    }`,
                    { variant: "error" }
                  );
                }
              } else {
                enqueueSnackbar(
                  "Your session has expired, please log in again.",
                  {
                    variant: "error",
                  }
                );
                navigate("/login");
              }
            } else {
              console.error("API Error:", error.response?.data);
              enqueueSnackbar(
                `API Error: ${
                  error.response?.data?.message || "Unknown error"
                }`,
                { variant: "error" }
              );
            }
          } finally {
            setIsLoading(false);
          }
        }
      });
  };

  const handleUploadImages = async (eventId, token) => {
    if (selectedImages.length === 0) return;

    const formData = new FormData();
    selectedImages.forEach((file) => formData.append("EventMediaFiles", file));
    formData.append("eventId", eventId);
    try {
      await axios.post(
        "https://localhost:44320/api/Events/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Image upload failed:", error.response?.data);
      enqueueSnackbar("Image upload failed. You can try uploading manually.", {
        variant: "warning",
      });
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "";
    return value
      .toString()
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountBudgetChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatCurrency(value);
    setAmountBudget(formattedValue);
  };

  const parseNumber = (value) => {
    return value.replace(/,/g, "");
  };
  if (isLoading) return <Loading />;

  return (
    <>
      <Header />
      <div
        className="container"
        style={{
          maxWidth: "900px",
          margin: "90px auto 0",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Form style={{ width: "100%" }}>
          <Form.Group controlId="eventName">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Name Event <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </Form.Group>

          <Row className="d-flex justify-content-between">
            <Col md={5}>
              <Form.Group controlId="startTime">
                <Form.Label style={{ fontWeight: "bold", color: "black" }}>
                  Start Time <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div className="d-flex gap-3">
                  <Form.Control
                    style={{ width: "50%" }}
                    type="time"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                  />
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group controlId="endTime">
                <Form.Label style={{ fontWeight: "bold", color: "black" }}>
                  End Time <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div className="d-flex gap-3">
                  <Form.Control
                    style={{ width: "50%" }}
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                  />
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="eventType">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Event Type <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="">Choose Type Event</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryEventName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="eventDescription">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Description <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              style={{
                overflow: "hidden",
                minHeight: "100px",
              }}
            />
          </Form.Group>
          <Form.Group controlId="eventLocation" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Location <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter event location"
              value={placed}
              onChange={(e) => setPlaced(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="amountBudget" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Amount Budget <span style={{ color: "green" }}>(VNĐ)</span>{" "}
              <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                value={amountBudget}
                onChange={handleAmountBudgetChange}
                placeholder="Enter amount"
              />
            </div>
          </Form.Group>

          <Form.Group controlId="eventGoals" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Goals
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter event goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="monitoringProcess" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Monitoring Process
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Describe how the event will be monitored"
              value={monitoringProcess}
              onChange={(e) => setMonitoringProcess(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="measuringSuccess" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Measuring Success
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="How will success be measured?"
              value={measuringSuccess}
              onChange={(e) => setMeasuringSuccess(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="sizeParticipants" className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Expected Participants <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of participants"
              value={sizeParticipants}
              onChange={(e) => setSizeParticipants(e.target.value)}
              min={1}
              required
            />
          </Form.Group>

          <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between">
              <span style={{ fontWeight: "bold", color: "black" }}>
                List Task
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddTask}
              >
                <FaPlus />
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {groups.map((group, groupIndex) => (
                  <Col md={6} key={groupIndex}>
                    <Card className="mb-2">
                      <Card.Header
                        style={{ backgroundColor: "orange" }}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          {group.isEditing ? (
                            <Form.Control
                              style={{
                                width: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              type="text"
                              value={group.name}
                              onChange={(e) =>
                                handleGroupNameChange(
                                  groupIndex,
                                  e.target.value
                                )
                              }
                              onBlur={() => toggleEditGroup(groupIndex)}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => toggleEditGroup(groupIndex)}
                              style={{
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "block",
                                fontWeight: "bold",
                                color: "white",
                              }}
                            >
                              {group.name}
                            </span>
                          )}
                        </div>

                        <div
                          className="action d-flex"
                          style={{ gap: "5px", marginLeft: "10px" }}
                        >
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowPopup(group, groupIndex)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteGroup(groupIndex)}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </Card.Header>

                      <Card.Body>
                        <Modal show={showPopupTask} onHide={handleClosePopup}>
                          <Modal.Header closeButton>
                            <Modal.Title>Task Details</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            {selectedTask.data && (
                              <Form>
                                <Form.Group controlId="taskDeadline">
                                  <Form.Label>Deadline</Form.Label>
                                  <Form.Control
                                    type="datetime-local"
                                    value={selectedTask.data.deadline || ""}
                                    onChange={(e) =>
                                      setSelectedTask({
                                        ...selectedTask,
                                        data: {
                                          ...selectedTask.data,
                                          deadline: e.target.value,
                                        },
                                      })
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                  />
                                </Form.Group>
                                <Form.Group controlId="taskBudget">
                                  <Form.Label>Budget</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formatCurrency(
                                      selectedTask.data.budget || ""
                                    )}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (
                                        /^[\d,.]*$/.test(value) ||
                                        value === ""
                                      ) {
                                        setSelectedTask({
                                          ...selectedTask,
                                          data: {
                                            ...selectedTask.data,
                                            budget: parseNumber(value),
                                          },
                                        });
                                      }
                                    }}
                                    placeholder="Enter budget"
                                    min="0"
                                  />
                                </Form.Group>
                                <Form.Group controlId="taskDescription">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={selectedTask.data.description || ""}
                                    onChange={(e) =>
                                      setSelectedTask({
                                        ...selectedTask,
                                        data: {
                                          ...selectedTask.data,
                                          description: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </Form.Group>
                              </Form>
                            )}
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={handleClosePopup}
                            >
                              Close
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleSaveTaskDetails}
                            >
                              Save Changes
                            </Button>
                          </Modal.Footer>
                        </Modal>

                        <Modal
                          show={showPopupSubTask}
                          onHide={handleCloseSubTaskPopup}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Create New Sub-Task</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const t = indexGselect;
                                groupIndex = t;
                                console.log("thanh: ", groupIndex);
                                if (
                                  groupIndex === null ||
                                  groupIndex < 0 ||
                                  groupIndex >= groups.length
                                ) {
                                  console.error(
                                    "Invalid group index:",
                                    selectedGroupIndex
                                  );
                                  return;
                                }

                                const newGroups = [...groups];

                                if (!newGroups[selectedGroupIndex]) {
                                  console.error(
                                    "Group not found at index:",
                                    selectedGroupIndex
                                  );
                                  return;
                                }

                                if (!newGroups[groupIndex].subTasks) {
                                  newGroups[groupIndex].subTasks = [];
                                }
                                newGroups[groupIndex].subTasks.push({
                                  title: selectedSubTask.title || "",
                                  description:
                                    selectedSubTask.description || "",
                                  amount: selectedSubTask.amount || "",
                                  deadline: selectedSubTask.deadline || "",
                                  completed: false,
                                });

                                setGroups(newGroups);
                                handleCloseSubTaskPopup();
                              }}
                            >
                              <Form.Group
                                controlId="subTaskTitle"
                                className="mb-3"
                              >
                                <Form.Label>Sub-task Name</Form.Label>
                                <Form.Control
                                  required
                                  type="text"
                                  value={selectedSubTask?.title || ""}
                                  onChange={(e) =>
                                    setSelectedSubTask({
                                      ...selectedSubTask,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Enter sub-task title"
                                />
                              </Form.Group>
                              <Form.Group controlId="subTaskDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                  required
                                  as="textarea"
                                  rows={3}
                                  value={selectedSubTask?.description || ""}
                                  onChange={(e) =>
                                    setSelectedSubTask({
                                      ...selectedSubTask,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Enter description"
                                />
                              </Form.Group>
                              <Form.Group controlId="subTaskDeadline">
                                <Form.Label>Deadline</Form.Label>
                                <Form.Control
                                  required
                                  type="datetime-local"
                                  value={selectedSubTask?.deadline || ""}
                                  onChange={(e) =>
                                    setSelectedSubTask({
                                      ...selectedSubTask,
                                      deadline: e.target.value,
                                    })
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                />
                              </Form.Group>
                              <Form.Group controlId="subTaskAmount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={
                                    selectedSubTask?.amount
                                      ? Number(
                                          selectedSubTask.amount
                                        ).toLocaleString("vi-VN")
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /\./g,
                                      ""
                                    );
                                    if (
                                      !isNaN(rawValue) ||
                                      e.target.value === ""
                                    ) {
                                      setSelectedSubTask({
                                        ...selectedSubTask,
                                        amount: rawValue,
                                      });
                                    }
                                  }}
                                  required
                                  title="Vui lòng nhập số tiền"
                                />
                              </Form.Group>
                              <Modal.Footer>
                                <Button
                                  variant="secondary"
                                  onClick={handleCloseSubTaskPopup}
                                >
                                  Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                  Create
                                </Button>
                              </Modal.Footer>
                            </Form>
                          </Modal.Body>
                        </Modal>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100 mb-2"
                          onClick={() => handleAddSubTask(groupIndex)}
                        >
                          Create Sub-Task
                        </Button>
                        <ListGroup>
                          {group.subTasks?.map((subTask, subTaskIndex) => (
                            <ListGroup.Item
                              key={subTaskIndex}
                              className="d-flex justify-content-between align-items-center"
                              style={{ cursor: "pointer" }}
                            >
                              <div
                                onClick={() =>
                                  handleEditSubTask(groupIndex, subTask)
                                }
                                className="d-flex flex-column"
                                style={{ width: "250px" }}
                              >
                                <div
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {subTask.title}
                                </div>

                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#6c757d",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {subTask.deadline}
                                </div>

                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#6c757d",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {formatCurrency(subTask.amount)}
                                  <span style={{ color: "red" }}> VNĐ</span>
                                </div>
                              </div>

                              <Button
                                variant="danger"
                                size="sm"
                                className="ms-2"
                                onClick={() =>
                                  handleDeleteSubTask(groupIndex, subTaskIndex)
                                }
                              >
                                <FaMinus />
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <Button
                          style={{ marginTop: "10px" }}
                          variant="outline-secondary"
                          size="sm"
                          className="w-100 mb-2"
                          onClick={() => handleAddMemberClick(groupIndex)}
                        >
                          Add Member
                        </Button>
                        <ListGroup>
                          {group.members.map((member, memberIndex) => (
                            <ListGroup.Item
                              style={{ backgroundColor: "grey" }}
                              key={memberIndex}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex flex-column">
                                <div style={{ color: "white" }}>
                                  {member.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "white",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "200px",
                                  }}
                                >
                                  {member.email}
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color:
                                      group.selectedStar === memberIndex
                                        ? "gold"
                                        : "gray",
                                  }}
                                >
                                  {group.selectedStar === memberIndex ? (
                                    <FaStar />
                                  ) : (
                                    <FaRegStar />
                                  )}
                                </span>

                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="ms-2"
                                  onClick={() =>
                                    handleDeleteMember(groupIndex, memberIndex)
                                  }
                                >
                                  <FaMinus />
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Form.Group className="mt-3">
            <Form.Label style={{ fontWeight: "bold", color: "black" }}>
              Image <span style={{ color: "red" }}>*</span>{" "}
              <span
                style={{
                  fontWeight: "initial",
                  color: "red",
                  fontStyle: "italic",
                }}
              >
                (The first photo will be the background photo of the event.)
              </span>
            </Form.Label>
            <Row>
              <Col xs={3}>
                <label
                  className="w-100 h-100 d-flex align-items-center justify-content-center border rounded"
                  style={{
                    cursor: "pointer",
                    aspectRatio: "1/1",
                    minHeight: "100px",
                  }}
                >
                  <FaPlus />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    key={selectedImages.length}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </Col>
              {selectedImages.map((file, index) => (
                <Col
                  xs={3}
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="position-relative"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="uploaded"
                    className="img-fluid rounded w-100 h-100 object-fit-cover"
                    style={{ aspectRatio: "1/1", minHeight: "100px" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 p-1"
                    onClick={() => handleDeleteImage(index)}
                  >
                    ✕
                  </Button>
                </Col>
              ))}
            </Row>
          </Form.Group>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="danger">Cancel</Button>
            <Button variant="primary" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button
              variant="success"
              onClick={handleCreateEvent}
              disabled={isLoading}
            >
              Create Event
            </Button>
          </div>
        </Form>

        <Modal
          show={showAddMemberModal}
          onHide={() => setShowAddMemberModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Enter email or name"
              value={usersName}
              onChange={handleNewMemberChange}
            />
            {suggestions.length > 0 && (
              <ListGroup className="mt-2">
                {suggestions.map((user, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => handleSuggestionClick(user)}
                  >
                    {`${user.firstName} ${user.lastName}`}
                    <div> {user.email}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddMemberModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              disabled={!isValidMember}
            >
              Add
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showChatbot}
          onHide={() => setShowChatbot(false)}
          size="lg"
          animation={false}
          backdropClassName="custom-backdrop"
        >
          <Modal.Header closeButton>
            <Modal.Title>AI Chatbot Assistant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              style={{
                height: "400px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              {chatHistory.length === 0 ? (
                <p>Xin chào! Tôi là trợ lý AI, bạn cần hỗ trợ gì?</p>
              ) : (
                chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: chat.sender === "user" ? "right" : "left",
                      margin: "10px 0",
                    }}
                  >
                    <span
                      style={{
                        background:
                          chat.sender === "user" ? "#007bff" : "#f8f9fa",
                        color: chat.sender === "user" ? "white" : "black",
                        padding: "10px",
                        borderRadius: "5px",
                        display: "inline-block",
                        maxWidth: "80%",
                        wordWrap: "break-word",
                      }}
                    >
                      {chat.sender === "user" ? (
                        chat.text
                      ) : chat.data ? (
                        renderEventSuggestion(chat.data)
                      ) : chat.categories ? (
                        <div>
                          {chat.categories.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: 0 }}>
                              {chat.categories.map((cat, idx) => (
                                <li key={idx}>{cat.categoryEventName}</li>
                              ))}
                            </ul>
                          ) : (
                            "Không có lĩnh vực nào để chọn."
                          )}
                        </div>
                      ) : (
                        chat.text
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Form.Control
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChatbot(false)}>
              Đóng
            </Button>
            <Button variant="primary" onClick={handleSendChatMessage}>
              Gửi
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Nút mở chatbot */}
        <div
          onClick={() => setShowChatbot(true)}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor: "#007bff",
            color: "white",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          <FaRobot size={24} />
        </div>
      </div>
    </>
  );
}
