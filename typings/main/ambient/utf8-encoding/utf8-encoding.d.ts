declare module UTF8Encoding {
  interface TextEncoder {
    encoding: string; // readonly
    encode(input?: string): Uint8Array;
  }
  var TextEncoder: {
    prototype: TextEncoder;
    new (utfLabel?: string): TextEncoder;
  }

  interface TextDecoder {
    encoding:  string;
    fatal:     boolean;
    ignoreBOM: boolean;
    decode(input?: any, options?: Object): string;
  }
  var TextDecoder: {
    prototype: TextDecoder;
    new (label?: string, options?: Object): TextDecoder;
  }
}

declare module 'utf8-encoding' {
  export = UTF8Encoding;
}
