var axios = require('axios'),
    Promise = require('bluebird'),
    async = require('async');

var rapidApiMode = !!process.env.RAPIDAPI_KEY, 
    rapidApiURL = 'https://instagram130.p.rapidapi.com/proxy';

var userURL = 'https://www.instagram.com/',
    listURL = 'https://www.instagram.com/explore/tags/',
    postURL = 'https://www.instagram.com/p/',
    locURL = 'https://www.instagram.com/explore/locations/',
    dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/;

var headers = {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'}

if (rapidApiMode) {
    headers['x-rapidapi-key'] = process.env.RAPIDAPI_KEY
}

var proxifyURL = function (url) {
    if (!rapidApiMode) return url;

    return rapidApiURL + '?url=' + encodeURIComponent(url);
} 

exports.scrapeUserPage = function (username) {
    return new Promise(function (resolve, reject) {
        if (!username) return reject(new Error('Argument "username" must be specified'));

        axios.get(proxifyURL(userURL + username), { headers }).then((result) => {
            var data = scrape(result.data);
            if (data && data.entry_data &&
                data.entry_data.ProfilePage &&
                data.entry_data.ProfilePage[0] &&
                data.entry_data.ProfilePage[0].graphql &&
                data.entry_data.ProfilePage[0].graphql.user &&
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media &&
                data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count > 0 && data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges) {
                var edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
                async.waterfall([
                    (callback) => {
                        var medias = [];
                        edges.forEach((post) => {
                            if (post.node.__typename === 'GraphImage'||post.node.__typename === 'GraphSidecar' || post.node.__typename === 'GraphVideo') {
                                medias.push(exports.scrapePostData(post))
                            }
                        });
                        callback(null, medias);
                    }
                ], (err, results) => {
                    resolve({
                        total: results.length,
                        medias: results,
                        user: data.entry_data.ProfilePage[0].graphql.user
                    })
                })
            }
            else {
                reject(new Error('Error scraping user page "' + username + '"'));
            }
        }).catch((err) => {
            reject(new Error('Error scraping user page "' + username + '"'));
        });
    });
};

exports.deepScrapeTagPage = function (tag) {
    return new Promise(function (resolve, reject) {
        exports.scrapeTag(tag).then(function (tagPage) {
            return Promise.map(tagPage.medias, function (media, i, len) {
                return exports.scrapePostCode(media.node.shortcode).then(function (postPage) {
                    tagPage.medias[i] = postPage;
                    if (postPage.location && postPage.location.has_public_page) {
                        return exports.scrapeLocation(postPage.location.id).then(function (locationPage) {
                            tagPage.media[i].location = locationPage;
                        })
                            .catch(function (err) {
                                console.log("An error occurred calling scrapeLocation inside deepScrapeTagPage" + ":" + err);
                            });
                    }
                })
                    .catch(function (err) {
                        console.log("An error occurred calling scrapePostPage inside deepScrapeTagPage" + ":" + err);
                    });
            })
                .then(function () { resolve(tagPage); })
                .catch(function (err) {
                    console.log("An error occurred resolving tagPage inside deepScrapeTagPage" + ":" + err);
                });
        })
            .catch(function (err) {
                console.log("An error occurred calling scrapeTagPage inside deepScrapeTagPage" + ":" + err);
            });
    });
};

exports.scrapeTag = function (tag) {
    return new Promise(function (resolve, reject) {
        if (!tag) return reject(new Error('Argument "tag" must be specified'));

        axios.get(proxifyURL(listURL + tag), { headers }).then((result) => {
            var data = scrape(result.data);
            var media = data.entry_data && data.entry_data.TagPage && data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media;

            if (data && media) {
                var edges = media.edges;

                async.waterfall([
                    (callback) => {
                        var medias = [];
                        edges.forEach((post) => {
                            medias.push(exports.scrapePostData(post))
                        });
                        callback(null, medias);
                    }
                ], (err, results) => {
                    resolve({
                        total: results.length,
                        medias: results
                    })
                })

            }
            else {
                reject(new Error('Error scraping tag page "' + tag + '"'));
            }
        }).catch((err) => {
            reject(new Error('Error scraping tag page "' + tag + '": ' + err.message));
        });
    });
};
exports.scrapeComment = function (shortcode) {
    return new Promise(function (resolve, reject) {
        if (!shortcode) return reject(new Error('Argument "shortcode" must be specified'));

        axios.get(proxifyURL(postURL+shortcode), { headers }).then((result) => {
            var data = scrape(result.data);
            var comments = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_parent_comment;
            if(comments != undefined){
                let commentList = comments.edges
                async.waterfall([
                    (callback) => {
                        var medias = [];
                        commentList.forEach((post) => {
                            // console.log(post)
                            medias.push(post)
                        });
                        callback(null, medias);
                    }
                ], (err, results) => {
                    if(err){
                        reject(new Error('comment not found for "' + page + '"'));
                    }
                    resolve({
                        total: comments.count,
                        medias: results
                    })
                })
            }else {
                reject(new Error('comment not found for "' + page + '"'));
            }

        }).catch((err) => {
            reject(new Error('Error scraping page "' + page + '"'));
        });
    });
};

exports.scrapePostData = function (post) {
    var scrapedData = {
        media_id: post.node.id,
        shortcode: post.node.shortcode,
        text: post.node.edge_media_to_caption.edges[0] && post.node.edge_media_to_caption.edges[0].node.text,
        comment_count: post.node.edge_media_to_comment.count,
        like_count: post.node.edge_liked_by.count,
        display_url: post.node.display_url,
        owner_id: post.node.owner.id,
        date: post.node.taken_at_timestamp,
        thumbnail: post.node.thumbnail_src,
        thumbnail_resource: post.node.thumbnail_resources,
        is_video: post.node.is_video
    }

    if (post.node.is_video) {
        scrapedData.video_view_count = post.node.video_view_count;
    }

    return post;
}

exports.scrapePostCode = function (code) {
    return new Promise(function (resolve, reject) {
        if (!code) return reject(new Error('Argument "code" must be specified'));

        axios.get(proxifyURL(postURL + code), { headers }).then((result) => {
            //if (err) return reject(err);

            var data = scrape(result.data);
            if (data && data.entry_data &&
                data.entry_data.PostPage[0] &&
                data.entry_data.PostPage[0].graphql &&
                data.entry_data.PostPage[0].graphql.shortcode_media) {
                resolve(data.entry_data.PostPage[0].graphql.shortcode_media);
            }
            else {
                reject(new Error('Error scraping post page "' + code + '"'));
            }
        }).catch((err) => {
            reject(new Error('Error scraping post page "' + code + '":' + err));
        });
    });
}

exports.scrapeLocation = function (id) {
    return new Promise(function (resolve, reject) {
        if (!id) return reject(new Error('Argument "id" must be specified'));

        axios.get(proxifyURL(locURL + id), { headers }).then((result) => {
            var data = scrape(result.data);

            if (data && data.entry_data && (typeof data.entry_data.LocationsPage !== "undefined")) {
                resolve(data.entry_data.LocationsPage[0].location);
            }
            else {
                reject(new Error('Error scraping location page "' + id + '"'));
            }
        }).catch((err) => {
            reject(new Error('Error scraping user page "' + id + '"'));
        });;
    });
}
var scrape = function (html) {
    try {
        var dataString = html.match(dataExp)[1];
        var json = JSON.parse(dataString);
    }
    catch (e) {
        if (process.env.NODE_ENV != 'production') {
            console.error('The HTML returned from instagram was not suitable for scraping');
        }
        return null
    }

    return json;
}
