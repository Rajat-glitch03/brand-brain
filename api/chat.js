// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.VARAVI_API_KEY; // Your Gemini API Key

    if (!apiKey) {
        return res.status(500).json({ reply: "Laura's API key is missing in Vercel settings." });
    }

    try {
        // We are calling the Gemini 1.5 Flash model (fast and efficient)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `You are Laura, the sophisticated AI agent for VARAVI Global. 
                                    You are talking to Prince, the founder. 
                                    Be helpful, professional, and concise. 
                                    Current user message: ${message}` }]
                }]
            })
        });

        const data = await response.json();
        
        // Extract the text from Gemini's specific JSON structure
        const lauraReply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        console.error("Gemini Error:", error);
        return res.status(500).json({ reply: "Prince, I had trouble reaching my neural core. Check the API logs." });
    }
}
