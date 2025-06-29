import './App.css';
import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MODEL_URLS = {
  freshness: "./freshness_model/",
  damageDelivery: "./damage_delivery_model/",
  damageCan: "./damage_can_model/",
};

function App() {
  const [models, setModels] = useState({
    freshness: null,
    damageDelivery: null,
    damageCan: null,
  });
  const [predictions, setPredictions] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const webcamRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [details, setDetails] = useState("");
  const [selectedModel, setSelectedModel] = useState("freshness");

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    const freshnessModel = await tmImage.load(
      MODEL_URLS.freshness + "model.json",
      MODEL_URLS.freshness + "metadata.json"
    );
    const damageDeliveryModel = await tmImage.load(
      MODEL_URLS.damageDelivery + "model.json",
      MODEL_URLS.damageDelivery + "metadata.json"
    );
    const damageCanModel = await tmImage.load(
      MODEL_URLS.damageCan + "model.json",
      MODEL_URLS.damageCan + "metadata.json"
    );
    setModels({
      freshness: freshnessModel,
      damageDelivery: damageDeliveryModel,
      damageCan: damageCanModel,
    });
  }

  async function handleImageUpload(event) {
    const { files } = event.target;
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setImageURL(url);
      stopWebcam();
      setTimeout(() => {
        predictImage(url);
      }, 500);
    }
  }

  async function startWebcam() {
    stopWebcam();
    const webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;
    setWebcamActive(true);
    window.requestAnimationFrame(loop);
  }

  function stopWebcam() {
    if (webcamRef.current) {
      webcamRef.current.stop();
      webcamRef.current = null;
      setWebcamActive(false);
    }
  }

  async function loop() {
    if (webcamRef.current) {
      webcamRef.current.update();
      await predictWebcam();
      window.requestAnimationFrame(loop);
    }
  }

  async function predictImage(url) {
    if (!models[selectedModel]) return;
    const img = new Image();
    img.src = url;
    img.onload = async () => {
      const prediction = await models[selectedModel].predict(img);
      setPredictions(prediction);
      updateDetails(prediction);
    };
  }

  async function predictWebcam() {
    if (!models[selectedModel] || !webcamRef.current) return;
    const prediction = await models[selectedModel].predict(webcamRef.current.canvas);
    setPredictions(prediction);
    updateDetails(prediction);
  }

  function updateDetails(prediction) {
    if (!prediction || prediction.length === 0) {
      setDetails("No prediction available.");
      return;
    }
    const topPrediction = prediction.reduce((max, p) =>
      p.probability > max.probability ? p : max
    );

    const detailsMap = {
      freshness: {
        fresh: "This food package looks Fresh 🍏! It shows natural color, no dents, and the predicted freshness score is high.",
        damaged: "This package looks Damaged ⚠️. Packaging might have dents, leaks, or spoilage signs.",
        stale: "This package is showing signs of Staleness 🍂. The texture might be dry, color faded, and quality lower.",
      },
      damageDelivery: {
        damaged: "The delivery package is Damaged Delivery ⚠️. It might have dents, tears, or other damage.",
        good: "The delivery package is in Good condition ✅. No visible damage detected.",
      },
      damageCan: {
        damaged: "The can is Damaged Can ⚠️. It might be dented, leaking, or rusted.",
        good: "The can is in Good condition ✅. No visible damage detected.",
      },
    };

    setDetails(
      topPrediction && detailsMap[selectedModel][topPrediction.className.toLowerCase()]
        ? detailsMap[selectedModel][topPrediction.className.toLowerCase()]
        : "Unknown quality detected."
    );
  }

  const chartColors = {
    freshness: ["#4caf50", "#f44336", "#ff9800"],
    damageDelivery: ["#2196F3", "#FFC107"],
    damageCan: ["#9C27B0", "#00BCD4"],
  };

  function getChartData(prediction, colors) {
    // Map class names to more descriptive labels for damageDelivery and damageCan
    const labelMap = {
      damageDelivery: {
        damaged: "Damaged Delivery Package",
        good: "Good Delivery Package",
      },
      damageCan: {
        damaged: "Damaged Can",
        good: "Good Can",
      },
    };

    const labels = prediction.map((p) => {
      if (selectedModel === "damageDelivery" || selectedModel === "damageCan") {
        return labelMap[selectedModel][p.className.toLowerCase()] || p.className;
      }
      return p.className;
    });

    return {
      labels: labels,
      datasets: [
        {
          label: "Prediction Probability",
          backgroundColor: colors,
          data: prediction.map((p) => p.probability),
          borderWidth: 1,
        },
      ],
    };
  }

  return (
    <div className="App">
      <h1 className="app-title">🍱 Food Package Quality Checker</h1>

      <div className="info-section card">
        <h2>About This App</h2>
        <p>
          This app uses AI models trained with Teachable Machine to predict the freshness and quality of food packages based on images.
          You can upload an image or use your webcam to get real-time predictions.
        </p>
        <h3>Tips for Best Results</h3>
        <ul>
          <li>Use clear, well-lit images of the food package.</li>
          <li>Ensure the package is fully visible in the frame.</li>
          <li>Stop the webcam to analyze a specific frame.</li>
        </ul>
      </div>

      <div className="model-select-section card">
        <label htmlFor="model-select">Select Model to Detect:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="model-select"
        >
          <option value="freshness">Freshness</option>
          <option value="damageDelivery">Damaged Delivery Package</option>
          <option value="damageCan">Damaged Can</option>
        </select>
      </div>

      <div className="upload-section card">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
        <button onClick={startWebcam} className="button primary-button">Start Webcam</button>
        {webcamActive && (
          <button onClick={stopWebcam} className="button secondary-button">Stop Webcam</button>
        )}
      </div>

      <div className="media-section">
        {imageURL && (
          <div className="preview-section card">
            <img src={imageURL} alt="Uploaded" className="preview-image" />
          </div>
        )}

        {webcamActive && (
          <div className="webcam-section card">
            <canvas ref={(el) => {
              if (webcamRef.current && el) {
                const ctx = el.getContext("2d");
                ctx.drawImage(webcamRef.current.canvas, 0, 0, 300, 300);
              }
            }} width="300" height="300" />
          </div>
        )}
      </div>

      <div className="result-section card">
        <div className="chart-card">
          {predictions.length > 0 && (
            <Bar
              data={getChartData(predictions, chartColors[selectedModel])}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 1,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
              width={300}
              height={300}
            />
          )}
        </div>

        <div className="details-text">
          <p>{details}</p>
        </div>

        <div className="percentages-list">
          {predictions.length > 0 && (
            <ul>
              {predictions.map((p, index) => (
                <li key={index}>
                  {p.className}: {(p.probability * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
