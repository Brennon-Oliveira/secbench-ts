declare module 'js-yaml' {
  const yaml: {
    load: (input: string, opts?: { schema?: unknown }) => unknown
    DEFAULT_FULL_SCHEMA: unknown
    DEFAULT_SAFE_SCHEMA: unknown
  }
  export = yaml
}

declare module 'node-serialize' {
  const serialize: {
    serialize: (input: unknown) => string
    unserialize: (input: string) => unknown
  }
  export = serialize
}

declare module 'ms' {
  function ms(value: string): number | undefined
  export = ms
}

declare module 'escape-html' {
  function escapeHtml(input: string): string
  export = escapeHtml
}
