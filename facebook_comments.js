// Phantombuster configuration {

"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"

const Buster = require("phantombuster");
const buster = new Buster();

const Nick = require("nickjs");
const nick = new Nick();

const _ = require("lodash");

// }

nick.newTab().then(async (tab) => {
  const { url, limit } = buster.argument;
  const hardCap = limit ? limit : 1000;

  //const url = "https://www.facebook.com/DonaldTrump/posts/10161487534090725";
  //const url = "https://www.facebook.com/DonaldTrump/videos/vb.153080620724/10159664271045725/?type=2&theater";
  //const url = "https://www.facebook.com/DonaldTrump/photos/a.10156483516640725/10161489089290725/?type=3&permPage=1"

  await tab.open(url);
  await tab.untilVisible('.userContentWrapper'); // Make sure we have loaded the right page
  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape

  const triggerComments = (arg, done) => {
    const wrapper = $('.userContentWrapper');
    const blingLink = $('[data-comment-prelude-ref="action_link_bling"]:first span:contains(Comments)', wrapper);
    const pageLink = $('.UFIPagerLink:contains("more comments"), .UFIPagerLink:contains("previous comments")', wrapper);
    const event = new Event('click', { bubbles: true });
    event.simulated = true;

    if (pageLink.length) {
      pageLink[0].dispatchEvent(event);
    } else {
      blingLink[0].dispatchEvent(event);
    }

    done(null);
  };

  const triggerSorting = (arg, done) => {
    const wrapper = $('.userContentWrapper');
    const dropdownButton = $('.uiPopover a[role="button"]', wrapper);
    if (!dropdownButton.length) return done(null);

    const event = new Event('click', { bubbles: true });
    event.simulated = true;
    dropdownButton[0].dispatchEvent(event);

    setTimeout(() => {
      const sortLink = $('a[role="menuitemcheckbox"]:contains(New)');
      if (!sortLink.length) return done(null);

      const event = new Event('click', { bubbles: true });
      event.simulated = true;
      sortLink[0].dispatchEvent(event);
      done(null);
    });
  };

  const expandComments = (arg, done) => {
    const wrapper = $('.userContentWrapper');
    const moreLinks = $('.UFICommentContent .UFICommentBody a:contains(See More)', wrapper);
    let timeout = 0;

    moreLinks.each((i, moreLink) => {
      timeout += 10;
      const event = new Event('click', { bubbles: true });
      event.simulated = true;
      moreLink.dispatchEvent(event);
    });

    setTimeout(() => {
      done(null);
    }, timeout);
  };

  const scrapeComments = (arg, done) => {
    const wrapper = $('.userContentWrapper');
    if (!wrapper.length) return done('Could not find wrapper element');

    // the footer contains the post stats
    const footer = $('form.commentable_item', wrapper);
    if (!footer.length) return done('Could not find the footer');

    const comments = $('div[id^="comment_js"][aria-label="Comment"]:not(.tracked)').addClass('tracked').css('opacity', 0.5);
    const results = [];

    comments.each((i, el) => {
      const comment = $(el);

      const id = (() => {
        const timestampLink = $('.UFICommentActions a[data-testid="ufi_comment_timestamp"]', comment);
        const href = timestampLink.attr('href');
        const matches = /((&|\?)comment_id=(\d*)\d*)/gi.exec(href || '');
        return matches ? matches[matches.length - 1] : undefined;
      })();

      const authorName =  $('.UFICommentActorName:first', comment).text();
      const body = $('.UFICommentActorName:first', comment).closest('div').find('> span:last').text().trim();
      const timestamp = $('abbr[data-utime]:first', comment).data('utime');

      // Test for the required attributes
      // - body will be empty if comment was an image
      if (!id) return done('Could not determine comment id');
      if (!timestamp) return done('Could not determine comment timestamp');
      if (!authorName) return done('Could not determine comment authorName');

      results.push({
        id,
        timestamp,
        authorName,
        body,
      });
    });

    done(null, results);
  };

  const checkHasNextPage = (arg, done) => {
    const wrapper = $('.userContentWrapper');
    const moreLink = $('.UFIPagerLink:contains("more comments"), .UFIPagerLink:contains("previous comments")', wrapper);
    done(null, moreLink.length > 0);
  };

  const sortComments = async () => {
    return await tab.evaluate(triggerSorting);
  };

  const initPage = async (pageNum) => {
    //await tab.screenshot(`page-${pageNum}-before-triggerComments.jpg`);
    await tab.evaluate(triggerComments);
    await tab.waitWhileVisible('.UFIPagerLink [aria-busy="true"], .UFICommentsLoadingSpinnerContainer');
    if (pageNum === 1) {
      await sortComments();
      await tab.waitWhileVisible('.UFIPagerLink [aria-busy="true"], .UFICommentsLoadingSpinnerContainer');
    }
    return await tab.evaluate(expandComments);
    //return await tab.screenshot(`page-${pageNum}-after-triggerComments.jpg`);
  };

  const getPage = async (pageNum) => {
    await initPage(pageNum);
    //await tab.screenshot(`page-${pageNum}-before-scrape.jpg`);
    const results = await tab.evaluate(scrapeComments);
    //await tab.screenshot(`page-${pageNum}-after-scrape.jpg`);
    console.log(`Page ${pageNum}: ${results.length} comments(s) scraped from DOM`);
    return results;
  };

  // !TODO: poll the browser context for any overlay and hide them automatically
  // Kept here for reference. Might not be needed and is not currently used.
  /*
  const ctaDismiss = (arg, done) => {
    let timeout;
    let delay = 500;

    const fn = () => {
      const ctaCloseButton = $('a#expanding_cta_close_button:visible');
      if (!ctaCloseButton.length) return done(null);
      const event = new Event('click', { bubbles: true });
      event.simulated = true;
      ctaCloseButton[0].dispatchEvent(event);
      timout = setTimeout(fn, delay);
    };

    timeout = setTimeout(fn);
    done(null);
  };

  await tab.evaluate(ctaDismiss);
  */

  const results = [];
  const tracked = {};
  const addResult = (result) => {
    if (results.length >= hardCap) return false;
    if (tracked[result.id]) return false;
    tracked[result.id] = true;
    results.push(result);
  }
  const addResults = (page, newResults) => {
    const duplicateResults = _.remove(newResults, (result) => tracked[result.id]);
    if (duplicateResults.length) {
      console.log(`Page ${page}: ${duplicateResults.length} comment(s) were dropped because they were already tracked`);
    }
    const emptyResults = _.remove(newResults, (result) => !result.body);
    if (emptyResults.length) {
      console.log(`Page ${page}: ${emptyResults.length} comment(s) were dropped because they didn't have text`);
    }
    const beforeAddCount = results.length;
    newResults.forEach(result => addResult(result));
    const afterAddCount = results.length;
    console.log(`Page ${page}: total comments increased by ${afterAddCount - beforeAddCount}, from ${beforeAddCount} to ${afterAddCount}`);
  };

  let page = 1;
  let running = true;

  console.log(`Started scraping ${url} for comments with a hard cap limit of ${hardCap}`);

  while (running) {
    const pageResults = await getPage(page);
    addResults(page, pageResults);

    const limitReached = results.length >= hardCap;
    if (limitReached) {
      console.log(`Page ${page}: Reached hard cap limit of ${hardCap} comment(s). Scraping stopped.`);
      running = false;
      break;
    }

    const hasNextPage = await tab.evaluate(checkHasNextPage);
    if (!hasNextPage) {
      console.log(`Page ${page}: Reached last page of comments. Scraping stopped.`);
      running = false;
      break;
    }

    page += 1;
  }

  console.log(`${results.length} comment(s) were extracted from a total of ${page} page(s)`);
  return results;
})
.then(async (results) => {
  const sortedResults = _.orderBy(results, ['timestamp'], ['desc']);
  await buster.setResultObject(sortedResults);
})
.then(() => {
  console.log("Job done!")
  nick.exit()
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`)
  nick.exit(1)
})
