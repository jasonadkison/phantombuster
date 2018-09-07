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
  const { url } = buster.argument;
  //const url = "https://www.facebook.com/DonaldTrump/posts/10161487534090725";
  //const url = "https://www.facebook.com/DonaldTrump/videos/vb.153080620724/10159664271045725/?type=2&theater";
  //const url = "https://www.facebook.com/DonaldTrump/photos/a.10156483516640725/10161489089290725/?type=3&permPage=1"

  await tab.open(url);
  await tab.untilVisible(".userContentWrapper"); // Make sure we have loaded the right page
  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape

  //await tab.screenshot("screenshot.png") // Why not take a screenshot while we're at it?

   // determines the type of post by analyzing the url
  const postType = (() => {
    if (/^https?:\/\/(www\.)?facebook\.com\/(photo(\.php|s)|permalink\.php|media|questions|notes|[^\/]+\/(activity|posts|photos))[\/?].*$/gm.test(url)) {
      return 'post';
    }
    if (/^https?:\/\/(www\.)?facebook\.com\/([^\/?].+\/)?video(s|\.php)[\/?].*$/gm.test(url)) {
      return 'video';
    }
  })();

  if (!postType) return done('Could not determine the type of post');

  const data = await tab.evaluate(({ postType, url }, done) => {

    const wrapper = $('.userContentWrapper:first');
    if (!wrapper.length) return done('Could not find wrapper element');

    // the header contains their name and posted_at timestamp
    const header = $('div[id^="feed_subtitle_"]', wrapper);
    if (!header.length) return done('Could not find the header');

    // the content contains the post body
    const content = $('.userContent', wrapper);
    if (!content.length) return done('Could not find the content');

    // the footer contains the post stats
    const footer = $('form.commentable_item', wrapper);
    if (!footer.length) return done('Could not find the footer');

    const stats = (() => {
      // the comment stats are found in the footer "bling" link
      const bling = $('a[data-comment-prelude-ref="action_link_bling"]:first-of-type', footer);
      if (!bling.length) return done('Could not find the bling element');

      // the label is the aria-label of the bling link, e.g. "8,677 likes 1,762 comments 538 shares"
      const statsLabel = bling.attr('aria-label');
      if (!statsLabel) return done('Could not find the stats label');

      const data = {
        likes: null,
        comments: null,
        shares: null,
        views: null,
      };

      // use regex to extract the individual stats from the label text
      const pattern = /((\d{1,3}(,\d{3})*)+\s\w+)/g;
      let match;

      while (match = pattern.exec(statsLabel)) {
        // match will be a string e.g. "1,234 likes"
        const parts = match[0].split(' ');
        const key = parts[1]; // e.g. likes, comments, shares
        const value = parts[0]; // the numeric portion
        data[key] = value;
      }

      if (postType === 'video' && !data.views) {
        data.views = (() => {
          const value = $('span:contains(Views):first-of-type', footer).text().replace(' Views', '');
          if (!value) return done('Could not get video views count');
          return value;
        })();
      }

      return data;
    })();

    const getPostMediaData = (() => {
      const imageWrapper = $('.userContent + div', wrapper);
      const image = $('[data-ploi]:first', imageWrapper).data('ploi');
      const type = image ? 'image' : 'text';

      return {
        type,
        image,
      };
    });

    const getVideoMediaData = (() => {
      const type = 'video';
      const image = $('div[id^=permalink_video] video + div img').attr('src');
      if (!image) return done('Could not get video image');
      return {
        type,
        image,
      };
    });

    const post = (() => {
      const id = $('input[name="ft_ent_identifier"]', footer).attr('value');
      const body = $(content.html().replace(/<(br)\s*?\/?>/g, '\n').replace('<br />', '\n')).text();
      const timestamp = $('abbr[data-utime]', header).data('utime');

      if (!id) return done('Could not get post id');
      if (!timestamp) return done('Could not get post timestamp');

      const data = {
        id,
        url,
        body,
        timestamp,
      };

      const mediaData = postType === 'post' ? getPostMediaData() : getVideoMediaData();

      return { ...data, ...mediaData };
    })();

    done(null, { postType, post, stats });
  }, { postType, url });

  if (postType === 'video') {
    console.log('trigger video modal');

    await tab.evaluate((args, done) => {
      const timestamp = $('.userContentWrapper .timestampContent');
      if (!timestamp.length) return done('Could not find the timestamp');
      const event = new Event('click', { bubbles: true });
      event.simulated = true;
      timestamp[0].dispatchEvent(event);
      done(null);
    });

    await tab.waitUntilVisible('#fbPhotoSnowliftViews');

    const totalViews = await tab.evaluate((args, done) => {
      const viewsText = $('#fbPhotoSnowliftViews').text();
      if (!viewsText) return done('Could not select the views text');

      // use regex to extract the individual stat from the text
      const pattern = /((\d{1,3}(,\d{3})*)+\s\w+)/g;
      const match = pattern.exec(viewsText)

      if (!match) return done('Could not extract views count from text');

      done(null, match[2]);
    });

    if (totalViews) {
      data.stats.views = totalViews;
    }
  }

  return data;
})
.then(async data => {
  const { stats, post } = data;
  const result = {
    ...post,
    ...stats,
  };
  return await buster.setResultObject(result);
})
.then(() => {
  console.log("Job done!")
  nick.exit()
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`)
  nick.exit(1)
})
