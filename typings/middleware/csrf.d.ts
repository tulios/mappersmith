declare module 'mappersmith/middleware/csrf' {
  import { Middleware } from 'mappersmith'

  export default function CSRF(...headers: string[]): Middleware
}
