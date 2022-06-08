import Fetch from 'src/gateway/fetch'

describe('Gateway / Fetch', () => {
  global.self = {}
  global.process = undefined

  it('sets the gateway correctly', async () => {
    const { configs } = await import('src/index')
    expect(configs.gateway).toBe(Fetch)
  })
})
