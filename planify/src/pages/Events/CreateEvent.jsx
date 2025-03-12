import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
import refreshAccessToken from "../../services/refreshToken";

export default function CreateEvent() {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedImages, setSelectedImages] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("");
        setUsers(usersResponse.data);

        const categoriesResponse = await axios.get("/categories");
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        enqueueSnackbar("Lỗi tải dữ liệu", { variant: "error" });
      }
    };

    fetchData();
  }, []);

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
    setGroups(
      groups.map((group, i) =>
        i === index ? { ...group, name: newName } : group
      )
    );
  };

  const toggleStar = (groupIndex, memberIndex) => {
    setGroups(
      groups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              selectedStar:
                group.selectedStar === memberIndex ? null : memberIndex,
            }
          : group
      )
    );
  };
  const toISOLocal = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split("-");
    const [hours, minutes] = timeStr.split(":");
    const date = new Date(year, month - 1, day, hours, minutes);
    return new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString();
  };
  const handleAddGroup = () => {
    const newGroup = {
      name: `Group ${groups.length + 1}`,
      members: [],
      isEditing: true,
      selectedStar: null,
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
    if (newMember.trim() !== "" && isValidMember) {
      const selectedUser = users.find(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase() ===
          newMember.toLowerCase()
      );

      if (selectedUser) {
        const updatedGroups = [...groups];
        updatedGroups[selectedGroupIndex].members.push({
          id: selectedUser.id,
          name: `${selectedUser.firstName} ${selectedUser.lastName}`,
          email: selectedUser.email,
        });
        setGroups(updatedGroups);
        setNewMember("");
        setShowAddMemberModal(false);
        setIsValidMember(false);
      }
    }
  };

  const handleNewMemberChange = (e) => {
    const value = e.target.value;
    setNewMember(value);

    const currentGroupMembers = groups[selectedGroupIndex]?.members || [];

    if (value.trim() !== "") {
      const filteredSuggestions = users.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(value.toLowerCase()) &&
          !currentGroupMembers.some(
            (member) => member.name === `${user.firstName} ${user.lastName}`
          )
      );
      setSuggestions(filteredSuggestions);

      const isValid = users.some(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase() ===
            value.toLowerCase() &&
          !currentGroupMembers.some(
            (member) => member.name === `${user.firstName} ${user.lastName}`
          )
      );
      setIsValidMember(isValid);
    } else {
      setSuggestions([]);
      setIsValidMember(false);
    }
  };

  const handleSuggestionClick = (user) => {
    setNewMember(`${user.firstName} ${user.lastName}`);
    setSuggestions([]);
    setIsValidMember(true);
  };

  const handleDeleteMember = (groupIndex, memberIndex) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members.splice(memberIndex, 1);
    setGroups(updatedGroups);
  };
  // const uploadImages = async () => {
  //   try {
  //     const formData = new FormData();
  //     selectedImages.forEach((file) => {
  //       formData.append("files", file);
  //     });

  //     const response = await api.post("/upload", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     return response.data.urls; // Giả sử API trả về array URLs
  //   } catch (error) {
  //     console.error("Lỗi upload ảnh:", error);
  //     throw new Error("Không thể upload ảnh");
  //   }
  // };
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

    if (!eventName) errors.push("Tên sự kiện");
    if (!fromDate || !fromTime) errors.push("Thời gian bắt đầu");
    if (!toDate || !toTime) errors.push("Thời gian kết thúc");
    // if (!eventType) errors.push("Loại sự kiện");
    if (!description) errors.push("Mô tả");
    if (!amountBudget) errors.push("Ngân sách");
    if (!placed) errors.push("Địa điểm");
    // if (selectedImages.length === 0) errors.push("Ảnh");

    if (errors.length > 0) {
      enqueueSnackbar(`Thiếu thông tin: ${errors.join(", ")}`, {
        variant: "error",
      });
      return false;
    }

    // Kiểm tra ngày
    const start = new Date(`${fromDate}T${fromTime}`);
    const end = new Date(`${toDate}T${toTime}`);
    if (start >= end) {
      enqueueSnackbar("Thời gian kết thúc phải sau thời gian bắt đầu", {
        variant: "error",
      });
      return false;
    }

    return true;
  };
  const handleCreateEvent = async () => {
    if (!validateFields()) return;
    setIsLoading(true);
    const userId = localStorage.getItem("userId");
    const eventData = {
      eventTitle: eventName,
      eventDescription: description,
      startTime: toISOLocal(fromDate, fromTime),
      endTime: toISOLocal(toDate, toTime),
      amountBudget: parseInt(getNumericValue(amountBudget), 10),
      categoryEventId: parseInt(eventType),
      placed: placed,
      createBy: userId,
      groups: groups.map((group) => ({
        groupName: group.name,
        createBy: userId,
        eventId: 0,
        implementerIds: group.members.map((member) => member.id),
      })),
    };
    try {
      if (!userId) {
        enqueueSnackbar("Phiên đăng nhập hết hạn", { variant: "error" });
        return;
      }

      const response = await axios.post(
        "https://localhost:44320/api/Events/create",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        Swal.fire("Thành công!", "Sự kiện đã được tạo", "success");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Access token hết hạn, thử refresh token
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          const retryResponse = await axios.post(
            "https://localhost:44320/api/Events/create",
            eventData,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            }
          );
        } else {
          enqueueSnackbar("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.", {
            variant: "error",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getNumericValue = (value) => {
    return value.replace(/,/g, "");
  };

  const handleAmountBudgetChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatCurrency(value);
    setAmountBudget(formattedValue);
  };

  return (
    <>
      <Header />
      <div className="container"
        style={{
          maxWidth: "900px",
          margin: "90px auto 0", 
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 className="text-center">Create Event</h2>

        <Form style={{ width: "100%" }}>
          <Form.Group controlId="eventName">
            <Form.Label>
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
                <Form.Label>
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
                <Form.Label>
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
            <Form.Label>
              Event Type <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="">Chọn loại sự kiện</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="eventDescription">
            <Form.Label>
              Description <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="eventLocation" className="mt-3">
            <Form.Label>
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
            <Form.Label>
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
              <span>Member Group</span>
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
                        {group.isEditing ? (
                          <Form.Control
                            type="text"
                            value={group.name}
                            onChange={(e) =>
                              handleGroupNameChange(groupIndex, e.target.value)
                            }
                            onBlur={() => toggleEditGroup(groupIndex)}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => toggleEditGroup(groupIndex)}
                            style={{ cursor: "pointer" }}
                          >
                            {group.name}
                          </span>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteGroup(groupIndex)}
                        >
                          <FaTimes />
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <Button
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
                              key={memberIndex}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex flex-column">
                                <div>{member.name}</div>
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#6c757d",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "150px",
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
            <Form.Label>
              Image <span style={{ color: "red" }}>*</span>
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
              {isLoading ? "Đang xử lý..." : "Tạo sự kiện"}
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
              value={newMember}
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
