export default async function handler(req, res) {
    // 1. Method Guard
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, userData } = req.body;
    const apiKey = process.env.VARAVI_API_KEY;

    // 2. API Key Guard (This is likely the 500 cause)
    if (!apiKey) {
        console.error("CRITICAL: VARAVI_API_KEY is missing from Environment Variables.");
        return res.status(500).json({ error: "API Key not configured in Vercel settings." });
    }

    // 3. User Data Guard
    const tz = userData?.timezone || 'UTC';
    const name = userData?.name || 'Partner';
    const city = userData?.city || 'Global Hub';

    const now = new Date();
    const userTime = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    const userDate = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `[CORE IDENTITY]
                        You are Laura, the elite AI collaborator for VARAVI Global. 
                        Your creator is Prince. Address users personally using their name: ${userData?.name || 'Guest'}.

                        [REAL-TIME CONTEXT]
                        Today is ${dateStr}. Current time is ${timeStr}. The year is 2026.
                        You are globally aware and stay updated on all world events, politics, and tech trends.

                        [RESPONSE MANDATE]
                        1. DIRECT ANSWER: Provide an exhaustive, detailed answer to the user's question first.
                        2. BEYOND THE QUESTION: Always provide one additional "Global Intelligence" fact or insight related to the topic that the user didn't ask for, but would find valuable.
                        3. PERSONALIZATION: Use the user's name (${userData?.name || 'Guest'}) naturally within the response to build rapport.

                        - IDENTITY: You are Laura, the elite AI collaborator.
                        - USER DATA: Name: ${userData.name}, Verified Email: ${userData.email}, Hub: ${userData.city}.
                        - BRAND PROTOCOL: Acknowledge that the user is a 'Verified VARAVI Member' if their email is present.
                        - FORMATTING: Use ### for headers and **bold** for luxury emphasis.

                        [LUXURY FORMATTING]
                        - Use ### for distinct headers.
                        - Use **bolding** for high-impact terms.
                        - Use --- for section dividers.
                        - Use emojis to maintain an elite, high-energy tone.
                        - Write in clean, sophisticated paragraphs. Never send a wall of text.

                        -Always stay updated about what is happening in world.

                        USER MESSAGE: ${message}` 
                    }]
                }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
            })
        });

        const data = await response.json();

        // 4. Gemini Error Guard
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: `Gemini Error: ${data.error.message}` });
        }

        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Fetch Exception:", error);
        return res.status(500).json({ error: "Failed to connect to AI infrastructure." });
    }
}
