import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, concatenate, UpSampling2D
import os

MODEL_FILENAME = 'unet_oil_spill.h5'
SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
SAVE_PATH = os.path.join(SAVE_DIR, MODEL_FILENAME)
INPUT_SHAPE = (256, 256, 3) # Must match the size expected by your preprocessing

def build_dummy_unet(input_shape):
    """Creates a very simple U-Net-like structure for file saving."""
    inputs = Input(input_shape)
    
    # Downsample
    c1 = Conv2D(16, (3, 3), activation='relu', padding='same')(inputs)
    p1 = MaxPooling2D((2, 2))(c1)
    
    # Bottleneck
    c2 = Conv2D(32, (3, 3), activation='relu', padding='same')(p1)
    
    # Upsample
    u3 = UpSampling2D((2, 2))(c2)
    m3 = concatenate([u3, c1]) # Skip connection
    
    # Output layer (1 filter for the mask)
    outputs = Conv2D(1, (1, 1), activation='sigmoid')(m3)
    
    model = Model(inputs=[inputs], outputs=[outputs])
    
    # Compile is optional for saving weights, but good practice
    model.compile(optimizer='adam', loss='binary_crossentropy') 
    
    return model

if __name__ == "__main__":
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)
        
    print("Building model structure...")
    dummy_model = build_dummy_unet(INPUT_SHAPE)
    
    # ⚠️ Saving the model correctly populates the .h5 file
    dummy_model.save(SAVE_PATH)
    
    print(f"\n✅ Model successfully saved to: {SAVE_PATH}")
    print("File is now ready to be loaded by the FastAPI API.")