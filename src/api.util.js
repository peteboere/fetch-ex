export {default as httpMethods} from './http-methods.js';
export * from './http-methods.js';
export * from './http-codes.js';
export * as httpCodes from './http-codes.js';
export * as mimeTypes from './mime-types.js';

export function isHeaders(it) {
    return it instanceof Headers;
}

export function isRequest(it) {
    return it instanceof Request;
}

export function isResponse(it) {
    return it instanceof Response;
}

export function toHeaders(it) {
    return isHeaders(it)
        ? it
        : new Headers(it);
}
