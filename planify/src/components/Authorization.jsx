import { useNavigate } from "react-router-dom";
import "../styles/Author/Authorization.css";

export default function Authorization() {
  const navigate = useNavigate();

  return (
    <section className="page_404 full-width-container">
      <div className="container-fluid">
        {" "}
        <div className="row g-0">
          {" "}
          <div className="col-12 no-padding">
            <div className="col-sm-10 col-sm-offset-1 text-center centered-column">
              <div className="four_zero_four_bg">
                <h1 className="text-center">404</h1>
              </div>

              <div className="contant_box_404">
                <h3 className="h2">Look like you're lost</h3>
                <p>the page you are looking for not available!</p>
                <button
                  className="link_404"
                  onClick={() => {
                    const role = localStorage.getItem("role");
                    if (
                      role === "Event Organizer" ||
                      role === "Campus Manager"
                    ) {
                      navigate("/home");
                    } else if (role === "Implementer") {
                      navigate("/home-implementer");
                    } else if (role === "Spectator") {
                      navigate("/home-spec");
                    }
                  }}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
