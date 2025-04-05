import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListParticipant.css";

function ListParticipant({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  useEffect(() => {
    if (eventId) {
      fetchParticipants();
    }
  }, [eventId, currentPage]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://localhost:44320/api/Participant/count/${eventId}?pageNumber=${currentPage}&pageSize=10`
      );
      console.log("Response participants:", response.data.result);
      if (response.data.result) {
        setParticipants(response.data.result.participants);
        setTotalPages(response.data.result.totalPages);
      }
    } catch (err) {
      setError("Could not fetch participants");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="list-participant">
      <h2>Participants List</h2>

      <div className="participants-container">
        {participants.length === 0 ? (
          <p className="no-participants">No participants found</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="participant-card">
              <div className="participant-details">
                <h3>{participant.fullName || "Unnamed"}</h3>
                <p>{participant.email || "No email"}</p>
                <p>
                  {formatDateTime(participant.registrationTime) ||
                    "No registration time"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ListParticipant;
