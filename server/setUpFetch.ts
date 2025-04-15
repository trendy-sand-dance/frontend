import { fetch, Request, Response, Headers } from 'undici';

// Patch global fetch with undici for Node.js streaming support
// @ts-ignore - Override global fetch types safely
globalThis.fetch = fetch as any;
globalThis.Request = Request as any;
globalThis.Response = Response as any;
globalThis.Headers = Headers as any;