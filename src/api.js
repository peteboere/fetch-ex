import {defaults, isEmpty, isFunction, isNil, sum} from 'lodash-es';
import {fetch, Request} from './api.native.js';
import {toHeaders} from './api.util.js';
import * as httpMethods from './http-methods.js';
import * as mimeTypes from './mime-types.js';
import {assign, countOf, defineProperties, ms, sleep} from './util.js';

/**
 * Extension of native fetch API (node-fetch)
 *
 * @param {import('./_.ts').Resource} url
 * @param {import('./_.ts').Options} [options]
 * @returns {Promise<import('./_.ts').Response>}
 */
export async function fetchEx(url, options) {

    const extension = options?.extension;

    if (extension) {
        delete options.extension;
    }

    const request = new FetchEx([url, options], extension);

    return request.fetch();
}

class FetchEx {

    extension;
    fetchArgs;

    constructor(fetchArgs, extension={}) {

        const defaultExtension = {
            retry: {
                delay: '100 ms',
                limit: 1,
                methods: [
                    httpMethods.DELETE,
                    httpMethods.GET,
                    httpMethods.HEAD,
                    httpMethods.PATCH,
                    httpMethods.PUT,
                ],
                statusCodes: [
                    // Source: https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md
                    408, // Request Timeout
                    413, // Request Too Large
                    429, // Too Many Requests
                    500,
                    502,
                    503,
                    504,
                    521,
                    522,
                    524,
                ],
                errorCodes: [
                    // Source: https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md
                    'EADDRINUSE', // Could not bind to any free port.
                    'EAI_AGAIN', // DNS lookup timed out.
                    'ECONNREFUSED', // The connection was refused by the server.
                    'ECONNRESET', // The connection was forcibly closed.
                    'ENETUNREACH', // No internet connection.
                    'ENOTFOUND', // Could not resolve the hostname to an IP address.
                    'EPIPE', // The remote side of the stream being written has been closed.
                    'ETIMEDOUT', // A connect or send request timeout.
                ],
            },
        };

        defaults(extension, defaultExtension);

        for (const [k, v] of Object.entries(extension)) {
            defaults(v, defaultExtension[k]);
        }

        fetchArgs[1] ||= {};

        if (extension.timeout) {
            extension.timeout = ms(extension.timeout);
            if (fetchArgs[1].signal) {
                throw new TypeError('extension.timeout cannot be used with options.signal');
            }
        }

        assign(this, {
            extension,
            fetchArgs,
        });
    }

    async fetch() {

        const {extension} = this;
        const retryConfig = extension.retry;
        const runLimit = (retryConfig?.limit || 0) + 1;
        const runs = [];

        /** @type {{isRetryable?; timeout?, error?}} */
        let run;

        do {
            if (run?.isRetryable) {
                await sleep(this.#resolveRetryDelay(runs));
            }

            const startTime = Date.now();

            run = {};

            try {
                if (extension.timeout) {
                    const controller = new AbortController();
                    this.fetchArgs[1].signal = controller.signal;
                    run.timeout = setTimeout(() => {
                        controller.abort(`Timeout <${extension.timeout} ms>`);
                    }, extension.timeout);
                }

                const [fetchURL] = this.fetchArgs;
                const fetchOpts = {
                    ...this.fetchArgs[1],
                    ...(extension.agent && {
                        agent: extension.agent,
                    }),
                };

                if (! isNil(extension.json)) {
                    fetchOpts.body ??= JSON.stringify(extension.json);
                    fetchOpts.headers = toHeaders(fetchOpts.headers);

                    for (const name of ['content-type', 'accept']) {
                        if (! fetchOpts.headers.has(name)) {
                            fetchOpts.headers.set(name, mimeTypes.json);
                        }
                    }
                }

                this.request = new Request(fetchURL, fetchOpts);
                this.response = await fetch(this.request);

                await this.#evaluate(run);
            }
            catch (error) {
                await this.#evaluate(run, error);
            }
            finally {
                if (run.timeout) {
                    clearTimeout(run.timeout);
                    delete run.timeout;
                }
            }

            runs.push(defineProperties(run, {
                ...(extension.debug && {
                    request: {
                        enumerable: true,
                        value: this.request,
                    },
                }),
                time: {
                    enumerable: true,
                    value: Date.now() - startTime,
                },
                failed: {
                    get() {
                        return Boolean(this.error || this.isRetryable);
                    },
                },
            }));
        }
        while (run.isRetryable && runs.length < runLimit);

        const stats = this.#stats(runs);

        extension.onComplete?.(stats);

        for (const status of ['fail', 'ok', 'warn']) {
            if (stats[status] && isFunction(extension.log?.[status])) {
                extension.log[status](stats[status]);
            }
        }

        if (run.error) {
            throw run.error;
        }

        return this.#augmentResponse(runs);
    }

    #augmentResponse(runs) {

        return defineProperties(this.response, {
            extension: {
                value: {
                    stats: this.#stats(runs),
                    /*
                     * Infer body parser based on content-type.
                     */
                    body: async () => {

                        const type = this.response.headers
                            .get('content-type') || '';

                        return type.includes(mimeTypes.json)
                            ? this.response.json()
                            : this.response.text();
                    },
                },
            },
        });
    }

