# instagram-scraping

[![npm downloads](https://img.shields.io/npm/dt/instagram-scraping.svg)](https://npm.im/instagram-scraping)

> NodeJS module for loading posts from Instagram by hashtag without API access by means of scraping.

## Disclamer

Instagram has gone to great lengths to prevent scraping and other unauthorized access to their public content. This module is dependant on the markup the public-facing instagram.com. Should that change this module might also stop working as intended. It also only loads the 12 posts that are displayed on first-load without following pagination to load more images. You should take this into consideration when deciding whether this module will work for you.

## Cloud Proxy support
To avoid many scraping errors (`302 redirect to login`, and `429 Rate Limited`) this library now has cloud proxy support (free and paid plans are available, depending on your volume). Subscribe to https://rapidapi.com/neotank/api/instagram130 which is a proxy for Instagram, and specify your RAPIDAPI_KEY to the env variable when launching your scraping script: `RAPIDAPI_KEY=your-key node index.js` - this will route all requests to Instagram through proxies with retries and response quality checks under the hood.

## Installation

`npm install instagram-scraping`

## Usage

There are some limitation of loading instagram data, but enjoy it. i hope it's will help you.

### Tag Scraping Media

```javascript
var ig = require('instagram-scraping');

ig.scrapeTag('veranda').then((result) => {
  console.dir(result);
});
```

Example response:

```json
{
  "total": 54,
  "medias": [
    {
      "media_id": "1684684359967334824",
      "shortcode": "CPHnIGbBh1k",
      "text": "Selamat siang komuni!🙋 Sportakular hadir lagi untuk mengawali 2018 kita ini dengan penuh semangat dan kebersamaan, berikut jadwal-jadwalnya : sportakular Voly Kamis,4 Januari 2018 18.00 sd selesai Lap.telkom pinggir monumen Sportakular Futsal Jumat , 5 Januari 2018 17.30-20.00 Lap. Meteor Sportakular Badminton Sabtu,6 Januari2018 19.00-21.00 Lap.Pdam (pinggir ITB) Dicatet ya setiap jadwal kegiatannya, biar tidak terlewatkan karena sayang banget untuk dilewatkan. 😉 dan untuk cabang olahraga lain bakalan mimin share lagi so stay tuned dan selalu ingat: 'Berpartisipasi = Auto Kece😎😎' salam olahraga! #himaik #Ikberaniberkarya #salamsatuik #menujuIKsehat #unikom #sportakular",
      "comment_count": {
        "count": 0
      },
      "like_count": {
        "count": 10
      },
      "display_url": "https://instagram.fpku1-1.fna.fbcdn.net/t51.2885-15/e35/25024357_207155156521690_1744670180115480576_n.jpg?se=7",
      "owner_id": "1648294943",
      "date": 1515050047,
      "thumbnail": "https://instagram.fpku1-1.fna.fbcdn.net/t51.2885-15/s640x640/sh0.08/e35/c0.134.1076.1076/25024357_207155156521690_1744670180115480576_n.jpg",
      "thumbnail_resource": [
        {
          "src": "https://instagram.fpku1-1.fna.fbcdn.net/t51.2885-15/s150x150/e35/c0.134.1076.1076/25024357_207155156521690_1744670180115480576_n.jpg",
          "config_width": 150,
          "config_height": 150
        },
        {
          "src": "https://instagram.fpku1-1.fna.fbcdn.net/t51.2885-15/s240x240/e35/c0.134.1076.1076/25024357_207155156521690_1744670180115480576_n.jpg",
          "config_width": 240,
          "config_height": 240
        }
      ]
    }
  ]
}
```
### Scrape Comment

```javascript
// using shortcode for scraping comment 
ig.scrapeComment('CPHnIGbBh1k').then((result) => {
  console.dir(result);
});
```
### Deep Tag Scraping

```javascript
ig.deepScrapeTagPage('veranda').then((result) => {
  console.dir(result);
});
```

### Scrape User Page

```javascript
// using username for scraping
ig.scrapeUserPage('jscmila').then((result) => {
  console.dir(result);
});
```
