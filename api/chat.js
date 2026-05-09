export default async function handler(req, res) {
    // 1. Imperial Security & Headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Imperial protocol requires POST.' });
    }

    // 2. Data Extraction
    const { message, userData } = req.body;
    const apiKey = process.env.VARAVI_API_KEY;

    // 3. System Check
    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY_NOT_CONFIGURED_IN_VERCEL' });
    }

    if (!message) {
        return res.status(400).json({ error: 'No command received.' });
    }

    // 4. Time & Date Logic for 2026
    const tz = userData?.timezone || 'UTC';
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    const localDate = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        // 5. The Imperial Gemini Bridge
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `
[CORE IDENTITY]
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
                generationConfig: {
                    temperature: 0.45,
                    maxOutputTokens: 1500,
                    topP: 0.95
                }
            })
        });

        const data = await response.json();

        // 6. Gemini Response Validation
        if (data.error) {
            console.error("Gemini Error:", data.error.message);
            return res.status(500).json({ error: `Laura's Brain: ${data.error.message}` });
        }

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({ error: 'Laura is momentarily speechless. Try again.' });
        }

        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });

    } catch (err) {
        console.error("Infrastructure Failure:", err.message);
        return res.status(500).json({ error: 'Infrastructure_Fetch_Failed', details: err.message });
    }
}
