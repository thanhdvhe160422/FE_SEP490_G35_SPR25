import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Author/Login";
import LoginAdmin from "./pages/Author/LoginAdmin";
import Authorization from "./components/Authorization";
import Home from "./pages/Author/Home";
import Profile from "./pages/Author/Profile";
import CreateEvent from "./pages/Events/CreateEvent";
import EventDetailSpec from "./pages/Events/EventDetailSpec";
import UpdateProfile from "./pages/Author/UpdateProfile";
import EventDetailEOG from "./pages/Events/EventDetailEOG";
import CreateTask from "./pages/Tasks/CreateTask";
import ManageRequest from "./pages/Events/ManageRequest";
import CreateSubTask from "./pages/Sub-tasks/CreateSubTask";
import DetailTask from "./pages/Tasks/DetailTask";
import HomeOfImplementer from "./pages/Author/HomeOfImplementer";
import UpdateEvent from "./pages/Events/UpdateEvent";
import CostDetail from "./pages/Events/CostDetail";
import CreateEventOrganizer from "./pages/Author/CreateEventOrganizer";
import UpdateEventOrganizer from "./pages/Author/UpdateEventOrganizer";
import UpdateTask from "./pages/Tasks/UpdateTask";
import CategoryEventManager from "./pages/Events/CategoryEventManager";
import HomeSpectator from "./pages/Author/HomeSpectator";
import EventPlan from "./pages/Events/EventPlan";
import "bootstrap/dist/css/bootstrap.min.css";
import MyFarvourite from "./pages/Events/MyFarvourite";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/authorization" element={<Authorization />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home-spec" element={<HomeSpectator />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event-plan" element={<EventPlan />} />
        <Route path="/event-detail-spec/:eventId" element={<EventDetailSpec />} />
        <Route path="/event-detail-EOG/:eventId" element={<EventDetailEOG />} />
        <Route path="/group/:groupId/create-task" element={<CreateTask />} />
        <Route path="/manage-request" element={<ManageRequest />} />
        <Route path="/create-subtask/:taskId" element={<CreateSubTask />} />
        <Route path="/task/:id" element={<DetailTask />} />
        <Route path="/update-event/:id" element={<UpdateEvent />} />
        <Route path="/home-implementer" element={<HomeOfImplementer />} />
        <Route path="/create-event-organizer" element={<CreateEventOrganizer />} />
        <Route path="/update-event-organizer/:userId" element={<UpdateEventOrganizer />} />
        <Route path="/category-event" element={<CategoryEventManager />} />
        <Route path="/cost-detail" element={<CostDetail />} />
        <Route path="/my-farvourite" element={<MyFarvourite />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
