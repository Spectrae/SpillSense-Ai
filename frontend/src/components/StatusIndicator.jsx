// frontend/src/components/StatusIndicator.jsx

import React from "react";

const StatusIndicator = ({ isLoading, error }) => {
  if (isLoading) {
    return <p>Processing...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return null;
};

export default StatusIndicator;
