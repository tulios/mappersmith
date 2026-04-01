import { sortedUrl, toSortedQueryString } from '../mocks/mock-utils'
import { Request } from '../request'
import { createRequire } from 'module'
const colors = {
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  bgGreen: (s: string) => `\x1b[42m${s}\x1b[49m`,
  bgRed: (s: string) => `\x1b[41m${s}\x1b[49m`,
}
import MockResource from '../mocks/mock-resource'
import MockRequest from '../mocks/mock-request'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ttyTable: ((...args: any[]) => { render(): string }) | null = null
let Diff: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diffChars: (...args: any[]) => Array<{ value: string; added?: boolean; removed?: boolean }>
} | null = null

// Resolve optional peer deps from the consuming project's working directory:
const requireFromCwd = createRequire(process.cwd() + '/package.json')

try {
  ttyTable = requireFromCwd('tty-table')
} catch {
  // optional peer dependency — plain text fallback used when not installed
}

try {
  Diff = requireFromCwd('diff')
} catch {
  // optional peer dependency — plain text fallback used when not installed
}

/**
 *
 * @param {string} stringOne
 * @param {string} stringTwo
 * @returns {string[]}
 */
export const diffString = (stringOne: string, stringTwo: string) => {
  if (!Diff) {
    return `${colors.red(stringOne)} → ${colors.green(stringTwo)}`
  }
  const diff = Diff.diffChars(stringOne, stringTwo)
  return diff
    .map(function (part) {
      return part.added
        ? colors.bgGreen(part.value)
        : part.removed
          ? colors.bgRed(part.value)
          : colors.green(part.value)
    })
    .join('')
}

type MockMatchResult = ReturnType<MockRequest['getRequestMatching']>
type ColumnValue =
  | MockMatchResult['body']
  | MockMatchResult['headers']
  | MockMatchResult['method']
  | MockMatchResult['url']

const getMatchScore = (match: MockMatchResult): number => {
  return (
    (match.isExactMatch ? 10 : match.isPartialMatch ? 5 : 0) +
    (match.url.match ? 4 : 0) +
    (match.method.match ? 3 : 0) +
    (match.body.match ? 2 : 0) +
    (match.headers.match ? 1 : 0)
  )
}
/**
 * Sorts the matches based on how well they match.
 * The most matching match will be the last one in the array.
 * @param {MockMatchResult[]} matches - Array of mock match results.
 * @return {MockMatchResult[]} The sorted array of mock match results.
 */
const sortMatches = (matches: MockMatchResult[]): MockMatchResult[] => {
  return matches.sort((a, b) => getMatchScore(a) - getMatchScore(b))
}

/**
 * Creates a tty-table for the given mock matches.
 * @param {MockMatchResult[]} matches - Array of mock match results.
 * @return {string} The rendered table as a string.
 */
