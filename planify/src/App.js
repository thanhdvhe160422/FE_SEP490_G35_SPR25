import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Author/Login";
import Authorization from "./components/Authorization";
import LoginAdmin from "./pages/Author/LoginAdmin";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Author/Home";
import Profile from "./pages/Author/Profile";
import CreateEvent from "./pages/Events/CreateEvent";
import EventDetailSpec from "./pages/Events/EventDetailSpec";
import UpdateProfile from "./pages/Author/UpdateProfile";
import GroupDetail from "./pages/Group/GroupDetail";
import EventDetailEOG from "./pages/Events/EventDetailEOG";
import CreateTask from "./pages/Tasks/CreateTask";
import ManageRequest from "./pages/Events/ManageRequest";
import CreateSubTask from "./pages/Sub-tasks/CreateSubTask";
import UpdateGroup from "./pages/Group/UpdateGroup";
import DetailTask from "./pages/Tasks/DetailTask"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/authorization" element={<Authorization />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route
          path="/event-detail-spec/:eventId"
          element={<EventDetailSpec />}
        />
        <Route path="/group-detail/:id" element={<GroupDetail />} />
        <Route path="/event-detail-EOG/:eventId" element={<EventDetailEOG />} />
        <Route path="/group/:groupId/create-task" element={<CreateTask />} />
        <Route path="/manage-request" element={<ManageRequest />} />
        <Route path="/create-subtask/:taskId" element={<CreateSubTask />} />
        <Route path="/create-subtask" element={<CreateSubTask />} />
        <Route path="/update-group/:id" element={<UpdateGroup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/task/:id" element={<DetailTask />} />
      </Routes>
    </div>
  );
}

export default App;
