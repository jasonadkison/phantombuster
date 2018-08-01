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
    const { id } = arg;
    await tab.open(`https://www.instagram.com/p/${id}`);
    await tab.untilVisible("#react-root > section > main > div > div > article > header > div canvas"); // Make sure we have loaded the page
    await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape
    await tab.inject("../injectables/lodash-full-4.13.1.min.js"); // We're going to use lodash to extract the media edge from the graphql data structure

    return await tab.evaluate((arg, callback) => {
      const mediaEdge = _.get(window._sharedData || {}, 'entry_data.PostPage[0].graphql.shortcode_media', {});
      callback(null, mediaEdge);
    });
  })
  .then(async (mediaEdge) => {
    console.log('Performing data mapping...');
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
      isSponsored: Sponsored.isSponsoredMedia(mediaEdge),
    };
    console.log('Data mapping complete!');
    await buster.setResultObject(data);
  })
  .then(() => {
    console.log("Job done!");
    nick.exit();
  })
  .catch((err) => {
    console.log(`Something went wrong: ${err}`);
    nick.exit(1);
  });
