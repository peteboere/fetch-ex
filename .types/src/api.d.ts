/** @import {FetchExtRequestInit, FetchExtResponse, Resource} from './api.types.ts' */
/**
 * Extends native {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch fetch API}.
 * @param {Resource} url
 * @param {FetchExtRequestInit} [options]
 */
export function fetchExt(url: Resource, options?: FetchExtRequestInit): Promise<FetchExtResponse>;
export class FetchExtError extends Error {
}
export class FetchError extends FetchExtError {
}
export class FetchOptionError extends FetchExtError {
}
import type { Resource } from './api.types.ts';
import type { FetchExtRequestInit } from './api.types.ts';
import type { FetchExtResponse } from './api.types.ts';
