import { ChatPostMessageArguments,
    type ConversationsRepliesResponse, WebClient} from '@slack/web-api'
import {getMessagesFromSlackMessages, getResponseFromModel, PromptModels} from "./_ai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {BaseLanguageModelInput} from "@langchain/core/dist/language_models/base";


const slack = new WebClient(process.env.SLACK_BOT_TOKEN)



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

        const model = getPromptModelsFromSlackEmoji(
            thread.messages[0].text?.replace(/^<@.*?>/, ''))

        const prompts: Promise<BaseLanguageModelInput[]> = getMessagesFromSlackMessages(thread.messages)

        console.log(`using model ${model}`)

        const aiResponse = getResponseFromModel(prompts, model)

        if (!aiResponse) throw new Error('No response')
        await slack.chat.postMessage({
            channel,
            thread_ts: ts,
            text: `${(await aiResponse).content}`
        })

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



function getPromptModelsFromSlackEmoji(messageText: string | undefined) {
    let regex = /:(\w+):/;

    let matches = messageText?.match(regex);
    if (matches && matches[1]) {
        let emoji = matches[1];
        console.log(`found emoji ${emoji}`);
        switch (emoji) {
            case 'avocado':
                return PromptModels.Code;
            case 'camera':
                return PromptModels.Image;
            default:
                return PromptModels.Chat;
        }
    }

    return PromptModels.Chat;
}

