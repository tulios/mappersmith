import { errorMessage } from 'spec/integration/support'

const csrfSpec = (Client) => {
  it('adds a header with the value of an existing cookie in document.cookie', (done) => {
    Client.Csrf.get()
      .then((response) => {
        expect(response.status()).toEqual(200)
        Client.Csrf.test()
          .then((response2) => {
            expect(response2.status()).toEqual(200)
            done()
          })
          .catch((response2) => {
            done.fail(`test failed with promise error: ${errorMessage(response2)}`)
          })
      })
      .catch((response) => {
        done.fail(`test failed with promise error: ${errorMessage(response)}`)
      })
  })
}

export default csrfSpec
