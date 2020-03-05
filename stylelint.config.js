// https://stylelint.io/user-guide/rules/
// TODO
// https://github.com/kristerkari/stylelint-high-performance-animation
// https://github.com/kristerkari/stylelint-z-index-value-constraint
// https://github.com/suitcss/stylelint-suitcss
// https://github.com/airbnb/css

module.exports = {
  rules: {
    'declaration-empty-line-before': null,
    'selector-type-no-unknown': [ true, { ignore: [ 'custom-elements' ] } ],
    'number-leading-zero': null,
    'selector-pseudo-class-no-unknown': [ true, { ignorePseudoClasses: [ 'global', 'local' ] } ],
    'at-rule-no-unknown': [ true, { ignoreAtRules: [ 'function', 'mixin', 'if', 'each', 'include', 'for' ] } ],
    'font-family-no-missing-generic-family-keyword': null,
    'function-whitespace-after': null,
    'comment-empty-line-before': null,
    'declaration-no-important': true,
    'property-no-unknown': [ true, { ignoreProperties: [ 'composes' ] } ] // https://github.com/css-modules/css-modules#composition
  }
}
