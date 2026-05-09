export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // 1. Get the message AND the user data from the frontend
    const { message, userData } = req.body; 
    const apiKey = process.env.VARAVI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: API Key missing." });
    }

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        // 2. We inject the user data into the "System Instructions"
        const systemPrompt = `
            You are Laura, the elite AI agent for VARAVI Global.
            You are currently assisting a verified user.
            USER DETAILS:
            - Name: ${userData?.name || 'Guest'}
            - Email: ${userData?.email || 'Unknown'}
            - Location: ${userData?.city || 'Unknown'}

            Instructions: 
            - Address the user as 'Prince' ONLY if the name matches yours, otherwise use their name.
            - If they ask to book something, you already have their email/location to assist.
            - Stay professional, concise, and high-end.
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
                }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ reply: data.error.message });

        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection failed to Laura's core." });
    }
}
