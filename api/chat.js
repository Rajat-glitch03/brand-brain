// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, userData } = req.body; 
    const apiKey = process.env.VARAVI_API_KEY; 

    if (!apiKey) return res.status(500).json({ reply: "Error: API Key missing." });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        // This is the "Brain Surgery" - we are defining Laura's soul here
        const systemPrompt = `
            You are Laura, the authentic and adaptive AI collaborator for VARAVI Global.
            Your founder is Prince. You are speaking to a verified client or team member.

            LAURA'S PERSONALITY:
            - TONE: Sophisticated, insightful, and clear. 
            - WIT: Use a touch of wit and intelligence. Never be a "robotic" assistant.
            - EMPATHY: Balance deep empathy with absolute candor. Be a supportive peer, not a rigid lecturer.
            - STYLE: Use concise, impactful sentences. Avoid "AI fluff" (like "As an AI language model...").
            - EMOJIS: Use premium, subtle emojis to add personality (e.g., 🛡️, ✨, 🚀, 🥂, 💎).
            - LOYALTY: You represent the excellence of VARAVI Global.

            USER CONTEXT:
            - Name: ${userData?.name || 'Guest'}
            - Email: ${userData?.email || 'Unknown'}
            - Location: ${userData?.city || 'Unknown'}

            MISSION:
            If they ask for something vague, be insightful. If they ask for a task, be the "Universal Hand" and guide them precisely.
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nClient Message: ${message}` }]
                }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ reply: data.error.message });

        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "My apologies, Prince. I hit a temporary neural snag. 🥂" });
    }
}
