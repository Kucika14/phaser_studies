// https://webpack.js.org/guides/development/
// https://hackernoon.com/a-tale-of-webpack-4-and-how-to-finally-configure-it-in-the-right-way-4e94c8e7e5c1
// https://slack.engineering/keep-webpack-fast-a-field-guide-for-better-build-performance-f56a5995e8f1

const path = require('path')

const webpack                       = require('webpack')
const MiniCssExtractPlugin          = require('mini-css-extract-plugin')
const { CleanWebpackPlugin }        = require('clean-webpack-plugin')
const StyleLintPlugin               = require('stylelint-webpack-plugin')
const TerserPlugin                  = require('terser-webpack-plugin')
const HtmlWebpackPlugin             = require('html-webpack-plugin')

module.exports = (env = {}, options) => {
  const { mode } = options
  const PROD    = mode === 'production'
  const DEV     = mode === 'development'
  const HASH    = DEV ? 'hash' : 'contenthash'

  console.log(`mode: ${ mode }, PROD: ${ PROD }, DEV: ${ DEV }, HASH: ${ HASH }`)

  const config = {
    entry: {
      index: './app/main.tsx'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `[name].[${ HASH }].js`,
      chunkFilename: `[name].[${ HASH }].js`,
      publicPath: DEV ? 'http://localhost:8080/' : ''
    },

    stats: PROD ? 'verbose' : 'normal',

    performance: {
      hints: PROD ? 'warning' : false
    },

    // Egyelőre csak fejlesztéskor legyen egy gyors source-map
    // eredetileg inline-source-map volt használva, de ez gyorsabb
    // 2019.01.11: vissza az inline-source-map-ra, mert ez teljesen pontos source-map, hiába lassabb, mint a cheap-source-map
    // devtool: DEV ? 'inline-source-map' : '', // 'cheap-eval-source-map' : '',
    devtool: DEV ? 'inline-source-map' : '',

    // https://webpack.js.org/configuration/watch/
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    },

    // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-2
    optimization: Object.assign({
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'dll',
            chunks: 'all'
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }, PROD ? {
      minimizer: [
        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        new TerserPlugin({ extractComments: true })
      ],
    } : {}),

    resolve: {
      descriptionFiles: [ 'package.json' ],

      // --- A .js mindenféleképp kell
      // https://github.com/webpack-contrib/style-loader/issues/254
      extensions: [ '.js', '.ts', '.tsx', '.css' ], // kiterjesztés nélkül is felismerje ezeket importáláskor
      modules: [ 'node_modules' ],
      alias: {
        '@app': path.resolve(__dirname, 'app'),
      }
    },

    module: {
      rules: [
        {
          // https://webpack.js.org/configuration/module/#rule-enforce
          enforce: 'pre', // hogy a ts előtt fusson le
          test: /\.(ts|tsx)$/,
          exclude: [ /node_modules/ ],
          loader: 'eslint-loader',

          // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
          options: {
            formatter: require('eslint/lib/cli-engine/formatters/stylish'),
            failOnWarning: false,
            failOnError: PROD,
            cache: false // ha true, akkor eslintrc változtatáskor beragadhat a szabály
          }
        },

        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true,
            configFile: path.resolve(__dirname, 'tsconfig.json')
          }
        },

        // 3rd party css fájlokhoz
        {
          test: /\.css$/,
          include: [ /node_modules/ ],
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [].concat(
                  PROD ? [
                    require('autoprefixer')(),
                    require('cssnano')({
                      preset: [
                        'default', {
                          discardComments: {
                            removeAll: true
                          }
                        }
                      ]
                    })
                  ] : []
                )
              }
            }
          ]
        },

        // Saját css fájlokhoz
        {
          test: /\.css$/,
          exclude: [ /node_modules/ ],
          use: [
            // https://github.com/webpack-contrib/style-loader
            // https://github.com/webpack-contrib/mini-css-extract-plugin
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              // https://github.com/webpack-contrib/css-loader
              loader: 'css-loader',

              // https://github.com/webpack-contrib/css-loader#options
              options: {
                modules: {
                  localIdentName: PROD ? '[hash:base64:5]' : '[local]--[hash:base64:5]' // '[path][name]__[local]--[hash:base64:5]'
                },
                localsConvention: 'camelCase', // https://github.com/webpack-contrib/css-loader#localsconvention
                importLoaders: 1, // https://github.com/webpack-contrib/css-loader#importloaders
              }
            },
            {
              // https://github.com/postcss/postcss-loader
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                config: {
                  path: path.resolve(__dirname),
                  // ctx: { env: mode } // ezt passzolja majd a confignak; a mode 'production' vagy 'development'
                }
              }
            }
          ]
        },

        {
          test: /\.(ttf)(\?v=\d+\.\d+\.\d+)?$/,
          use: [ {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              // https://stackoverflow.com/questions/59070216/webpack-file-loader-outputs-object-module
              esModule: false
            }
          } ]
        },

        {
          // https://github.com/webpack-contrib/file-loader
          test: /\.(jpe?g|png|gif|svg|gif)$/i,
          use: [ {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:6].[ext]',
              // https://stackoverflow.com/questions/59070216/webpack-file-loader-outputs-object-module
              esModule: false
            }
          } ]
        },

        {
          test: /\.mp3$/,
          loader: 'file-loader',
          options: {
            name: 'sfx/[name]-[hash:6].[ext]',
            // https://stackoverflow.com/questions/59070216/webpack-file-loader-outputs-object-module
            esModule: false
          }
        }
      ]
    },

    // https://webpack.js.org/configuration/dev-server/
    devServer: {
      // inline: false,
      historyApiFallback: true,
      disableHostCheck: true,
      clientLogLevel: 'none',
      overlay: {
        warnings: false,
        errors: true
      }
    },

    plugins: [
      // https://webpack.js.org/plugins/define-plugin/
      new webpack.DefinePlugin({
        __DEV__: DEV,
        __TEST__: false
      }),

      // https://webpack.js.org/plugins/provide-plugin/
      new webpack.ProvidePlugin({
        log: [ '@app/log', 'default' ]
      }),

      // https://www.npmjs.com/package/stylelint-webpack-plugin
      new StyleLintPlugin({
        context: './app',
        files: '**/*.css'
      }),

      // https://github.com/webpack-contrib/mini-css-extract-plugin
      new MiniCssExtractPlugin({
        filename: `[name].[${ HASH }].css`,
        chunkFilename: `[name].[${ HASH }].css`
      }),

      // https://github.com/jantimon/html-webpack-plugin
      new HtmlWebpackPlugin(Object.assign({
        template: './app/index.html',
        output: 'index.html',
        title: 'Ákos szuper játéka'
      }, PROD ? {
        minify: {
          collapseWhitespace:            true,
          removeComments:                true,
          removeRedundantAttributes:     true,
          removeScriptTypeAttributes:    true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype:               true,
          minifyCSS:                     true,
          minifyJS:                      true
        }
      } : {}))
    ].concat(
      DEV ? [
        // new webpack.HotModuleReplacementPlugin()
      ] : /* PROD */ [
        // https://github.com/johnagan/clean-webpack-plugin
        new CleanWebpackPlugin(),
      ]
    )
  }

  return config
}
