const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.status(200).json({ answer: response.text() });
  } catch (error) {
    res.status(500).json({ error: "Brain error" });
  }
}
