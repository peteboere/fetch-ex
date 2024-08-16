/** @import {FetchExtResponse, FetchExtRequestInit, Resource, Response} from './api.types.ts' */
/**
 * Extension of native fetch API (node-fetch)
 *
 * @param {Resource} url
 * @param {FetchExtRequestInit} [options]
 */
export function fetchEx(url: Resource, options?: FetchExtRequestInit): Promise<FetchExtResponse>;
import type { Resource } from './api.types.ts';
import type { FetchExtRequestInit } from './api.types.ts';
import type { FetchExtResponse } from './api.types.ts';
