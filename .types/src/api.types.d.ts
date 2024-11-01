export type Resource = Parameters<typeof fetch>[0];
export interface FetchExtRequestInit extends RequestInit {
    /**
     * Fetch extension options.
     */
    extension?: {
        /**
         * Request timeout in milliseconds or duration parsable by space-time package.
         *
         * This timeout is defined as time to first byte (TTFB). Timeout based on active
         * time, including any resource.body handling, requires a AbortSignal.timeout().
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
export interface FetchExtResponse extends Response {
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
