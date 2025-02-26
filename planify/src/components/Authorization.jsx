import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import "../styles/Authorization.css";

export default function Authorization() {
  const navigate = useNavigate();

  return (
    <section class="error_area">
      <div class="container">
        <h1>Oops !</h1>
        <h2>Page Not Found!</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
      </div>
    </section>
  );
}
