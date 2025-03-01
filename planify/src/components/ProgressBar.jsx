import React from "react";
import "../styles/ProgressBar.css";

function ProgressBar({ label, percentage, color }) {
  return (
    <div className="progress_bar">
      <label>{label}:</label>
      <div className="progress">
        <div
          className="progress_fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
