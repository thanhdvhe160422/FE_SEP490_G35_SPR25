import { useState, useEffect } from "react";
import axios from "axios";
import { addLeader } from "../../services/GroupService";
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
import LoadingHand from "../../components/Loading";
import "../../styles/Events/CreateEvent.css";

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
  }, []);

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
    setSelectedImages([...selectedImages, ...files]);
    event.target.value = null;
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

  const toggleStar = async (groupIndex, memberIndex) => {
    const group = groups[groupIndex];
    const member = group.members[memberIndex];
    try {
      const response = await addLeader(group.id, member.id);
      if (response) {
        setGroups((prevGroups) =>
          prevGroups.map((g, i) =>
            i === groupIndex
              ? {
                  ...g,
                  selectedStar:
                    g.selectedStar === memberIndex ? null : memberIndex,
                }
              : g
          )
        );
        enqueueSnackbar("Leader assigned successfully!", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error assigning leader:", error);
      enqueueSnackbar("Failed to assign leader.", { variant: "error" });
    }
  };

  const handleAddGroup = () => {
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
    setShowPopupSubTask(true);
  };

  const handleCloseSubTaskPopup = (subtask) => {
    setShowPopupSubTask(false);
    setSelectedSubTask(subtask);
  };

  const handleDeleteSubTask = (groupIndex, subTaskIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].subTasks.splice(subTaskIndex, 1);
    setGroups(newGroups);
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
            categoryEventId: eventType,
            placed: placed,
            groups: groups.map((group) => ({
              groupName: group.name,
              implementerIds: group.members.map((member) => member.id),
              deadline: group.deadline,
              budget: group.budget,
              description: group.description,
            })),
          };

          try {
            const createResponse = await axios.post(
              "https://localhost:44320/api/Events/create",
              eventData,
              {
                headers: { Authorization: `Bearer ${token}` },
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
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  if (retryResponse.status === 201) {
                    const eventId = retryResponse.data.result.id;
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

          <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between">
              <span>List Task</span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddGroup}
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
                            <Modal.Title>Add New Sub-Task</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Form>
                              <Form.Group
                                controlId="subTaskTitle"
                                className="mb-3"
                              >
                                <Form.Label>Sub-task Name</Form.Label>
                                <Form.Control
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
                                    if (!isNaN(rawValue)) {
                                      setSelectedSubTask({
                                        ...selectedSubTask,
                                        amount: rawValue,
                                      });
                                    }
                                  }}
                                />
                              </Form.Group>
                            </Form>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={handleCloseSubTaskPopup}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => {
                                const newGroups = [...groups];

                                if (!newGroups[selectedGroupIndex].subTasks) {
                                  newGroups[selectedGroupIndex].subTasks = [];
                                }

                                newGroups[selectedGroupIndex].subTasks.push({
                                  title: selectedSubTask.title,
                                  description: selectedSubTask.description,
                                  amount: selectedSubTask.amount,
                                  deadline: selectedSubTask.deadline,
                                  completed: false,
                                });

                                setGroups(newGroups);
                                handleCloseSubTaskPopup();
                              }}
                            >
                              Add Sub-Task
                            </Button>
                          </Modal.Footer>
                        </Modal>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100 mb-2"
                          onClick={() => handleAddSubTask(groupIndex)}
                        >
                          Add Sub-Task
                        </Button>
                        <ListGroup>
                          {group.subTasks?.map((subTask, subTaskIndex) => (
                            <ListGroup.Item
                              key={subTaskIndex}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div
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
                                  onClick={() =>
                                    toggleStar(groupIndex, memberIndex)
                                  }
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
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </Col>
              {selectedImages.map((file, index) => (
                <Col xs={3} key={index} className="position-relative">
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
                    onClick={() =>
                      setSelectedImages(
                        selectedImages.filter((_, i) => i !== index)
                      )
                    }
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
              {isLoading ? "Loading..." : "Create Event"}
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
      </div>
    </>
  );
}
