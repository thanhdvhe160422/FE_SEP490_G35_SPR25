import React, { useState } from "react";
import { getRequest } from "../../services/EventRequestService";
import Swal from "sweetalert2";

function MyRequest(props) {
  const [requests, setRequests] = useState([]);
  const fetchRequests = async () => {
    try {
      const data = await getRequest();
      console.log("Fetched Requests: ", data);
      setRequests(data.result);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire("Error", "Unable to fetch requests.", "error");
    }
  };

  return <div></div>;
}

export default MyRequest;
