import {ChatPostMessageArguments, type ConversationsRepliesResponse, WebClient} from '@slack/web-api'
import {generatePromptFromThread, getTextGPTResponse} from './_openai'
import {generateMistralPromptFromThread, getMistralTextGPTResponse} from "./_mistral";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export enum PromptModels {
    Chat = "mistral-large-latest",
    Code = "codestral-latest",
    Image = "dall-e-4"
}

type Event = {
    channel: string
    ts: string
    thread_ts?: string
}

async function postImageMessage() {

}

export async function sendGPTResponse(event: Event) {
    const {channel, ts, thread_ts} = event

    try {
        const thread = await slack.conversations.replies({
            channel,
            ts: thread_ts ?? ts,
            inclusive: true,
        })

        if (!thread.messages) throw new Error('No messages found in thread')

        const botID = thread.messages[0].reply_users?.[0]

        const model = getPromptModelsFromSlackEmoji(
            thread.messages[0].text?.replace(`<@${botID}> `, ''))

        switch (model) {
            case PromptModels.Image:
                //await postImageMessage()
                await postTextMessage({
                    channel,
                    thread_ts: ts,
                    text: 'Image generation not yet implemented',
                })
                break
            case PromptModels.Code:
            case PromptModels.Chat:
                const prompts = await generateMistralPromptFromThread(thread)
                const gptResponse = await getMistralTextGPTResponse(prompts, model)
                await postTextMessage({
                    channel,
                    thread_ts: ts,
                    text: `${gptResponse.choices[0].message.content}`,
                })
                break
            default:
                throw new Error('no model available')

        }


    } catch (error) {
        if (error instanceof Error) {
            await slack.chat.postMessage({
                channel,
                thread_ts: ts,
                text: `<@${process.env.SLACK_ADMIN_MEMBER_ID}> Error: ${error.message}`,
            })
        }
    }
}

export async function postTextMessage(options: ChatPostMessageArguments) {

    await slack.chat.postMessage(options)
}

export function getPromptModelsFromSlackEmoji(messageText: string | undefined) {

    let regex = new RegExp('^:.*?:');

    let matches = messageText?.match(regex);
    if (matches && matches[0]) {
        let emoji = matches[0];

        switch (emoji) {
            case ':avocado:':
                return PromptModels.Code
            case ':camera:':
                return PromptModels.Image
            default:
                return PromptModels.Chat
        }
    }

    return PromptModels.Chat

}

export async function generatePromptsFromMessage({
                                                     messages,
                                                 }: ConversationsRepliesResponse) {

    if (!messages) throw new Error('No messages found in thread')
    const botID = messages[0].reply_users?.[0]

    return messages
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
        .filter(Boolean);

}