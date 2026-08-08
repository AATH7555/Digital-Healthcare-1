module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const loaders = webpackConfig.module.rules.find(
        (rule) => rule.oneOf
      ).oneOf;

      loaders.forEach((loader) => {
        if (loader.loader && loader.loader.includes('source-map-loader')) {
          loader.exclude = [/node_modules\/html5-qrcode/];
        }
      });

      return webpackConfig;
    },
  },
};
