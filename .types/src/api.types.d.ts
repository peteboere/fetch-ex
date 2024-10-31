export type Resource = Parameters<typeof fetch>[0];
export interface FetchExtRequestInit extends RequestInit {
    /**
     * Fetch options extension.
     */
    extension?: {
        /**
         * Request timeout in milliseconds or duration parsable by space-time package.
         */
        timeout?: number | string;
        /**
         * Retry request options.
         */
        retry?: {
            /**
             * Number of retries.
             * @default 1
             */
            limit?: number;
            /**
             * Valid methods for retries.
             * @default ['DELETE', 'GET', 'HEAD', 'PATCH', 'PUT']
             */
            methods?: string[];
            /**
             * Delay between retries.
             * @default 100
             */
            delay?: number | string | RetryDelayResolver;
        };
        /**
         * Request completion callback.
         */
        onComplete?: (runStats: any) => void;
        /**
         * Logging callbacks.
         */
        log?: {
            fail?: (msg: string) => void;
            ok?: (msg: string) => void;
            warn?: (msg: string) => void;
        };
        /**
         * Shortcut for sending JSON serialized data.
         */
        json?: any;
        /**
         * Add debug data to response.extension.
         */
        debug?: boolean;
    };
}
export interface FetchExtResponse extends Awaited<ReturnType<typeof fetch>> {
    /**
     * Fetch response extension.
     */
    extension: {
        /**
         * Infer and execute body parser based on `content-type`.
         */
        body: () => Promise<JSON | string>;
        /**
         * Response stats.
         */
        stats: any;
    };
}
type RetryDelayResolver = (retryMetadata: {
    retryAttempt?: number;
    /** Inferred from retry-after header when available */
    retryAfterMS?: number;
}, lastResponse?: FetchExtResponse) => number;
export {};
