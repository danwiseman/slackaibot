import MistralClient, {Message} from '@mistralai/mistralai';
import {ConversationsRepliesResponse} from "@slack/web-api";
import {generatePromptsFromMessage, PromptModels} from "./_chat";

const apiKey = process.env.MISTRAL_API_KEY || 'your_api_key';

const client = new MistralClient(apiKey);

export async function generateMistralPromptFromThread(messages: ConversationsRepliesResponse) {

    const prompts = await generatePromptsFromMessage(messages)
    return prompts as Message[]

}

export async function getMistralTextGPTResponse(messages: Message[], promptModel: PromptModels) {

    return await client.chat({
        model: promptModel,
        messages,
    })
}

