# backend/core/model_inference.py
import tensorflow as tf
import numpy as np
import cv2
import os
import base64

# Define the expected model path relative to this file
# backend/core/model_inference.py

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../saved_models/unet_oil_spill.h5')

# Load the model globally when the API starts for efficiency
# backend/core/model_inference.py (TEMP DEBUG CODE)
# ... imports ...
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../saved_models/unet_oil_spill.h5')

# backend/core/model_inference.py
import os
# ... other imports

# 1. Define the PATH (example name: unet_oil_spill.h5)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../saved_models/unet_oil_spill.h5') 

# 2. Add debugging checks:
try:
    print(f"\n--- DEBUG START ---")
    print(f"Current File Dir: {os.path.dirname(__file__)}")
    print(f"Expected Model Path: {MODEL_PATH}")
    print(f"Path Exists: {os.path.exists(MODEL_PATH)}") # ⬅️ CRUCIAL CHECK

    # Attempt to load the model
    MODEL = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Deep Learning Model loaded successfully.")
    print(f"--- DEBUG END ---\n")
except Exception as e:
    print(f"--- FATAL LOAD ERROR ---")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {e}")
    MODEL = None
# ... rest of the file ...

def preprocess_image(image_bytes):
    """Decodes raw bytes and prepares the image for the model."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) # Decode image
    if img is None:
        raise ValueError("Could not decode image.")

    # Your specific preprocessing steps: Resize, normalize
    INPUT_SIZE = (256, 256) # Must match your model's training size
    resized_img = cv2.resize(img, INPUT_SIZE) 
    normalized_img = resized_img / 255.0
    return normalized_img, img # Return normalized input AND original for overlay

def get_prediction_results(image_bytes):
    """Runs segmentation and returns processed image data and metrics."""

    if MODEL is None:
        raise RuntimeError("Model is not loaded. Check model path.")

    # 1. Preprocess
    input_image, original_image = preprocess_image(image_bytes)

    # 2. Run Prediction
    # Add batch dimension (1, 256, 256, 3)
    prediction = MODEL.predict(np.expand_dims(input_image, axis=0))[0] 

    # 3. Process Mask and Metrics
    THRESHOLD = 0.5
    binary_mask = (prediction > THRESHOLD).astype(np.uint8) * 255
    spill_area_pixels = np.sum(binary_mask) / 255

    # 4. Create Final Output Image (e.g., Overlay Mask)
    # Resize mask back to original size for a clear output
    resized_mask = cv2.resize(binary_mask, (original_image.shape[1], original_image.shape[0]))

    # Create an overlay (optional: customize color)
    oil_color = (0, 0, 255) # Blue overlay
    output_image = original_image.copy()
    output_image[resized_mask == 255] = output_image[resized_mask == 255] * 0.5 + np.array(oil_color) * 0.5

    # 5. Encode Output Image to Base64
    _, buffer = cv2.imencode('.png', output_image)
    base64_image = base64.b64encode(buffer).decode('utf-8')

    return {
        "image_data": base64_image, 
        "spill_area_pixels": int(spill_area_pixels),
        "confidence": float(np.mean(prediction)), # Mean probability over the mask
    }