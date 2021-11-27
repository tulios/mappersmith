declare module 'mappersmith/middleware/timeout' {
  import { Middleware } from 'mappersmith'

  export type Milliseconds = number

  export default function Timeout(duration: Milliseconds): Middleware
}