const createTableForMocks = (matches: MockMatchResult[]) => {
  if (!ttyTable) {
    return sortMatches(matches)
      .map((match) => {
        const indicator = match.isExactMatch
          ? colors.green('✓')
          : match.isPartialMatch
            ? colors.yellow('~')
            : colors.red('✗')
        const row = (label: string, { match: m, mockValue, requestValue }: ColumnValue) => {
          const value = mockValue !== requestValue ? diffString(requestValue, mockValue) : mockValue
          return `  ${bold(label.padEnd(8))} ${m ? colors.green('Yes') : colors.red('No ')}  ${m ? colors.green(value) : colors.red(value)}`
        }
        return [
          `${indicator} ${bold(match.mockName)}`,
          row('Url', match.url),
          row('Method', match.method),
          row('Body', match.body),
          row('Headers', match.headers),
        ].join('\n')
      })
      .join('\n\n')
  }

  const tables = sortMatches(matches).map((match) => {
    const header = [
      {
        value: bold(`${match.mockName}`),
        width: 20,
        color: 'white',
        headerColor: 'white',
        align: 'left',
      },
      { value: bold('Match'), width: 15, color: 'white', headerColor: 'white', align: 'left' },
      { value: bold('Value/Diff'), width: 80, color: 'white', headerColor: 'white', align: 'left' },
    ]

    const getColumnValuesFromMatch = ({ match, mockValue, requestValue }: ColumnValue) => {
      const value = mockValue !== requestValue ? diffString(requestValue, mockValue) : mockValue
      return [
        match ? colors.green('Yes') : colors.red('No'),
        match ? colors.green(value) : colors.red(value),
      ]
    }

    const rows = [
      [bold('Url'), ...getColumnValuesFromMatch(match.url)],
      [bold('Method'), ...getColumnValuesFromMatch(match.method)],
      [bold('Body'), ...getColumnValuesFromMatch(match.body)],
      [bold('Headers'), ...getColumnValuesFromMatch(match.headers)],
    ]

    const table = ttyTable(header, rows, {
      borderStyle: 'solid',
      borderColor: match.isExactMatch ? 'green' : match.isPartialMatch ? 'yellow' : 'red',
      color: 'white',
    })

    return table.render()
  })

  return tables.join('\n')
}

/**
 * Makes the given text bold.
 * @param {string} text - The text to be made bold.
 * @return {string} The bolded text.
 */
const bold = (text: string) => `\x1b[1m${text}\x1b[22m`

/**
 * Creates a tty-table for the given request.
 * @param {Request} request - The request object.
 * @return {string} The rendered table as a string.
 */
const createTableForRequest = (request: Request) => {
  if (!ttyTable) {
    return [
      `  ${bold('Url'.padEnd(8))} ${decodeURIComponent(sortedUrl(request.url()))}`,
      `  ${'Method'.padEnd(8)} ${request.method()}`,
      `  ${'Body'.padEnd(8)} ${decodeURIComponent(toSortedQueryString(request.body()))}`,
      `  ${'Headers'.padEnd(8)} ${decodeURIComponent(toSortedQueryString(request.headers()))}`,
    ].join('\n')
  }

  const header = [
    { value: 'Outbound Request', width: 20, color: 'white', align: 'left' },
    { value: 'Value', width: 70, color: 'white', align: 'left' },
  ]

  const rows = [
    [bold('Url'), decodeURIComponent(sortedUrl(request.url()))],
    ['Method', request.method()],
    ['Body', decodeURIComponent(toSortedQueryString(request.body()))],
    ['Headers', decodeURIComponent(toSortedQueryString(request.headers()))],
  ]

  const table = ttyTable(header, rows, {
    borderStyle: 'solid',
    borderColor: 'blue',
    color: 'white',
  })

  return table.render()
}

/**
 * Creates a horizontal table with one row and two columns using tty-table.
 * @return {string} The rendered table as a string.
 */
const createColorExplanationTable = () => {
  const text1 = `${colors.green('●')} Exact match\n${colors.yellow('●')} Partial match (When URL and METHOD match)\n${colors.red('●')} Not matching`
  const text2 = `${colors.green('Mock value matches the request value')}\n${colors.bgGreen('Present in mock but not in request')}\n${colors.bgRed('Present in request but not in mock')}`

  if (!ttyTable) {
    return `${text1}\n\n${text2}`
  }

  const header = [
    { value: 'Colors Explanation', width: 50, headerColor: 'white', align: 'left' },
    { value: 'Diff Explanation', width: 50, headerColor: 'white', align: 'left' },
  ]

  const rows = [[text1, text2]]

  const table = ttyTable(header, rows, {
    borderStyle: 'solid',
    borderColor: 'blue',
    color: 'white',
  })

  return table.render()
}

/**
 * Generates a debug print message for the given request and mock matches.
 * @param {Request} request - The request object.
 * @param {MockMatchResult[]} matches - Array of mock match results.
 * @return {string} The debug print message.
 */
