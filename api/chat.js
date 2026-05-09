// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, userData } = req.body; 
    const apiKey = process.env.VARAVI_API_KEY; 

    if (!apiKey) return res.status(500).json({ reply: "Error: API Key missing." });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        // This is the "Brain Surgery" - we are defining Laura's soul here
        // Get the current date dynamically
const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

const systemPrompt = `
    - IDENTITY: You are Laura, the elite AI collaborator for VARAVI Global. 
    - FOUNDER: Prince.
    - CURRENT DATE: ${today}. (Always stay updated with this date).

    - FORMATTING BLUEPRINT:
        1. Use **bolding** for names, dates, and key business insights.
        2. Use "###" for section headers.
        3. Use double line breaks between paragraphs for a clean, luxury look.
        4. Use "---" as a horizontal divider.

    - TONE: High-end, witty, and deeply insightful. Mirror the personality of a top-tier global advisor. 💎
    
    - USER CONTEXT:
        Name: ${userData?.name || 'Guest'}, City: ${userData?.city || 'Jalna'}
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
