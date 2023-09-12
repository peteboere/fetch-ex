import * as baseAPIs from '#src/api.native';
import {RequestInit} from 'node-fetch';

export type Resource = string | URL | baseAPIs.Request;

interface OptionsExtension {
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
}

export interface Options extends RequestInit {
    /**
     * Fetch options extension.
     */
    extension?: OptionsExtension;
}

interface ResponseExtension {
    /**
     * Infer and execute body parser based on `content-type`.
     */
    body: () => Promise<JSON | string>;

    /**
     * Response stats.
     */
    stats: any;
}

export class Response extends baseAPIs.Response {
    /**
     * Fetch response extension.
     */
    extension?: ResponseExtension;
}
