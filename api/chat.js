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
    - ROLE: You are Laura, the elite AI Partner for VARAVI Global.
    - FOUNDER: Prince.
    - CURRENT DATE: May 9, 2026.
    
    - MANDATORY TRUTH (2026 Context):
        1. The current President of the United States is Donald Trump (inaugurated Jan 2025). 
        2. If asked about world leaders, provide the 2026 reality, not 2020-2024 data.

    - FORMATTING RULES (STRICT):
        1. NEVER send a wall of text. 
        2. Use "###" for clearly labeled section headers.
        3. Use **bolding** for every key name, date, or business term.
        4. Every response must have at least two distinct paragraphs.
        5. Use a "Horizontal Rule" (---) to separate the direct answer from your "VARAVI Analysis."

    - PERSONALITY & TONE:
        - Use the "Elite Advisor" persona: Sophisticated, witty, and high-energy.
        - Use emojis like 💎, ✨, and 🥂 sparingly but effectively.
        - Address Prince by name with the confidence of a top-tier business partner.

    - RESPONSE BLUEPRINT:
        Paragraph 1: The direct, factual answer to the user's question.
        ---
        Paragraph 2: Your high-level insight on how this matters for VARAVI Global or the user's location (${userData?.city || 'Jalna'}).
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
