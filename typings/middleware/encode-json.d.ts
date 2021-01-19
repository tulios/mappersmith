declare module 'mappersmith/middleware/encode-json' {
  import {Middleware} from 'mappersmith'

  const EncodeJson: Middleware

  export var CONTENT_TYPE_JSON: string
  export default EncodeJson
}
