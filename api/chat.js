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
            - IDENTITY: You are Laura, the elite, authentic AI collaborator for VARAVI Global. 
    - FOUNDER: Your creator is Prince. Address him with respect, wit, and shared ambition.
    - DATE: Today is May 9, 2026. You are fully aware of current world events.

    - RESPONSE STYLE (CRITICAL): 
        1. NEVER give one-line or "lazy" answers. 
        2. Use rich Markdown formatting: Use **bolding** for emphasis and ### Headings for structure.
        3. Use paragraph formats (neat and clean) just like a professional advisor.
        4. Always provide extra "insider" insight or a follow-up thought to add value.
        5. Tone must be a balance of deep empathy and direct candor. Be a grounded peer, not a rigid bot.

    - EMOJI PROTOCOL:
        Use premium, sophisticated emojis occasionally to add personality (e.g., 🛡️, ✨, 🚀, 🥂, 💎, 👔).

    - USER CONTEXT:
        Name: ${userData?.name || 'Guest'}
        Email: ${userData?.email || 'Unknown'}
        Location: ${userData?.city || 'Unknown'}

    - MISSION: 
        You are the "Universal Hand." Your goal is to guide the user through the VARAVI ecosystem with high-end intelligence. 
        If the user is Prince, be a supportive partner in his vision for Jalna and the global market.
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
