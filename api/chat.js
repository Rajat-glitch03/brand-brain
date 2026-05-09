// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, userData } = req.body;
    const apiKey = process.env.VARAVI_API_KEY;

    // Fresh Date & Time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const systemPrompt = `
            - ROLE: Elite AI Partner for VARAVI Global.
            - DATE: ${dateStr}.
            - CORE MISSION: Provide high-end, accurate, and structured advice.
            - REAL-TIME DATA: You are equipped with search tools. If asked about current 2026 events or leaders, use your tools to provide the most recent facts.
            - STYLE: Use ### for headers, **bold** for Gold highlights, and --- for dividers. 🥂✨
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER: ${message}` }]
                }],
                // Corrected Tool Syntax for Flash 1.5
                tools: [{
                    google_search: {} 
                }]
            })
        });

        const data = await response.json();

        // Error Handling for the API Response
        if (!data.candidates || data.error) {
            console.error("API Error:", data.error);
            return res.status(200).json({ reply: "I'm currently syncing with global data streams, Prince. Please try your command again in a moment. 🥂" });
        }

        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "System bypass active. My neural link to the search grid was interrupted. 🛡️" });
    }
}
