const {
  uploadToGemini,
  recognizeWithSpeechify,
  generateWithOpenAI,
  answerWithOpenAI,
} = require("./services");

// Subida de Archivos
exports.uploadFile = async (req, res) => {
  console.log(req.file);
  try {
    const result = await uploadToGemini(req.file);
    res
      .status(200)
      .json({ message: "File uploaded successfully", data: result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
};

// Reconocimiento de Voz
exports.recognizeSpeech = async (req, res) => {
  console.log(req.file);
  try {
    const transcript = await recognizeWithSpeechify(req.file);
    res
      .status(200)
      .json({ message: "Speech recognized successfully", transcript });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error recognizing speech", error: error.message });
  }
};

// Generación de Imágenes
exports.generateImage = async (req, res) => {
  try {
    const imageUrl = await generateWithOpenAI(req.body.prompt);
    res.status(200).json({ message: "Image generated successfully", imageUrl });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error generating image", error: error.message });
  }
};

// Asistente Virtual
exports.askQuestion = async (req, res) => {
  console.log(req.body);
  try {
    const answer = await answerWithOpenAI(req.body.question);
    res.status(200).json({ message: "Answer retrieved successfully", answer });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error retrieving answer", error: error.message });
  }
};
