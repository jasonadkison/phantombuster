// Phantombuster configuration {

"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"
"phantombuster dependencies: lib-Sponsored.js"

const Buster = require("phantombuster")
const buster = new Buster()

const Nick = require("nickjs")
const nick = new Nick()

const _ = require("lodash")
const Sponsored = require("./lib-Sponsored")

// }

nick.newTab().then(async (tab) => {
  const arg = buster.argument;
  const { handle } = arg;
  await tab.open(`https://www.instagram.com/${handle}`);
  await tab.untilVisible("#react-root > section > main header:first-of-type section:first-of-type h1:first-of-type"); // Make sure we have loaded the page
  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape
  await tab.inject("../injectables/lodash-full-4.13.1.min.js"); // We're going to use lodash to extract certain data from graphql structure
  return await tab.evaluate((arg, callback) => {
    // Here we're in the page context. It's like being in your browser's inspector tool

    // At the moment, Instagram creates a global js object on media pages called _sharedData which contains the graphql edge data.
    const userEdge = _.get(window._sharedData || {}, 'entry_data.ProfilePage[0].graphql.user', {});
    const mediaEdges = _.get(userEdge, 'edge_owner_to_timeline_media.edges', []);

    const account = {
      id: _.get(userEdge, 'id', null),
      username: _.get(userEdge, 'username', null),
      name: _.get(userEdge, 'full_name', null),
      bio: _.get(userEdge, 'biography', null),
      postCount: _.get(userEdge, 'edge_owner_to_timeline_media.count', null),
      followerCount: _.get(userEdge, 'edge_followed_by.count', null),
      followCount: _.get(userEdge, 'edge_follow.count', null),
      isPrivate: _.get(userEdge, 'is_private', null),
      isVerified: _.get(userEdge, 'is_verified', null),
      avatar: _.get(userEdge, 'profile_pic_url_hd', null),
    };

    callback(null, { owner: account, mediaEdges });
  });
})
.then(async ({ owner, mediaEdges }) => {
  console.log('Performing data mapping...');

  const medias = [];

  _.forEach(mediaEdges, function(_mediaEdge) {
    const mediaEdge = _.get(_mediaEdge, 'node', {});
    const mediaData = {
      id: _.get(mediaEdge, 'id', null),
      shortcode: _.get(mediaEdge, 'shortcode', null),
      caption: _.get(mediaEdge, 'edge_media_to_caption.edges[0].node.text', null),
      likesCount: _.get(mediaEdge, 'edge_media_preview_like.count', null),
      viewsCount: _.get(mediaEdge, 'video_view_count', null),
      commentsCount: _.get(mediaEdge, 'edge_media_to_comment.count', null),
      mediaType: _.get(mediaEdge, 'is_video', false) ? 'video' : 'image',
      imageUrl: _.get(mediaEdge, 'display_url', null),
      videoUrl: _.get(mediaEdge, 'video_url', null),
      createdAtTime: _.get(mediaEdge, 'taken_at_timestamp', null),
      owner,
      isSponsored: Sponsored.isSponsoredMedia(mediaEdge),
    };
    medias.push(mediaData);
  });

  console.log('Data mapping complete!');
  await buster.setResultObject(medias);
})
.then(() => {
  console.log("Job done!");
  nick.exit();
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`);
  nick.exit(1);
});
