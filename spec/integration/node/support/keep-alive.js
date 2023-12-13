import createManifest from 'spec/integration/support/manifest'

import forge from 'src/index'

export default function keepAlive(host, gateway) {
  return {
    verifySockets: (socketsReference) => {
      const socketOrigins = Object.keys(socketsReference)
      expect(socketOrigins.length).toBe(1)
      const sockets = socketsReference[socketOrigins[0]]
      expect(sockets.length).toBe(1)
      const socket = sockets[0]
      expect(socket.listenerCount('lookup')).toBe(1)
      expect(socket.listenerCount('connect')).toBe(1)
    },
    callApiTwice: () => {
      const Client = forge(createManifest(host), gateway)
      return Client.Book.all().then(() => Client.Book.all())
    }
  }
}
