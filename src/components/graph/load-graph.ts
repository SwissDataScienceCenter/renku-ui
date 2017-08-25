const fetchStream = require('fetch-readablestream')
const ReadableStream = require('web-streams-polyfill').ReadableStream
const TextDecoder = require('text-encoding').TextDecoder


import { PersistedVertex, PersistedEdge } from './elements'

export function loadVertices(url: string, onVertex: (v: PersistedVertex) => void, onComplete: () => void): void {
    const headers = new Headers()

    const opts: RequestInit = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    }

    function decodeChunks(readableStream: ReadableStream, onChunk: (chunk: string) => void, onComplete: () => void) {
        const reader = readableStream.getReader()
        const decoder = new TextDecoder()

        function readChunk() {
            return reader.read().then(({ value, done }) => {
                if (done) {
                    process.nextTick(onComplete)
                    return
                }

                process.nextTick(() => onChunk(decoder.decode(value)))
                return readChunk()
            })
        }

        return readChunk()
    }

    let buffer = ''

    function readChunk(chunk: string, onMessage: (msg: string) => void) {
        buffer += chunk
        const messages = buffer.split('\r')
        console.log('messages')
        console.log(messages)

        buffer = messages.pop()

        process.nextTick(() => {
            messages.forEach(onMessage)
        })
    }

    function flushChunk(onMessage: (msg: string) => void, onComplete: () => void) {
        const messages = buffer.split('\r')
        console.log('remaining messages')
        console.log(messages)

        messages.pop()

        process.nextTick(() => {
            messages.forEach(onMessage)
            onComplete()
        })
    }

    function parseMessage(msg: string): PersistedVertex {
        return JSON.parse(msg)
    }

    fetchStream(url, opts).then(function (response: any) {
        decodeChunks(
            response.body,
            chunk => readChunk(chunk, msg => onVertex(parseMessage(msg))),
            () => flushChunk(msg => onVertex(parseMessage(msg)), onComplete)
        )
    })

}

// TODO: factor code
export function loadEdges(url: string, onVertex: (v: PersistedEdge) => void, onComplete: () => void): void {
    const headers = new Headers()

    const opts: RequestInit = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    }

    function decodeChunks(readableStream: ReadableStream, onChunk: (chunk: string) => void, onComplete: () => void) {
        const reader = readableStream.getReader()
        const decoder = new TextDecoder()

        function readChunk() {
            return reader.read().then(({ value, done }) => {
                if (done) {
                    process.nextTick(onComplete)
                    return
                }

                process.nextTick(() => onChunk(decoder.decode(value)))
                return readChunk()
            })
        }

        return readChunk()
    }

    let buffer = ''

    function readChunk(chunk: string, onMessage: (msg: string) => void) {
        buffer += chunk
        const messages = buffer.split('\r')
        console.log('messages')
        console.log(messages)

        buffer = messages.pop()

        process.nextTick(() => {
            messages.forEach(onMessage)
        })
    }

    function flushChunk(onMessage: (msg: string) => void, onComplete: () => void) {
        const messages = buffer.split('\r')
        console.log('remaining messages')
        console.log(messages)

        messages.pop()

        process.nextTick(() => {
            messages.forEach(onMessage)
            onComplete()
        })
    }

    function parseMessage(msg: string): PersistedEdge {
        return JSON.parse(msg)
    }

    fetchStream(url, opts).then(function (response: any) {
        decodeChunks(
            response.body,
            chunk => readChunk(chunk, msg => onVertex(parseMessage(msg))),
            () => flushChunk(msg => onVertex(parseMessage(msg)), onComplete)
        )
    })

}
