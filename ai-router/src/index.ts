import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Redis client
const redis = createClient({
  url: 'redis://redis:6379'
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Initialize Redis connection
async function initRedis() {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      redis: redis.isOpen ? 'connected' : 'disconnected'
    }
  });
});

// AI routing endpoint
app.post('/ai/chat', async (req, res) => {
  try {
    const { message, model = 'llama2' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Cache key for the request
    const cacheKey = `chat:${Buffer.from(message).toString('base64')}`;
    
    // Check cache first
    if (redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ response: cached, cached: true });
      }
    }

    // Make request to Ollama
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt: message,
      stream: false
    });

    const aiResponse = response.data.response;

    // Cache the response
    if (redis.isOpen) {
      await redis.setEx(cacheKey, 3600, aiResponse); // Cache for 1 hour
    }

    res.json({ response: aiResponse, cached: false });
  } catch (error) {
    console.error('AI routing error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Start server
async function startServer() {
  await initRedis();
  
  app.listen(PORT, () => {
    console.log(`AI Router service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error); 