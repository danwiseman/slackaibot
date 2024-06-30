import {ChatMistralAI} from '@langchain/mistralai';
import {ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {MessageElement} from "@slack/web-api/dist/types/response/ConversationsRepliesResponse";
// @ts-ignore
import {BaseLanguageModelInput} from "@langchain/core/dist/language_models/base";

// REWORK this a little to allow options from Slack?
export enum PromptModels {
    Chat = "mistral-large-latest",
    Code = "codestral-latest",
    Image = "dall-e-4"
}

export async function getMessagesFromSlackMessages(messages: MessageElement[]) {

    if (!messages) throw new Error('No messages found in thread')

    return messages
        .map((message: any) => {
            const isBot = !!message.bot_id && !message.client_msg_id
            const isNotMentioned = !isBot && !message.text.startsWith(`<@`)

            if(isNotMentioned) { return null }

            if(isBot) {
                console.log(`adding ai message ${message.text}`)
                return new AIMessage({content: message.text})
            }
            console.log(`adding human message ${message.text}`)
            return new HumanMessage({ content: message.text.replace(/^<@.*?>/, '')} )
        }).filter(Boolean)
}

export async function getResponseFromModel(prompts:  Promise<(null | AIMessage | HumanMessage)[]>, promptModel: PromptModels) {
    let response = null
    if(promptModel === PromptModels.Image) {
        const client = new DallEAPIWrapper({
            n: 1,
            model: promptModel,
            apiKey: process.env.OPENAI_API_KEY, // Default
        });

        const imagePrompt = (await prompts).filter((message) =>
            message instanceof HumanMessage)
            .map((message) => message.text)
            .join(' ');

        response = { content: await client.invoke(imagePrompt) }
    } else {
        const client = new ChatMistralAI({ model: promptModel })
        response = await client.invoke(await prompts as BaseLanguageModelInput[])
    }

    return response
}
