import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
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
import DetailTask from "./pages/Tasks/DetailTask";
import HomeOfImplementer from "./pages/Author/HomeOfImplementer";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Các trang không cần phân quyền */}
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/authorization" element={<Authorization />} />

        {/* Các trang cần phân quyền */}
        <Route
          path="/home"
          element={
            <PrivateRoute
              allowedRoles={["Campus Manager", "Event Organizer", "Spectator"]}
            >
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute
              allowedRoles={[
                "Campus Manager",
                "Event Organizer",
                "Spectator",
                "Implementor",
              ]}
            >
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/update-profile"
          element={
            <PrivateRoute
              allowedRoles={[
                "Campus Manager",
                "Event Organizer",
                "Spectator",
                "Implementor",
              ]}
            >
              <UpdateProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <CreateEvent />
            </PrivateRoute>
          }
        />

        <Route
          path="/event-detail-spec/:eventId"
          element={
            <PrivateRoute allowedRoles={["Spectator"]}>
              <EventDetailSpec />
            </PrivateRoute>
          }
        />

        <Route
          path="/group-detail/:id"
          element={
            <PrivateRoute
              allowedRoles={[
                "Implementer",
                "Campus Manager",
                "Event Organizer",
              ]}
            >
              <GroupDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/event-detail-EOG/:eventId"
          element={
            <PrivateRoute
              allowedRoles={[
                "Campus Manager",
                "Event Organizer",
                "Implementor",
              ]}
            >
              <EventDetailEOG />
            </PrivateRoute>
          }
        />

        <Route
          path="/group/:groupId/create-task"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <CreateTask />
            </PrivateRoute>
          }
        />

        <Route
          path="/manage-request"
          element={
            <PrivateRoute allowedRoles={["Campus Manager"]}>
              <ManageRequest />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-subtask/:taskId"
          element={
            <PrivateRoute
              allowedRoles={[
                "Event Organizer",
                "Campus Manager",
                "Implementer",
              ]}
            >
              <CreateSubTask />
            </PrivateRoute>
          }
        />

        <Route
          path="/update-group/:id"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <UpdateGroup />
            </PrivateRoute>
          }
        />

        <Route
          path="/task/:id"
          element={
            <PrivateRoute
              allowedRoles={[
                "Implementer",
                "Campus Manager",
                "Event Organizer",
              ]}
            >
              <DetailTask />
            </PrivateRoute>
          }
        />

        <Route
          path="/home-implementer"
          element={
            <PrivateRoute allowedRoles={["Implementer"]}>
              <HomeOfImplementer />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
