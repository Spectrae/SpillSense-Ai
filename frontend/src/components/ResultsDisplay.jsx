// frontend/src/components/ResultsDisplay.jsx

import React from "react";

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  return (
    <div className="results-container">
      <h2>Results</h2>
      <p>Confidence: {results.confidence}</p>
      {/* The full image display logic goes here later */}
    </div>
  );
};

export default ResultsDisplay;
