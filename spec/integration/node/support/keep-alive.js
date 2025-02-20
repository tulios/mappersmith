/* eslint-disable @typescript-eslint/no-var-requires */
const { createManifest } = require('../../support/manifest.js')
const { default: forge } = require('../../../../src/index.ts')

export function keepAlive(host, gateway) {
  return {
    verifySockets: (count, socketsReference) => {
      const socketOrigins = Object.keys(socketsReference)
      expect(socketOrigins.length).toBe(count)
      if (count === 0) return

      const sockets = socketsReference[socketOrigins[0]]
      expect(sockets.length).toBe(count)
      const socket = sockets[0]
      expect(socket.listenerCount('lookup')).toBe(count)
      expect(socket.listenerCount('connect')).toBe(count)
    },
    callApiTwice: () => {
      const Client = forge(createManifest(host), gateway)
      return Client.Book.all().then(() => Client.Book.all())
    },
  }
}
