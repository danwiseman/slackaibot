import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import type { ConversationsRepliesResponse } from '@slack/web-api'
import type { ImageGenerateParams } from "openai/resources";
import exp from "node:constants";
import {generatePromptsFromMessage} from "./_chat";

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


export async function generatePromptFromThread(messages: ConversationsRepliesResponse) {

    if (!messages) throw new Error('No messages found in thread')
    const results = await generatePromptsFromMessage(messages)

    return results as ChatCompletionMessageParam[]


}

