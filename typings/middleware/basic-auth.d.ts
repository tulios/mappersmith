declare module 'mappersmith/middleware/basic-auth' {
  import { Middleware, Authorization } from 'mappersmith'

  export default function BasicAuthMiddleware(authConfig: Authorization): Middleware
}
