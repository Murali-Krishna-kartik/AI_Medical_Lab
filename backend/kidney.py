import sys
import numpy as np
import json
import os

# Import the safe model loader
try:
    from model_loader import load_model_safely
except ImportError:
    # Fallback to regular pickle if model_loader is not available
    import pickle
    def load_model_safely(path):
        with open(path, 'rb') as f:
            return pickle.load(f)

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

try:
    # Parse command line arguments
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: python kidney.py --loads <model_path> <data>"}))
        sys.exit(1)
    
    model_path = sys.argv[2]  # --loads flag, then model path
    data_json = sys.argv[3]   # JSON data
    
    # If model path is relative, make it absolute
    if not os.path.isabs(model_path):
        model_path = os.path.join(script_dir, model_path)
    
    # Load the model using safe loader
    model = load_model_safely(model_path)
    
    # Parse and prepare data
    data = list(json.loads(data_json).values())
    data_array = np.array(data, dtype=np.float32).reshape(1, -1)
    
    # Make prediction
    prediction = model.predict(data_array)
    
    # Try to get prediction probability if available
    try:
        if hasattr(model, 'predict_proba'):
            probability = model.predict_proba(data_array)
            result = {
                "prediction": prediction.tolist(),
                "probability": probability.tolist()
            }
        else:
            result = {"prediction": prediction.tolist()}
    except:
        result = {"prediction": prediction.tolist()}
    
    print(json.dumps(result))
    
except FileNotFoundError as e:
    print(json.dumps({"error": f"Model file not found: {str(e)}"}))
except json.JSONDecodeError as e:
    print(json.dumps({"error": f"Invalid JSON data: {str(e)}"}))
except Exception as e:
    print(json.dumps({"error": f"Prediction failed: {str(e)}"}))