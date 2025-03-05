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

export default function CreateEvent() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isValidMember, setIsValidMember] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("http://localhost:4000/users");
        setUsers(usersResponse.data);

        const categoriesResponse = await axios.get(
          "http://localhost:4000/categories"
        );
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleReplaceImage = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedImages = [...selectedImages];
      updatedImages[index] = file;
      setSelectedImages(updatedImages);
    }
  };

  // Handle add group button click
  const handleAddGroup = () => {
    const newGroup = {
      name: `Group ${groups.length + 1}`,
      members: [],
      isEditing: true,
      selectedStar: null,
    };
    setGroups([...groups, newGroup]);
  };

  // Handle delete group button click
  const handleDeleteGroup = (index) => {
    const updatedGroups = groups.filter((_, i) => i !== index);
    setGroups(updatedGroups);
  };

  // Handle add member button click
  const handleAddMemberClick = (groupIndex) => {
    setSelectedGroupIndex(groupIndex);
    setShowAddMemberModal(true);
  };

  // Handle adding new member
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
          name: `${selectedUser.firstName} ${selectedUser.lastName}`,
          email: selectedUser.email,
        });
        setGroups(updatedGroups);
        setNewMember("");
        setShowAddMemberModal(false);
        setIsValidMember(false); // Reset trạng thái hợp lệ
      }
    }
  };

  // Handle input change for new member
  const handleNewMemberChange = (e) => {
    const value = e.target.value;
    setNewMember(value);

    // Lấy danh sách thành viên đã được thêm vào Group hiện tại
    const currentGroupMembers = groups[selectedGroupIndex]?.members || [];

    // Tìm kiếm đề xuất từ danh sách users, loại bỏ những tên đã được thêm vào Group
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

      // Kiểm tra xem tên nhập vào có tồn tại trong danh sách users và chưa được thêm vào Group không
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

  // Handle suggestion click
  const handleSuggestionClick = (user) => {
    setNewMember(`${user.firstName} ${user.lastName}`);
    setSuggestions([]);
    setIsValidMember(true); // Đảm bảo nút "Add" được kích hoạt khi chọn đề xuất
  };

  // Handle delete member button click
  const handleDeleteMember = (groupIndex, memberIndex) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members.splice(memberIndex, 1); // Xóa thành viên khỏi Group
    setGroups(updatedGroups);
  };

  // Handle save draft button click
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

  // Handle create event button click
  const handleCreateEvent = () => {
    Swal.fire({
      title: "Do you want to create the event?",
      html: "<span style='color: red;'>This event will be sent to the Campus Manager</span>",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Request sent successfully", "", "success");
      }
    });
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: "900px", padding: "20px" }}>
        <h2 className="text-center">Create Event</h2>

        <Form>
          <Form.Group controlId="eventName">
            <Form.Label>Name Event</Form.Label>
            <Form.Control type="text" placeholder="Enter event name" />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group controlId="eventDate">
                <Form.Label>Date & Time</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Label>From</Form.Label>
                    <Form.Control type="time" />
                  </Col>
                  <Col>
                    <Form.Label>To</Form.Label>
                    <Form.Control type="time" />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="eventType">
            <Form.Label>Event Type</Form.Label>
            <Form.Select>
              <option>Choose event type</option>
              {/* Hiển thị danh sách categories */}
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="eventDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
            />
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
                        {/* Nút X để xóa Group */}
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
                                    maxWidth: "150px", // Giới hạn độ rộng của email
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
                                {/* Nút - để xóa member */}
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
            <Form.Label>Image</Form.Label>
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
            <Button variant="success" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </div>
        </Form>

        {/* Add Member Modal */}
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
            {/* Hiển thị đề xuất */}
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
