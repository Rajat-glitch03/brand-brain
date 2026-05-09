// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message } = req.body;
    const apiKey = process.env.VARAVI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: VARAVI_API_KEY is not defined in Vercel settings." });
    }

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `User: ${message}\nResponse as Laura from VARAVI Global:` }]
                }]
            })
        });

        const data = await response.json();

        // Check if Gemini returned an error (like an invalid key)
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(500).json({ reply: `Gemini Error: ${data.error.message}` });
        }

        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection failed. Prince, check the Vercel logs for the specific error." });
    }
}
