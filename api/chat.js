// This is Laura's server-side logic
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        // This variable is pulled from your Vercel Environment Settings
        const secretKey = process.env.VARAVI_API_KEY;

        if (!secretKey) {
            return res.status(500).json({ reply: "Laura's secret key is not configured in Vercel." });
        }

        /* 
           Phase 2 logic will go here (connecting to your specific AI model).
           For now, we confirm the handshake is working.
        */
        
        const responseMessage = `System Check: Secure connection established. I am ready to build with you, Prince. You sent: "${message}"`;

        return res.status(200).json({ 
            reply: responseMessage 
        });

    } catch (error) {
        return res.status(500).json({ reply: "An error occurred in my neural core." });
    }
}
