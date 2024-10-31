export function isHeaders(it: any): it is Headers;
export function isRequest(it: any): it is Request;
export function isResponse(it: any): it is Response;
export function toHeaders(it: any): Headers;
export { default as httpMethods } from "./http-methods.js";
export * from "./http-methods.js";
export * from "./http-codes.js";
export * as httpCodes from "./http-codes.js";
export * as mimeTypes from "./mime-types.js";
