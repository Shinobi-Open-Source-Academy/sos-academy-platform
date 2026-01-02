const { join } = require('node:path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isWatch = process.argv.includes('--watch') || process.env.NEST_WATCH === 'true';

  // For NestJS watch mode, output to dist/ relative to app (NestJS expects dist/main.js)
  // For production build, output to ../../dist/apps/server
  const outputPath = isWatch ? join(__dirname, 'dist') : join(__dirname, '../../dist/apps/server');

  // For watch mode, NestJS expects the file at dist/main.js (not dist/src/main.js)
  const outputFilename = isWatch ? 'main.js' : 'main.js';

  return {
    target: 'node',
    entry: './src/main.ts',
    output: {
      path: outputPath,
      filename: outputFilename,
    },
    externals: [
      nodeExternals({
        // Include native modules and optional dependencies
        allowlist: isWatch ? [] : undefined,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.app.json',
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: join(__dirname, 'tsconfig.app.json'),
        }),
      ],
      fallback: {
        '@nestjs/websockets/socket-module': false,
        '@nestjs/microservices/microservices-module': false,
        '@nestjs/microservices': false,
        'class-transformer/storage': false,
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true,
          },
          {
            from: 'src/modules/email/templates',
            to: 'modules/email/templates',
          },
        ],
      }),
    ],
    optimization: {
      minimize: isProduction,
    },
    devtool: isProduction ? false : 'source-map',
  };
};
