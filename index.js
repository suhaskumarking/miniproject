import express from "express";
import { config } from "dotenv";
import { checkForAuthentication } from "./middlewares/authentications.js";
import { userRouter } from "./routes/user.js";
import cookieParser from "cookie-parser";
import { urlencoded } from "express";
import connectDB from "./Config/dbConfig.js";

config();
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));

// Remove global authentication middleware
// app.use(checkForAuthentication('user')); // This was blocking your AI endpoint

app.get("/", (req, res) => {
  res.render('index');
});

// Apply authentication only to user routes
app.use('/user', checkForAuthentication('user'), userRouter);

// Minimal Cerebras AI chat endpoint
app.post('/ai/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    console.log('Received message:', message);
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.CEREBRAS_API_KEY;
    console.log('API Key present:', !!apiKey);
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Cerebras API key not configured' });
    }

    // Try alternative models or check available models
    const requestBody = {
      model: 'llama3.1-8b', // Try a more common model
      messages: [
        { 
          role: 'system', 
          content: 'You are a concise coding assistant. Answer clearly with short, helpful explanations and code when needed.' 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    console.log('Sending request to Cerebras API...');
    
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      console.error('Cerebras API error:', errText);
      return res.status(502).json({ 
        error: 'Cerebras API error', 
        status: response.status,
        details: errText 
      });
    }

    const data = await response.json();
    console.log('Received data from Cerebras:', data);
    
    const text = data?.choices?.[0]?.message?.content || 'No response generated';
    return res.json({ reply: text });
    
  } catch (e) {
    console.error('Server error:', e);
    return res.status(500).json({ error: 'Server error: ' + e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});