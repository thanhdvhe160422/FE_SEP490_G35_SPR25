import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Author/Login";
import Authorization from "./components/Authorization";
import LoginAdmin from "./pages/Author/LoginAdmin";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Author/Home";
import Profile from "./pages/Author/Profile";
import EventDetailSpec from "./pages/Events/EventDetailSpec";
import UpdateProfile from "./pages/Author/UpdateProfile";
import EventDetailEOG from "./pages/Events/EventDetailEOG";
import ManageRequest from "./pages/Events/ManageRequest";
import HomeOfImplementer from "./pages/Author/HomeOfImplementer";
import UpdateEvent from "./pages/Events/UpdateEvent";
import CostDetail from "./pages/Events/CostDetail";
import CreateEventOrganizer from "./pages/Author/CreateEventOrganizer";
import CategoryEventManager from "./pages/Events/CategoryEventManager";
import HomeSpectator from "./pages/Author/HomeSpectator";
import EventPlan from "./pages/Events/EventPlan";
import Dashboard from "./pages/Admin/Dashboard";
import MyFarvourite from "./pages/Events/MyFarvourite";
import EventRegistered from "./pages/Events/EventRegistered";
import HistoryEvent from "./pages/Events/HistoryEvent";
import MyEvent from "./pages/Events/MyEvent";
import MyRequest from "./pages/Events/MyRequest";
import MyDraft from "./pages/Events/MyDraft";
import ManageCampusManager from "./pages/Admin/ManageCampusManager";
import { ToastContainer } from "react-toastify";
import ManageUser from "./pages/Admin/ManageUser";
import ChangePassword from "./pages/Admin/ChangePassword";
import ListPermissionEventOrganizer from "./pages/Author/ListPermissionEventOrganizer";
import ManageCampus from "./pages/Admin/ManageCampus";

function App() {
  const getRedirectPath = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return "/login";
    }

    const role = localStorage.getItem("role");
    if (role === "Campus Manager" || role === "Event Organizer") {
      return "/home";
    } else if (role === "Implementer") {
      return "/home-implementer";
    } else if (role === "Spectator") {
      return "/home-spec";
    } else {
      return "/login";
    }
  };
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/authorization" element={<Authorization />} />

        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
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
                "Implementer",
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
                "Implementer",
              ]}
            >
              <UpdateProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/home-spec"
          element={
            <PrivateRoute allowedRoles={["Spectator", "Implementer"]}>
              <HomeSpectator />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/favorite-events"
          element={
            <PrivateRoute allowedRoles={["Spectator"]}>
              <MyFarvourite />
            </PrivateRoute>
          }
        />
        <Route
          path="/event-registered"
          element={
            <PrivateRoute allowedRoles={["Spectator"]}>
              <EventRegistered />
            </PrivateRoute>
          }
        />

        <Route
          path="/event-plan"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <EventPlan />
            </PrivateRoute>
          }
        />

        <Route
          path="/event-detail-spec/:eventId"
          element={
            <PrivateRoute allowedRoles={["Spectator", "Implementer"]}>
              <EventDetailSpec />
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
                "Implementer",
              ]}
            >
              <EventDetailEOG />
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
          path="/my-request"
          element={
            <PrivateRoute allowedRoles={["Event Organizer"]}>
              <MyRequest />
            </PrivateRoute>
          }
        />

        <Route
          path="/update-event/:id"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <UpdateEvent />
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
        <Route
          path="/manage-eog"
          element={
            <PrivateRoute allowedRoles={["Campus Manager"]}>
              <CreateEventOrganizer />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-permission"
          element={
            <PrivateRoute allowedRoles={["Campus Manager"]}>
              <ListPermissionEventOrganizer />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-drafts"
          element={
            <PrivateRoute allowedRoles={["Event Organizer"]}>
              <MyDraft />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-user"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <ManageUser />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-campus-manager"
          element={
            <PrivateRoute allowedRoles={["Admin", "Campus Manager"]}>
              <ManageCampusManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/category-event"
          element={
            <PrivateRoute allowedRoles={["Campus Manager"]}>
              <CategoryEventManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/history-event"
          element={
            <PrivateRoute allowedRoles={["Implementer"]}>
              <HistoryEvent />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-event"
          element={
            <PrivateRoute allowedRoles={["Campus Manager", "Event Organizer"]}>
              <MyEvent />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-favorite-events"
          element={
            <PrivateRoute
              allowedRoles={[
                "Campus Manager",
                "Event Organizer",
                "Implementer",
                "Spectator",
              ]}
            >
              <MyFarvourite />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-campus"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <ManageCampus></ManageCampus>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />

        <Route path="/cost-detail" element={<CostDetail />}></Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

export default App;
