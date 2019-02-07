#!/usr/local/bin/node

/*
    Copyright 2019 Ellis and Associates Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

const request = require('request')
const {
    argv
} = require('yargs')

require('dotenv').config()
const env = process.env
const log = console.log.bind(console)

async function makeSecureClient() {
    // get the OAuth access token 
    async function getAccessToken() {

        return new Promise((resolve, reject) => {
            const auth_body = {
                client_id: env.CLIENT_ID,
                client_secret: env.CLIENT_SECRET,
                audience: 'https://sandbox.ladot.io',
                grant_type: 'client_credentials'
            }

            const auth_request = {
                method: 'POST',
                url: 'https://auth.ladot.io/oauth/token',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(auth_body)
            }

            request(auth_request, (error, response, body) => {
                if (error) {
                    reject(err)
                } else {
                    body = JSON.parse(body)
                    const {
                        access_token
                    } = body
                    resolve(access_token)
                }
            })
        })
    }

    const access_token = await getAccessToken()

    async function sendGet(url) {
        log('GET', url)
        return new Promise((resolve, reject) => {
            const get_request = {
                method: 'GET',
                url: url,
                headers: {
                    authorization: `Bearer ${access_token}`
                }
            }

            request(get_request, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(body))
                }
            })
        })
    }

    async function sendPost(url, body) {
        log('POST', url, body)
        return new Promise((resolve, reject) => {
            const post_request = {
                method: 'POST',
                url: url,
                headers: {
                    authorization: `Bearer ${access_token}`,
                    'content-type': 'application/json'
                },
                body: body
            }

            request(post_request, (err, response, body) => {
                if (err) {
                    reject(err)
                } else if (response.statusCode >= 300) {
                    reject(body)
                } else {
                    resolve(JSON.parse(body))
                }
            })
        })
    }

    const baseUrl = 'https://sandbox.ladot.io/agency/dev'

    async function sendVehicle(vehicle) {
        const body = JSON.stringify(vehicle)
        // log('sending body:', body.length, body.slice(0, 100), '...')
        return sendPost(`${baseUrl}/vehicles`, body)
    }

    async function sendEvent(event) {
        const body = JSON.stringify(event)
        // log('sending body:', body.length, body.slice(0, 100), '...')
        return sendPost(`${baseUrl}/vehicles/${event.device_id}/event`, body)
    }

    async function sendTelemetry(telemetry) {
        const body = JSON.stringify({
            data: [telemetry]
        })
        // log('sending body:', body.length, body.slice(0, 100), '...')
        return sendPost(`${baseUrl}/vehicles/telemetry`, body)
    }

    async function sendWipe(wipe) {
        // log('sending body:', body.length, body.slice(0, 100), '...')
        if (!wipe || !wipe.device_id) {
            return 'missing device_id'
        } else {
            return sendGet(`${baseUrl}/admin/wipe/${wipe.device_id}`)
        }
    }

    return Promise.resolve({
        sendVehicle,
        sendEvent,
        sendTelemetry,
        sendWipe
    })
}

if (argv._.length < 2) {
    log('usage: mds-cli [vehicle|event|telemetry] params...')
    process.exit(0)
}
if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    console.log('need CLIENT_ID and CLIENT_SECRET')
    process.exit(0)
}

async function main() {
    const client = await makeSecureClient()
    const json = JSON.parse(argv._[1])
    switch (argv._[0]) {
        case 'v':
        case 'vehicle':
            return client.sendVehicle(json)
        case 'e':
        case 'event':
            return client.sendEvent(json)
        case 't':
        case 'telemetry':
            return client.sendTelemetry(json)
        case 'w':
        case 'wipe':
            return client.sendWipe(json)
        default:
            return Promise.reject('"' + argv._[0] + '" is not vehicle, event, or telemetry')
    }
    // parse args
}

main().then((result) => {
    log(result)
}, (failure) => {
    if (failure.slice && failure.slice(0, 2) === '{"') {
        failure = JSON.parse(failure)
    }
    if (failure.error_description) {
        log(failure.error_description + ' (' + failure.error + ')')
    } else if (failure.result) {
        log(failure.result)
    } else {
        log('failure:', failure)
    }
}).catch((err) => {
    log('exception:', err.stack)
})