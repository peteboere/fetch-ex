/**
 * Extension of native fetch API (node-fetch)
 *
 * @param {import('./_.ts').Resource} url
 * @param {import('./_.ts').Options} [options]
 * @returns {Promise<import('./_.ts').Response>}
 */
export function fetchEx(url: import('./_.ts').Resource, options?: import('./_.ts').Options): Promise<import('./_.ts').Response>;
