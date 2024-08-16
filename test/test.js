import {after, before, describe, it, mock} from 'node:test';
import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {isNil} from 'lodash-es';
import {fetchEx, isHeaders, Response} from '../index.js';
import testServer from './server.js';

chai.use(chaiAsPromised);

describe('fetchExt', () => {

    const context = {};

    before(async () => {
        context.server = await testServer;
        context.testRequestURL = input => `${context.server.origin}/request?${new URLSearchParams(input)}`;
    });

    after(() => context.server.close());

    describe('fetchEx()', () => {

        it('should handle different request inputs as native fetch except for extension behaviour', async () => {

            const samples = [
                [
                    {
                        text: 'Text',
                    }, {
                        text: 'Text',
                        status: 200,
                    },
                ],
                [
                    {
                        json: '{"error":"not found"}',
                        status: 404,
                    }, {
                        json: {error: 'not found'},
                        status: 404,
                    },
                ],
                [
                    {
                        json: '{"error":"internal"}',
                        status: 500,
                    }, {
                        json: {error: 'internal'},
                        status: 500,
                        retrys: {
                            count: 1,
                            fail: true,
                        },
                        failMessage: 'failed with status 500 after 2 attempts',
                    },
                ],
            ];

            for (const [input, expected] of samples) {

                const url = context.testRequestURL(input);

                const response = await
                    fetchEx(url);

                expect(response)
                    .to.be.instanceOf(Response);
                expect(response.status)
                    .to.equal(expected.status);
                expect(response.url)
                    .to.equal(url);

                if (expected.text) {
                    expect(await response.text())
                        .to.equal(expected.text);
                }
                else if (expected.json) {
                    expect(await response.json())
                        .to.eql(expected.json);
                }

                // Extension.
                const {stats} = response.extension;

                expect(stats.runs.length - 1)
                    .to.equal(expected.retrys?.count || 0);

                if (! isNil(expected.retrys?.fail)) {
                    expect(stats.lastRun.failed)
                        .to.equal(expected.retrys.fail);
                }

                if (expected.failMessage) {
                    expect(stats.fail)
                        .to.include(expected.failMessage);
                }
            }
        });

        it('should retry requests with extension.timeout', async () => {

            /** @type {any} */
            let stats;

            const timeout = 100;
            const url = context.testRequestURL({
                delay: timeout * 2,
            });

            const request = () => fetchEx(url, {
                extension: {
                    timeout,
                    retry: {
                        limit: 2,
                        delay: 0,
                    },
                    onComplete(runStats) {
                        stats = runStats;
                    },
                    log: {
                        // eslint-disable-next-line no-console
                        fail: console.error,
                    },
                },
            });

            await expect(request())
                .to.be.rejected;

            expect(stats.runs.length)
                .to.equal(3);
            expect(stats.fail)
                .to.include('failed with AbortError (Timeout <100 ms>) after 3 attempts');
        });

        it('should retry requests using extension.delay resolver and retry-after header', {timeout: 5000}, async function () {

            const defaultDelay = 100;

            const samples = [
                // Relative date test must fire first.
                {
                    retryAfter: new Date(Date.now() + 2000).toISOString(),
                    expectRetryAfter: [1700, 2000],
                },
                {
                    retryAfter: 1,
                    expectRetryAfter: 1000,
                },
                {
                    // Fallback delay.
                    expectRetryAfter: defaultDelay,
                },
            ];

            for (const sample of samples) {

                const url = context.testRequestURL({
                    status: 429,
                    ...(sample.retryAfter && {
                        retryAfter: sample.retryAfter,
                    }),
                });

                const delayResolver = mock.fn(({retryAfterMS}) => retryAfterMS);

                /** @type {any} */
                let stats;

                const request = () => fetchEx(url, {
                    extension: {
                        retry: {
                            limit: 1,
                            delay: delayResolver,
                        },
                        onComplete(runStats) {
                            stats = runStats;
                        },
                        log: {
                            // eslint-disable-next-line no-console
                            fail: console.error,
                        },
                    },
                });

                const response = await request();

                expect(delayResolver.mock.calls)
                    .to.have.lengthOf(1);

                const [{arguments: args}] = delayResolver.mock.calls;

                expect(args[0])
                    .to.have.keys(
                        'retryAttempt',
                        'retryAfterMS',
                    )
                    .and.include({
                        retryAttempt: 1,
                    });

                for (const [source, delay] of Object.entries({
                    'args.retryAfterMS': args[0].retryAfterMS ?? defaultDelay,
                    'lastRun.delay': stats.lastRun.delay,
                })) {
                    const message = `${source} Should match predicted delay for <Retry-After: ${sample.retryAfter}>`;

                    if (Array.isArray(sample.expectRetryAfter)) {
                        expect(delay)
                            .to.be.within(...sample.expectRetryAfter, message);
                    }
                    else {
                        expect(delay)
                            .to.equal(sample.expectRetryAfter, message);
                    }
                }

                // @ts-ignore
                expect(args[1])
                    .to.be.instanceOf(Response)
                    .and.have.property('status', 429);

                expect(response.status)
                    .to.equal(429);
                expect(response.ok)
                    .to.equal(false);
            }
        });

        it('should have retry behaviour nullified by user-specified abort controller', async () => {

            /** @type {any} */
            let stats;

            const timeout = 100;
            const url = context.testRequestURL({
                delay: timeout * 2,
            });

            const controller = new AbortController();

            setTimeout(() => {
                controller.abort('User-specified');
            }, timeout);

            const request = () => fetchEx(url, {
                signal: controller.signal,
                extension: {
                    retry: {
                        limit: 2,
                        delay: 0,
                    },
                    onComplete(runStats) {
                        stats = runStats;
                    },
                },
            });

            await expect(request())
                .to.be.rejected;

            expect(stats.runs.length)
                .to.equal(1);
            expect(stats.fail)
                .to.include('failed with AbortError (User-specified) after 1 attempt');
        });

        it('should handle broken request inputs as native fetch except for extension behaviour', async () => {

            /** @type {any} */
            let stats;

            await expect(fetchEx('https://localhost-must-not-exist.com', {
                    extension: {
                        retry: {
                            limit: 3,
                            delay: 0,
                        },
                        onComplete(runStats) {
                            stats = runStats;
                        },
                    },
                }))
                .to.be.rejected;

            expect(stats.runs.length)
                .to.equal(4);
            expect(stats.fail)
                .to.include('failed with FetchError (ENOTFOUND) after 4 attempts');
        });

        it('should support extension.json', async () => {

            const sourceData = {
                foo: 1,
            };

            const url = context
                .testRequestURL({
                    json: JSON.stringify(sourceData),
                });

            const request = () => fetchEx(url, {
                method: 'POST',
                extension: {
                    json: sourceData,
                    debug: true,
                },
            });

            const response = await request();
            const source = response.extension.stats.lastRun.request;

            const requestHeaders = source.headers;

            expect(isHeaders(requestHeaders))
                .to.be.true;

            expect(Object
                .fromEntries(requestHeaders
                    .entries()))
                .and.eql({
                    accept: 'application/json',
                    'content-type': 'application/json',
                });

            let requestBody = '';
            for await (const chunk of source.body) {
                requestBody += chunk;
            }

            expect(requestBody)
                .to.eql(JSON.stringify(sourceData));

            expect(await response.extension.body())
                .to.eql(sourceData);
        });
    });

    describe('response.extension.body()', () => {

        it('should infer and execute body parser', async () => {

            const samples = [
                [
                    {json: 'true'},
                    true,
                ],
                [
                    {text: 'text'},
                    'text',
                ],
            ];

            for (const [input, expected] of samples) {

                const url = context.testRequestURL(input);

                const response = await
                    fetchEx(url);

                expect(await response.extension.body())
                    .to.equal(expected);
            }
        });
    });
});
