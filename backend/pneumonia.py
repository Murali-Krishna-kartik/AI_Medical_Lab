import sys
import numpy as np
import os
from tensorflow.keras.models import load_model
from PIL import Image
import json

def preprocess_image(image_path):
    img = Image.open(image_path).convert('L')  # Open the image and convert to grayscale
    img = img.resize((36, 36))  # Resize the image to the desired dimensions
    img_array = np.asarray(img)  # Convert the image to a numpy array
    img_array = img_array.reshape((1, 36, 36, 1))  # Reshape to match model input shape
    img_array = img_array / 255.0  # Normalize pixel values
    return img_array

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python pneumonia.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        # Get the directory of the current script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "aimodels", "pneumonia.h5")
        
        img_array = preprocess_image(image_path)  # Preprocess the image
        model = load_model(model_path)  # Load the trained model
        prediction = model.predict(img_array)[0]  # Perform prediction
        print(json.dumps(prediction.tolist()))  # Print the prediction as JSON
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
