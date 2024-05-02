import { OpenAI } from 'openai';
import got from 'got';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // Starting delay in milliseconds

const openai = new OpenAI({
    apiKey: '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',
});

const runPrompt = async () => {
    // This is just an example, but could be something you keep track of
    // in your application to provide OpenAI as prompt text.
    const chatLog = 'Human: Hello, who are you?\nAI: I am doing great. How can I help you today?\n';

    // The new question asked by the user.
    const question = 'Could you tell me what your favorite German thrash metal album is?';

    (async () => {
        const url = 'https://api.openai.com/v1/engines/davinci/completions';
        const prompt = `${chatLog}Human: ${question}`;
        const params = {
            'prompt': prompt,
            'max_tokens': 150,
            'temperature': 0.9,
            'frequency_penalty': 0,
            'presence_penalty': 0.6,
            'stop': '\nHuman'
        };
        const headers = {
            'Authorization': `Bearer ${openai}`,
        };

        try {
            const response = await got.post(url, { json: params, headers: headers }).json();
            output = `${prompt}${response.choices[0].text}`;
            console.log(output);
        } catch (err) {
            console.log(err);
        }
    });
};

export default async function sendMessageToChatGPT(message) {
    try {
        await runPrompt();
    } catch (error) {
        //console.error('Error:', error.message);

      throw error;
    }
}
