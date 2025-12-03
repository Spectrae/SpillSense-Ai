// frontend/src/App.jsx (Complete Logic)

import React, { useState } from "react";
import Header from "./components/Header.jsx";
import ImageUploader from "./components/ImageUploader.jsx";
import ResultsDisplay from "./components/ResultsDisplay.jsx";
import StatusIndicator from "./components/StatusIndicator.jsx";
import { detectSpill } from "./services/apiService.js";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handles the file upload and calls the backend API.
   * This function is passed to the ImageUploader component.
   */
  const handleDetection = async (imageFile) => {
    setError(null);
    setResults(null);
    setIsLoading(true);

    try {
      // ➡️ 2. Call the API service with the file
      const detectionData = await detectSpill(imageFile);
      setResults(detectionData); // Store results on success
    } catch (err) {
      setError(err.message); // Store error on failure
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="container">
        {/* Pass the handler function and loading state */}
        <ImageUploader onUploadSubmit={handleDetection} isLoading={isLoading} />
        <hr />

        {/* Conditional rendering based on state */}
        {(isLoading || error) && (
          <StatusIndicator isLoading={isLoading} error={error} />
        )}

        {!isLoading && !error && results && (
          <ResultsDisplay results={results} />
        )}
      </main>
    </div>
  );
}

export default App;
