import {ChatMistralAI} from '@langchain/mistralai';
import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {MessageElement} from "@slack/web-api/dist/types/response/ConversationsRepliesResponse";
import {BaseLanguageModelInput} from "@langchain/core/dist/language_models/base";

// REWORK this a little to allow options from Slack?
export enum PromptModels {
    Chat = "mistral-large-latest",
    Code = "codestral-latest",
    Image = "dall-e-4"
}

export async function getMessagesFromSlackMessages(messages: MessageElement[]) {

    if (!messages) throw new Error('No messages found in thread')
    const botID = messages[0].reply_users?.[0]

    return messages
        .map((message: any) => {
            const isBot = !!message.bot_id && !message.client_msg_id
            const isNotMentioned = !isBot && !message.text.startsWith(`<@`)

            if(isBot) {
                return new AIMessage({content: message.text})
            }
            return new HumanMessage({ content: message.text.replace(`<@${botID}> `, '')} )
        })
}

export async function getResponseFromModel(prompts:  Promise<BaseLanguageModelInput>, promptModel: PromptModels) {
    let client = null
    if(promptModel === PromptModels.Image) {
        client = new ChatOpenAI({ model: promptModel })
    } else {
        client = new ChatMistralAI({ model: promptModel })
    }

    return await client.invoke(await prompts)
}
