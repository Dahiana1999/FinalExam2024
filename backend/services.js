const axios = require("axios");

// Generación de Imágenes (OpenAI)
exports.generateWithOpenAI = async (prompt) => {
  const response = await axios.post(
    "https://api.openai.com/v1/images/generations",
    { prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data[0].url;
};

// Respuesta a Preguntas (OpenAI)
exports.answerWithOpenAI = async (question) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

// OPEN AI Y VOICE
