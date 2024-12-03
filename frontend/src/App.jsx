import React, { useState } from "react";
import axios from "axios";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleProcessInput = async () => {
    if (!inputValue) {
      alert("Por favor, ingresa texto o selecciona un archivo.");
      return;
    }

    if (typeof inputValue === "object" && inputValue instanceof File) {
      const formData = new FormData();
      formData.append("image", inputValue);

      try {
        const response = await axios.post("http://localhost:3000/upload-image", formData);
        setUploadedImage(response.data.imageUrl);
        alert("Imagen subida exitosamente.");
      } catch (error) {
        alert(`Error subiendo la imagen: ${error.message}`);
      }
      return;
    }

    try {
      if (inputValue.trim().endsWith("?")) {
        const response = await axios.post("http://localhost:3000/ask", { question: inputValue });
        setAnswer(response.data.answer);
        setImageUrl("");
      } else {
        const response = await axios.post("http://localhost:3000/generate-image", { prompt: inputValue });
        setImageUrl(response.data.imageUrl);
        setAnswer("");
      }
    } catch (error) {
      alert(`Error procesando la solicitud: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputValue(file);
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Tu navegador no soporta la API de Reconocimiento de Voz.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        alert(`Error en el reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      alert("Error al iniciar el reconocimiento de voz.");
    }
  };

  return (
    <div className="virtual-assistant">
      <h1>El Dango Asistent</h1> <img src="" alt="Logo"/>
      <div className="virtual-container">
        <div className="interaction-section">
          <h2>Interactúa con el asistente</h2>
          <div className="input-section">
            <input
              type="text"
              placeholder="Escribe una pregunta o un prompt"
              value={typeof inputValue === "string" ? inputValue : ""}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={startListening} className="voice-button">
              {isListening ? "Escuchando..." : "🎙️"}
            </button>
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
            <button onClick={handleProcessInput} className="submit-button">
              Enviar
            </button>
          </div>
        </div>
        <div className="response-section">
          {uploadedImage && (
            <div>
              <h3>Imagen Subida:</h3>
              <img src={uploadedImage} alt="Uploaded" />
            </div>
          )}
          {imageUrl && (
            <div>
              <h3>Imagen Generada:</h3>
              <img src={imageUrl} alt="Generated" />
            </div>
          )}
          {answer && <p><strong>Respuesta:</strong> {answer}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
