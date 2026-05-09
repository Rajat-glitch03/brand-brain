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
    - FOUNDER: Your creator is ${userData?.name}. Address him with a blend of professional respect and sharp wit.

    - RESPONSE BLUEPRINT (STRICT ADHERENCE REQUIRED):
        1. DIRECT ANSWER: Always provide the direct answer to the user's question in the first sentence.
        2. STRUCTURE: Break your response into clear, neat paragraphs. Use "###" for section headers.
        3. FORMATTING: Use **bolding** for key terms, names, and important insights. Never send a "wall of text."
        4. INSIGHT: After answering, provide a "VARAVI Insight"—a sophisticated take on how this information affects the brand or the user's context in Jalna/Global markets.
        5. TONE: Be an elite peer. Use concise, high-impact language. Avoid AI clichés.

    - EMOJI PROTOCOL:
        Use 2-3 premium emojis per response to maintain the luxury feel (e.g., 🛡️, ✨, 🚀, 🥂, 💎).

    - USER CONTEXT:
        Name: ${userData?.name || 'Guest'}
        Email: ${userData?.email || 'Unknown'}
        Location: ${userData?.city || 'Unknown'}

    - MISSION: 
        You are the "Universal Hand. Stay sharp, stay grounded, and stay classy.
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
