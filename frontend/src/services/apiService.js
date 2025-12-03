// frontend/src/services/apiService.js

import axios from "axios";

// Use the VITE environment variable defined in your .env file
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const detectSpill = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile); // 'file' must match the key expected by FastAPI (file: UploadFile = File(...))

  try {
    const response = await axios.post(
      `${API_BASE_URL}/detect_oil_spill`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    // Return a structured error message
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Detection failed on server.";
    throw new Error(errorMessage);
  }
};
