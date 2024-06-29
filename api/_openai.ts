import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import type { ConversationsRepliesResponse } from '@slack/web-api'
import type { ImageGenerateParams } from "openai/resources";
import exp from "node:constants";

const openai = new OpenAI()



export async function getGPTResponse(messages: ChatCompletionMessageParam[]) {

}

export async function getTextGPTResponse(messages: ChatCompletionMessageParam[], model: string = "gpt-3.5-turbo") {

    return await openai.chat.completions.create({
        model,
        messages,
    })
}

export async function getImageGPTResponse(body: ImageGenerateParams, model: string = "dall-e-3") {
    return await openai.images.generate(body)
}


export async function generateImagePromptFromThread({
                                                        messages,
                                                    }: ConversationsRepliesResponse) {


}


export async function generatePromptFromThread({
                                                   messages,
                                               }: ConversationsRepliesResponse) {
    if (!messages) throw new Error('No messages found in thread')
    const botID = messages[0].reply_users?.[0]

    const result = messages
        .map((message: any) => {
            const isBot = !!message.bot_id && !message.client_msg_id
            const isNotMentioned = !isBot && !message.text.startsWith(`<@`)

            if (isNotMentioned) return null

            return {
                role: isBot ? 'assistant' : 'user',
                content: isBot
                    ? message.text
                    : message.text.replace(`<@${botID}> `, ''),
            }
        })
        .filter(Boolean)

    return result as ChatCompletionMessageParam[]


}

