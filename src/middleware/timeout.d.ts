import { Middleware } from './index'

export type Milliseconds = number

export default function Timeout(duration: Milliseconds): Middleware
