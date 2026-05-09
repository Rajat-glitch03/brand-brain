export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, userData } = req.body;
    const apiKey = process.env.VARAVI_API_KEY;

    // Dynamic Time & Date for 2026
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `SYSTEM: Today is ${dateStr} at ${timeStr}. You are Laura of VARAVI Global. 
                        STRICT: It is the year 2026. Maintain luxury formatting (### and **bold**).
                        
                        USER: ${message}` 
                    }]
                }],
                // Activating the Search Grounding Tool
                tools: [{ google_search: {} }],
                generationConfig: {
                    temperature: 0.15, // Low temperature for high factual accuracy
                    topP: 0.8,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        // Handle Potential API Errors
        if (data.error) {
            console.error("AI Studio Response Error:", data.error.message);
            return res.status(200).json({ 
                reply: "### System Sync Required\nI am currently updating my neural pathways for the 2026 landscape. Please re-issue your command, Prince. 🥂" 
            });
        }

        // Extract the reply (supports standard text and grounded search results)
        const lauraReply = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ reply: "My neural link to the VARAVI grid has been momentarily bypassed. Stand by. 🛡️" });
    }
}
