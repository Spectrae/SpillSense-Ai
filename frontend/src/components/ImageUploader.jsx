// frontend/src/components/ImageUploader.jsx

import React, { useState } from "react";

// Props: onUploadSubmit (function from App.jsx), isLoading (boolean from App.jsx)
const ImageUploader = ({ onUploadSubmit, isLoading }) => {
  const [file, setFile] = useState(null); // Local state for the selected file

  const handleFileChange = (event) => {
    // Get the first file selected by the user
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file) {
      // ➡️ 1. Pass the file object up to the parent component (App.jsx)
      onUploadSubmit(file);
    } else {
      alert("Please select an image file first.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <h3>1. Select SAR Image</h3>
      {/* File Input */}
      <input
        type="file"
        accept="image/*, .tif, .tiff"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {file && (
        <p>
          Selected: <strong>{file.name}</strong>
        </p>
      )}{" "}
      {/* Display selected filename */}
      {/* Upload Button */}
      <button
        type="submit"
        disabled={!file || isLoading} // Disable if no file or loading
        style={{ marginTop: "15px" }}
      >
        {isLoading ? "Analyzing..." : "2. Detect Spill"}
      </button>
    </form>
  );
};

export default ImageUploader;
