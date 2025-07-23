exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.js$/,
          include: /node_modules\/@react-three/,
          type: "javascript/auto",
        },
      ],
    },
  });
};

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelOptions({
    options: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: ["> 1%", "last 2 versions", "not ie <= 8"],
            },
            modules: false,
          },
        ],
        "@babel/preset-react",
      ],
    },
  });
};
