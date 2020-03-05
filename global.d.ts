/* eslint-disable no-undef, no-redeclare, no-underscore-dangle */

import _log from './app/log'

declare global {
  const log: typeof _log

  const __DEV__: boolean
  const __TEST__: boolean
}
