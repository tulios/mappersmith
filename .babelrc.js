module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['@babel/plugin-transform-regenerator'],
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'minify-replace',
      {
        replacements: [
          {
            identifierName: 'VERSION',
            replacement: {
              type: 'stringLiteral',
              value: require('./package.json').version,
            },
          },
        ],
      },
    ],
  ],
}
