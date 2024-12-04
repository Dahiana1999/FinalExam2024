import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress"; // Indicador de carga de Material UI

function App() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [isRecording, setIsRecording] = useState(false); // Estado de grabación

  // Función para que el asistente lea el texto
  const speakText = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // Lenguaje configurado a español
    utterance.rate = 1; // Velocidad normal
    utterance.pitch = 1; // Tono normal
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (answer) {
      speakText(answer); // Lee la respuesta cuando cambia
    }
  }, [answer]);

  const handleProcessInput = async () => {
    if (!inputValue) {
      alert("Por favor, ingresa texto o selecciona un archivo.");
      return;
    }

    setIsLoading(true); // Inicia el estado de carga

    if (typeof inputValue === "object" && inputValue instanceof File) {
      const formData = new FormData();
      formData.append("image", inputValue);

      try {
        const response = await axios.post("http://localhost:3000/upload-image", formData);
        setUploadedImage(response.data.imageUrl);
        alert("Imagen subida exitosamente.");
      } catch (error) {
        alert(`Error subiendo la imagen: ${error.message}`);
      } finally {
        setIsLoading(false); // Finaliza el estado de carga
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
    } finally {
      setIsLoading(false); // Finaliza el estado de carga
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
        setIsRecording(true); // Inicia la grabación
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        setIsRecording(false); // Finaliza la grabación
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false); // Finaliza la grabación
      };

      recognition.onerror = (event) => {
        alert(`Error en el reconocimiento: ${event.error}`);
        setIsListening(false);
        setIsRecording(false); // Finaliza la grabación
      };

      recognition.start();
    } catch (error) {
      alert("Error al iniciar el reconocimiento de voz.");
    }
  };

  return (
    <div className="virtual-assistant">
      <h1>El Dango Asistente</h1>

      <div className="virtual-container">
        <div className="interaction-section">
          <h2>Interactúa con el asistente</h2>
          <img src="/12.jpg" alt="Virtual Assistant" className="img-dango" />
          <div className="input-section">
            <input
              type="text"
              placeholder="Escribe una pregunta o un prompt"
              value={typeof inputValue === "string" ? inputValue : ""}
              onChange={(e) => setInputValue(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
            <Button
              onClick={startListening}
              variant="contained"
              color="primary"
              className="mt-2"
            >
              {isListening ? "Escuchando..." : "🎙️"}
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input mt-4"
            />
            <Button
              onClick={handleProcessInput}
              variant="contained"
              color="success"
              className="mt-4"
              disabled={isLoading} // Deshabilita el botón mientras está cargando
            >
              {isLoading ? "Cargando..." : "Enviar"}
            </Button>
          </div>
          {isRecording && (
            <div className="recording-indicator">
              <p>🎤 Grabando...</p>
            </div>
          )}
        </div>
        <div className="response-section">
          {isLoading && (
            <div className="loading-indicator">
              <CircularProgress />
              <p>Procesando tu solicitud...</p>
            </div>
          )}
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
