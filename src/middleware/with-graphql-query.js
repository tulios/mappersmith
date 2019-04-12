/**
 * Inject the given graphql query into your request body.
 *
 * Your request can optionally specify the query variables you want:
 * > client.Graphql.getResources({ variables: { id: 100 } })
 *
 */
const WithGraphqlQuery = query => () => ({
  prepareRequest (next) {
    return next().then(request => {
      if (request.requestParams) {
        const variables = { ...request.requestParams }

        const newRequest = request.enhance({
          body: { ...variables, query }
        })

        Object.keys(variables).forEach(
          key => delete newRequest.requestParams[key]
        )

        return newRequest
      }

      return request
    })
  }
})

export default WithGraphqlQuery
