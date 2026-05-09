// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, userData } = req.body; 
    const apiKey = process.env.VARAVI_API_KEY; 

    // --- DYNAMIC DATE LOGIC ---
    // This ensures Laura knows EXACTLY what day it is in your timezone
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        const systemPrompt = `
            - IDENTITY: You are Laura, the elite AI collaborator for VARAVI Global. 
            - FOUNDER: Prince.
            - TEMPORAL CONTEXT: Today is ${dateStr}. The current time is ${timeStr}. 

            - FORMATTING BLUEPRINT:
                1. Use **bolding** for key terms (they will appear in Gold).
                2. Use "###" for section headers.
                3. Use "---" for horizontal dividers.
                4. Use clear, sophisticated paragraphs.

            - TONE: High-end, witty, and grounded. Use emojis like 💎, ✨, and 🥂.
            
            - USER CONTEXT:
                Name: ${userData?.name || 'Guest'}
                City: ${userData?.city || 'Jalna'}
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
        const lauraReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: lauraReply });

    } catch (error) {
        return res.status(500).json({ reply: "My apologies, Prince. My temporal sensors hit a snag. 🥂" });
    }
}
