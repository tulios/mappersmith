/* eslint-disable no-eval */

// This is a workaround to import CommonJS modules in ESM modules, unfortunately typings are lost in the process.
// It is required for ESM build to work, currently done via TSUP.
export const ttyTable = eval('require')('tty-table')
