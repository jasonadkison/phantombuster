// Phantombuster configuration {

"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"

const Buster = require("phantombuster")
const buster = new Buster()

const Nick = require("nickjs")
const nick = new Nick()

// }

nick.newTab().then(async (tab) => {
  const arg = buster.argument;
  const { id } = arg;
  await tab.open(`https://www.instagram.com/p/${id}`);
  await tab.untilVisible("#react-root > section > main > div > div > article > header > div canvas"); // Make sure we have loaded the page
  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape
  await tab.inject("../injectables/lodash-full-4.13.1.min.js"); // We're going to use lodash to extract certain data from graphql structure
  const media = await tab.evaluate((arg, callback) => {
    // Here we're in the page context. It's like being in your browser's inspector tool

    // At the moment, Instagram creates a global js object on media pages called _sharedData which contains the graphql edge data.
    const mediaEdge = _.get(window._sharedData || {}, 'entry_data.PostPage[0].graphql.shortcode_media', {});

    const data = {
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
      owner: {
        username: _.get(mediaEdge, 'owner.username', null),
        name: _.get(mediaEdge, 'owner.full_name', null),
        avatar: _.get(mediaEdge, 'owner.profile_pic_url', null),
      },
    };
    callback(null, data);
  });

  await buster.setResultObject(media);
  console.log(JSON.stringify(media, null, 2));
})
.then(() => {
  console.log("Job done!");
  nick.exit();
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`);
  nick.exit(1);
});