export const getDebugPrintMessage = (request: Request, matches: MockMatchResult[]) => {
  const requestTable = createTableForRequest(request)
  const message = `
------------------------------------------------------------------------------------------------------------------
Mappersmith matches a mock to an outgoing request by comparing the request's URL, METHOD, BODY and HEADERS.

URL:     The URL is sorted and normalized before comparison.
BODY:    The BODY is sorted and normalized in the form of a query-string before comparison.
HEADERS: The headers of the outgoing request is stripped of any headers that are not present in the
         mock definition headers and then sorted and normalized before comparison.
METHOD:  The method of the outgoing request is compared as is.
------------------------------------------------------------------------------------------------------------------

Request:
${requestTable}

Mock definitions installed:

${createColorExplanationTable()}

${matches.length ? createTableForMocks(matches) : 'NO MOCKS INSTALLED'}
${!ttyTable || !Diff ? '\nNOTE: Install optional peer dependencies for richer output: "diff" (character-level diffs) and "tty-table" (formatted tables). See https://github.com/tulios/mappersmith#enhanced-debugging' : ''}
`
  return message
}

/**
 * Generates a message indicating no mocks are installed.
 * @param {Request} request - The request object.
 * @return {string} The no mocks installed message.
 */
const noMocksInstalledMessage = (request: Request) => {
  const debugInfo = getDebugPrintMessage(request, [])
  return `

${debugInfo}

${colors.red('[Mappersmith Test] There are no mocks installed, please refer to the documentation: https://github.com/tulios/mappersmith?tab=readme-ov-file#-testing-mappersmith')}
`
}

/**
 * Generates a message indicating no match was found for the given request and mock matches.
 * @param {Request} request - The request object.
 * @param {MockMatchResult[]} matches - Array of mock match results.
 * @return {string} The no match found message.
 */
export const noMatchFoundMessage = (request: Request, matches: MockMatchResult[]) => {
  const debugInfo = getDebugPrintMessage(request, matches)
  return `

${debugInfo}

${colors.red('[Mappersmith Test] No match found, check your mock definitions, debug information available above.')}
`
}

/**
 * Generates a message indicating a partial match was found for the given request and mock matches.
 * @param {Request} request - The request object.
 * @param {MockMatchResult[]} matches - Array of mock match results.
 * @return {string} The partial match message.
 */
export const partialMatchMessage = (request: Request, matches: MockMatchResult[]) => {
  const debugInfo = getDebugPrintMessage(request, matches)
  return `

${debugInfo}

${colors.yellow(`[Mappersmith Test] No exact match found but a partial match was found, check your mock definitions, debug information available above.`)}
`
}

/**
 * Looks up a response for the given request in the mock store.
 * @param {MockResource[]} store - Array of mock resources.
 * @param {Request} request - The request object.
 * @return {Response} The matched response.
 * @throws Will throw an error if it doesn't find a mock to match the given request.
 */
export const lookupResponse = (store: MockResource[]) => (request: Request) => {
  if (!store.length) {
    throw new Error(noMocksInstalledMessage(request))
  }

  const mocks = store.map((mockResource) => {
    const mockRequest = mockResource.toMockRequest()
    const requestMatching = mockRequest.getRequestMatching(request)
    return {
      requestMatching,
      mockRequest,
      mockResource,
    }
  })

  const exactMatch = mocks.filter(({ requestMatching }) => requestMatching.isExactMatch).pop()
  if (exactMatch) {
    return exactMatch.mockRequest.call(request)
  }

  const partialMatch = mocks.filter(({ requestMatching }) => requestMatching.isPartialMatch).pop()

  if (partialMatch) {
    throw new Error(
      partialMatchMessage(
        request,
        mocks.map(({ requestMatching }) => requestMatching)
      )
    )
  }

  throw new Error(
    noMatchFoundMessage(
      request,
      mocks.map(({ requestMatching }) => requestMatching)
    )
  )
}
