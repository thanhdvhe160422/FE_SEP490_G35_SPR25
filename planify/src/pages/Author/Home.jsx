import EventSection from "../../components/EventSection";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "../../styles/Author/Home.css";
import { Navigate } from "react-router-dom";
function Home() {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Header></Header>
      <EventSection />
      {/* <Footer /> */}
    </div>
  );
}
export default Home;
