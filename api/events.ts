import crypto from 'crypto'
import { sendGPTResponse } from './_chat'
import {cacheClient} from "./_cache";

export const config = {
    maxDuration: 30,
}

async function isValidSlackRequest(request: Request, body: any) {
    const signingSecret = process.env.SLACK_SIGNING_SECRET!
    const timestamp = request.headers.get('X-Slack-Request-Timestamp')!
    const slackSignature = request.headers.get('X-Slack-Signature')!
    const base = `v0:${timestamp}:${JSON.stringify(body)}`
    const hmac = crypto
        .createHmac('sha256', signingSecret)
        .update(base)
        .digest('hex')
    const computedSignature = `v0=${hmac}`
    return computedSignature === slackSignature
}

export async function POST(request: Request) {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)
    const requestType = body.type

    if (requestType === 'url_verification') {
        return new Response(body.challenge, { status: 200 })
    }

    if (await isValidSlackRequest(request, body)) {
        if (requestType === 'event_callback') {
            const eventID = body.event_id

            await cacheClient.connect()
            const cachedEvent = cacheClient.get(eventID)

            if (await cachedEvent) {
                console.log(`already received event ${eventID}`)
                if (await cachedEvent !== 'error') {
                    // already received, don't process again unless error
                    return new Response('Success!', {status: 200})
                } else {
                    return await checkAndProcessEvent(body)
                }
            } else {
                return await checkAndProcessEvent(body)
            }
        }
    }

    return new Response('OK', { status: 200 })
}

async function checkAndProcessEvent(body: any) {
    const eventType = body.event.type
    const channelType = body.event.channel_type
    const eventID = body.event_id

    await cacheClient.set(eventID, 'processing')
    if ((eventType === 'app_mention') || ((eventType === 'message') && (channelType === 'im'))) {
        await sendGPTResponse(body.event)
        await cacheClient.set(eventID, 'processed')

    } else {
        await cacheClient.set(eventID, 'skipped')
    }
    return new Response('Success!', {status: 200})
}