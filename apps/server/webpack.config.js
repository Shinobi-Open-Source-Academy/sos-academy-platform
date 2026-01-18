const { join } = require('node:path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (_, argv) => {
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
    externals: [nodeExternals()],
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
      minimize: false,
    },
    devtool: isProduction ? false : 'source-map',
    ignoreWarnings: [
      // NestJS and Express use dynamic requires that are safe
      {
        module: /@nestjs\/common\/utils\/load-package\.util\.js/,
        message: /Critical dependency/,
      },
      {
        module: /@nestjs\/core\/helpers\/load-adapter\.js/,
        message: /Critical dependency/,
      },
      {
        module: /@nestjs\/core\/helpers\/optional-require\.js/,
        message: /Critical dependency/,
      },
      {
        module: /express\/lib\/view\.js/,
        message: /Critical dependency/,
      },
      {
        module: /handlebars\/lib\/index\.js/,
        message: /require\.extensions/,
      },
      {
        module: /mongodb\/lib\/deps\.js/,
        message: /Module not found/,
      },
    ],
  };
};
