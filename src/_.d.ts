import {fetch} from '#src/api.native';

type FetchParams = Parameters<typeof fetch>;
type FetchResource = FetchParams[0];
type FetchOptions = FetchParams[1];
type FetchResponse = Awaited<ReturnType<typeof fetch>>;

export type Resource = FetchResource;

export interface Options extends FetchOptions {
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
            delay?: number | string;
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
        }

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

export interface Response extends FetchResponse {
    /**
     * Fetch response extension.
     */
    extension?: {
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
