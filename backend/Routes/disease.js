import express from "express";
import { spawn } from "child_process";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model paths
const diabetesModel = path.join(__dirname, "..", "aimodels", "diabetes.pkl");
const heartModel = path.join(__dirname, "..", "aimodels", "heart.pkl");
const kidneyModel = path.join(__dirname, "..", "aimodels", "kidney.pkl");
const liverModel = path.join(__dirname, "..", "aimodels", "liver.pkl"); // Fixed: was pointing to kidney.pkl
const breastCancerModel = path.join(__dirname, "..", "aimodels", "breast_cancer.pkl");

// Python script paths
const pythonScriptPathForDiabetes = path.join(__dirname, "..", "predict.py");
const pythonScriptPathForHeart = path.join(__dirname, "..", "heart.py");
const pythonScriptPathForKidney = path.join(__dirname, "..", "kidney.py");
const pythonScriptPathForLiver = path.join(__dirname, "..", "liver.py");
const pythonScriptPathForBreastCancer = path.join(__dirname, "..", "breast-cancer.py");

router.post("/diabetes", (req, res) => {
  try {
    const data = req.body.data;
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForDiabetes,
      "--loads",
      diabetesModel,
      JSON.stringify(data),
    ]);
    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});
router.post("/heart", (req, res) => {
  try {
    const data = req.body.data;
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForHeart,
      "--loads",
      heartModel,
      JSON.stringify(data),
    ]);
    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});
router.post("/kidney", (req, res) => {
  try {
    const data = req.body.data;
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForKidney,
      "--loads",
      kidneyModel,
      JSON.stringify(data),
    ]);
    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});
router.post("/liver", (req, res) => {
  try {
    const data = req.body.data;
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForLiver,
      "--loads",
      liverModel,
      JSON.stringify(data),
    ]);
    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});
router.post("/breast-cancer", (req, res) => {
  try {
    const data = req.body.data;
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForBreastCancer,
      "--loads",
      breastCancerModel,
      JSON.stringify(data),
    ]);
    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.post("/predict-pneumonia", upload.single("image"), (req, res) => {
  try {
    // Get the uploaded image file path
    const imagePath = req.file.path;

    // Path to the Python script for pneumonia prediction
    const pythonScriptPathForPneumonia = path.join(__dirname, "..", "pneumonia.py");

    // Spawn a Python process to execute the prediction script
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForPneumonia,
      imagePath,
    ]);

    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});

router.post("/predict-malaria", upload.single("image"), (req, res) => {
  try {
    // Get the uploaded image file path
    const imagePath = req.file.path;

    // Path to the Python script for malaria prediction
    const pythonScriptPathForMalaria = path.join(__dirname, "..", "malaria.py");

    // Spawn a Python process to execute the prediction script
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [
      pythonScriptPathForMalaria,
      imagePath,
    ]);

    let prediction = "";
    let responseSent = false; // Flag to track if response has been sent

    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script output:", data.toString());
      prediction += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Prediction:", prediction);
      if (!responseSent) {
        res.json({ prediction });
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});

export default router;
