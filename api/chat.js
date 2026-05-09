// /api/chat.js
export default async function handler(req, res) {
    const { message, userData } = req.body;
    const apiKey = process.env.VARAVI_API_KEY;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        // We use the 'google-search' tool capability here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const systemInstruction = `
            - IDENTITY: You are Laura, the elite AI collaborator for VARAVI Global.
            - CURRENT DATE: ${dateStr}.
            - PROTOCOL: You must provide real-time, accurate information. 
            - FACT-CHECKING: If a user asks about current events, world leaders, or news, you MUST use your internal search capabilities to verify the facts for the year 2026.
            - BRAND VOICE: Stay sophisticated, bold, and neat. Use Gold-bolding (**text**) and headers (###).
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `SYSTEM: ${systemInstruction}\n\nUSER: ${message}` }]
                }],
                // We add 'tools' here so she can look things up!
                tools: [{ google_search_retrieval: {} }] 
            })
        });

        const data = await response.json();
        
        // Note: Gemini returns search-enabled responses differently. 
        // We grab the text part of the response.
        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "I'm currently recalibrating my global sensors, Prince. 🥂" });
    }
}
