# Fang Viper Journal

Black-and-white discipline and motivation blog for the Fang Viper brand, for the gym, the business and every goal. Ads on the site promote the store at [fangviper.com](https://fangviper.com).

Live site: https://blog.fangviper.com/

## Editing

- Articles, quotes and categories: `assets/js/data.js`
- Store ads (products, prices, announcement bar): `assets/js/ads.js`
- After changing articles, regenerate the per-article pages, sitemap and search tags:

  ```
  powershell -ExecutionPolicy Bypass -File tools\build-pages.ps1
  ```

  The site address used in search tags lives in `tools/site-url.txt` (currently https://blog.fangviper.com).
