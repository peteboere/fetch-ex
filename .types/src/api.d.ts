/**
 * Extension of native fetch API (node-fetch)
 *
 * @param {import('./_.d.ts').Resource} url
 * @param {import('./_.d.ts').Options} [options]
 * @returns {Promise<import('./_.d.ts').Response>}
 */
export function fetchEx(url: import('./_.d.ts').Resource, options?: import('./_.d.ts').Options): Promise<import('./_.d.ts').Response>;
