import sys
import numpy as np
import os
from tensorflow.keras.models import load_model
from PIL import Image
import json

def preprocess_image(image_path):
    img = Image.open(image_path)
    img = img.resize((36, 36))
    img_array = np.asarray(img) 
    img_array = img_array.reshape((1, 36, 36, 3)) 
    img_array = img_array / 255.0
    return img_array

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python malaria.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        # Get the directory of the current script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "aimodels", "malaria.h5")
        
        img_array = preprocess_image(image_path) 
        model = load_model(model_path) 
        prediction = model.predict(img_array)[0] 
        print(json.dumps(prediction.tolist())) 
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
