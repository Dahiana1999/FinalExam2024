import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false); // Estado del asistente

  const speakText = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (answer) {
      speakText(answer);
    }
  }, [answer]);

  useEffect(() => {
    // Activación por voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Tu navegador no soporta la API de Reconocimiento de Voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript === "hola") {
        setIsAssistantOpen(true); // Activa el asistente
        speakText("Hola, ¿en qué puedo ayudarte?");
      }
    };

    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento de voz:", event.error);
    };

    recognition.start();

    return () => recognition.abort(); // Detiene el reconocimiento al desmontar
  }, []);

  const handleProcessInput = async () => {
    if (!inputValue) {
      alert("Por favor, ingresa texto o selecciona un archivo.");
      return;
    }

    setIsLoading(true);

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
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputValue(file);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta la API de Reconocimiento de Voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      alert(`Error en el reconocimiento: ${event.error}`);
      setIsListening(false);
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="virtual-assistant">
      {isAssistantOpen ? (
        <div>
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
                <Button onClick={startListening} variant="contained" color="primary" className="mt-2">
                  {isListening ? "Escuchando..." : "🎙️"}
                </Button>
                <input type="file" accept="image/*" onChange={handleFileChange} className="file-input mt-4" />
                <Button
                  onClick={handleProcessInput}
                  variant="contained"
                  color="success"
                  className="mt-4"
                  disabled={isLoading}
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
      ) : (
        <p>Di "HOLA" para activar al asistente.</p>
      )}
    </div>
  );
}

export default App;
