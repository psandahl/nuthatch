const path = require('path');

module.exports = {
    entry: './src/client/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [__dirname],
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    }
};