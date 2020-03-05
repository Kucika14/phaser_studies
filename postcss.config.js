module.exports = ({ env }) => {
  const PROD = env === 'production'

  return {
    plugins: [
      // https://github.com/outpunk/postcss-each
      require('postcss-each')(),

      // https://github.com/csstools/postcss-preset-env
      require('postcss-preset-env')({
        features: {
          'nesting-rules': true
        }
      }),

      // https://github.com/postcss/postcss-reporter
      require('postcss-reporter')({
        clearReportedMessages: true,
        clearAllMessages: true,
        throwError: true
      }),

      // https://cssnano.co/guides/optimisations
      PROD ? require('cssnano')({ preset: 'default' }) : false
    ]
  }
}
