import 'dotenv/config'
import { WebSocketServer } from 'ws'
import { RPCHandler } from '@orpc/server/ws'
import { appRouter } from './orpc/routers/index'
import { onError } from '@orpc/server'
import { auth } from './better-auth/config-ws'

const wss = new WebSocketServer({ port: 8081 })

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

console.log('WebSocket server started on ws://localhost:8081')

wss.on('connection', (ws, req) => {
  ;(async () => {
    const headers = new Headers()
    if (req.headers) {
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v))
        } else if (value) {
          headers.append(key, value)
        }
      }
    }

    const session = await auth.api.getSession({
      headers,
    })

    await rpcHandler.upgrade(ws, {
      context: {
        session,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: { headers } as any,
      },
    })
  })()
})
