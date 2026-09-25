# Fang Viper Journal

Black-and-white motivation and fitness blog for the Fang Viper brand. Ads on the site promote the store at [fangviper.com](https://fangviper.com).

Live site: https://thepetbitllc-sketch.github.io/fangviper-blog/

## Editing

- Articles, quotes and categories: `assets/js/data.js`
- Store ads (products, prices, announcement bar): `assets/js/ads.js`
- After changing articles, regenerate the per-article pages, sitemap and search tags:

  ```
  powershell -ExecutionPolicy Bypass -File tools\build-pages.ps1
  ```

  To move the site to its own domain later, run it once with `-SiteUrl https://blog.fangviper.com`.