    #stats(runs) {

        const stats = {
            runs,
        };

        const timings = runs
            .map(it => it.time);

        stats.totalFetchTime = sum(timings);
        stats.maxFetchTime = Math.max(...timings);
        stats.lastRun = runs.at(-1);

        const prefix = `Fetch of '${this.request.url}' `;

        if (stats.lastRun.failed) {
            const {error} = stats.lastRun;
            stats.fail = prefix + (error
                ? `failed with ${FetchEx.#errorSummary(error)}`
                : `failed with status ${stats.lastRun.status}`)
                + ` after ${countOf(runs, 'attempt')}`;
        }
        else if (stats.runs.length > 1) {
            const failedAttempts = stats.runs
                .filter(it => it.failed)
                .map(it => it.error
                    ? FetchEx.#errorSummary(it.error)
                    : `${it.status}`)
                .join(', ');
            stats.warn = `${prefix}required ${countOf(stats.runs, 'attempt')} (${failedAttempts})`;
        }
        else {
            stats.ok = `${prefix}was OK`;
        }

        return stats;
    }

    async #evaluate(run, error) {

        if (error) {
            if (error instanceof TypeError) {
                /*
                 * May be thrown by misconfigured Request.
                 * E.g. options with `body` and GET method.
                 */
                throw error;
            }
            run.error = error;
        }
        else {
            run.status = this.response.status;
        }

        const {extension} = this;
        const retryConfig = extension.retry;

        if (isEmpty(retryConfig)) {
            return;
        }

        if (error) {
            if (FetchEx.#isAbortError(error)) {
                if (extension.timeout) {
                    run.isRetryable = true;
                }
                else {
                    /*
                     * Throw from user-specified AbortController
                     * overrides extension retry behaviour.
                     */
                }
                error.reason = this.fetchArgs[1].signal.reason;
            }
            else {
                run.isRetryable = retryConfig
                    .errorCodes
                    .includes(FetchEx.#errorCode(error));
            }
        }
        else {
            const retryableMethod = (retryConfig.methods === false)
                || retryConfig.methods
                    .includes(this.request.method);

            run.isRetryable = retryableMethod
                && retryConfig.statusCodes
                    .includes(this.response.status);
        }
    }

    #resolveRetryDelay(runs) {

        const minDelay = 100;
        const normaliseDelay = delay => Math.max(delay, minDelay);

        const delayParam = this.extension.retry.delay;

        if (! isFunction(delayParam)) {
            return normaliseDelay(ms(delayParam));
        }

        /**
         * Date for retry, or seconds string.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
         */
        const retryAfterHeader = this.response
            .headers
            .get('retry-after');

        let retryAfterMS;

        if (retryAfterHeader) {

            const parsedHeaderDate = Date
                .parse(retryAfterHeader);

            retryAfterMS = Number.isInteger(parsedHeaderDate)
                ? parsedHeaderDate - Date.now()
                : (parseInt(retryAfterHeader, 10) || 0) / 1000;
        }

        const delay = delayParam({
            retryAttempt: runs.length,
            retryAfterMS,
        }, this.response);

        return normaliseDelay(delay);
    }

    static #errorCode(error) {
        return (error.cause || error).code;
    }

    static #errorSummary(error) {

        const subject = error.cause || error;
        const {name, reason} = subject;

        return FetchEx.#isAbortError(subject)
            ? `${name} (${reason})`
            : `${name} (${FetchEx.#errorCode(subject)})`;
    }

    static #isAbortError(error) {
        return (error instanceof Error) && error.name === 'AbortError';
    }
}
