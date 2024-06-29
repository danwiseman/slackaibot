import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY || 'your_api_key';

const client = new MistralClient(apiKey);