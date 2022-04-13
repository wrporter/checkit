/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
    cacheDirectory: './node_modules/.cache/remix',
    ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
    // serverBuildPath: './server.js',
    // server: './server.ts',
};

// if (process.env.NODE_ENV === 'production') {
//     module.exports = {
//         ...module.exports,
//         serverBuildPath: './server.js',
//         server: './server.ts',
//     };
// }
