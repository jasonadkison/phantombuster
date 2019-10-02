// Phantombuster configuration {

  "phantombuster command: nodejs"
  "phantombuster package: 5"
  "phantombuster flags: save-folder"
  "phantombuster dependencies: lib-Mattr-Helper.js"

  const Buster = require("phantombuster");
  const buster = new Buster();

  const Nick = require("nickjs");
  const nick = new Nick();

  const _ = require("lodash");

  const MattrHelper = require("./lib-Mattr-Helper");

  // }

  nick.newTab().then(async (tab) => {
    const mattrHelper = new MattrHelper(buster, nick, tab);

    const { url, limit } = buster.argument;
    const hardCap = limit ? limit : 1000;

    //const url = "https://www.facebook.com/DonaldTrump/posts/10161487534090725";
    //const url = "https://www.facebook.com/DonaldTrump/videos/vb.153080620724/10159664271045725/?type=2&theater";
    //const url = "https://www.facebook.com/DonaldTrump/photos/a.10156483516640725/10161489089290725/?type=3&permPage=1"

    await mattrHelper.openTab(url);
    await tab.untilVisible('.userContentWrapper'); // Make sure we have loaded the right page
    await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape

    const triggerComments = (arg, done) => {
      const wrapper = $('.userContentWrapper:first');
      if (!wrapper.length) return done('Could not find the wrapper element');

      const summary = $('[data-testid="fbFeedStoryUFI/feedbackSummary"]:first', wrapper);
      if (!summary.length) return done('Could not find the summary element');

      const commentsLink = $('[data-testid="UFI2CommentsCount/root"]:first', summary);
      if (!commentsLink.length) return done('Could not find the commentsLink element');

      const pagerLink = $('[data-testid="UFI2CommentsPagerRenderer/pager_depth_0"]:first', wrapper);
      const event = new Event('click', { bubbles: true });
      event.simulated = true;

      if (pagerLink.length) {
        // click the "more comments" link to expand comments
        pagerLink[0].dispatchEvent(event);
      } else {
        // click the "N Comments" link to expand comments
        commentsLink[0].dispatchEvent(event);
      }

      done(null);
    };

    const triggerSorting = (arg, done) => {
      const wrapper = $('.userContentWrapper:first');
      const dropdownButton = $('a[data-testid="UFI2ViewOptionsSelector/link"]:first', wrapper);
      if (!dropdownButton.length) return done(null);

      const event = new Event('click', { bubbles: true });
      event.simulated = true;
      dropdownButton[0].dispatchEvent(event);

      setTimeout(() => {
        const sortLink = $('[data-testid="UFI2ViewOptionsSelector/menuOption"]:contains(All Comments)');
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
      const wrapper = $('.userContentWrapper:first');
      if (!wrapper.length) return done('Could not find wrapper element');

      const comments = $('[data-testid="UFI2Comment/root_depth_0"]:not(.tracked)', wrapper).addClass('tracked').css('opacity', 0.5);
      const results = [];

      comments.each((i, el) => {
        const comment = $(el);

        const body = $('[data-testid="UFI2Comment/body"]', comment);
        if (!body.length) return done('Could not find the body element');

        const timestampLink = $('[data-testid="UFI2CommentActionLinks/root"]:first a:has(abbr[data-utime]):first', comment);
        if (!timestampLink.length) return done('Could not find the timestampLink element');

        const authorEl = $('div:last > span:first, a[data-hovercard]:first', body).first();
        if (!authorEl.length) return done('Could not find the author element');

        const result = {
          id: (() => {
            const href = timestampLink.attr('href');
            const matches = /((&|\?)comment_id=(\d*)\d*)/gi.exec(href || '');
            return matches ? matches[matches.length - 1] : undefined;
          })(),
          timestamp: $('abbr[data-utime]:first', timestampLink).data('utime'),
          authorName: authorEl.text(),
          body: $('div:last > span:last', body).text().trim(),
        };

        if (!result.id) return done('Could not determine comment id');

        results.push(result);
      });

      done(null, results);
    };

    const checkHasNextPage = (arg, done) => {
      const wrapper = $('.userContentWrapper:first');
      const pagerLink = $('[data-testid="UFI2CommentsPagerRenderer/pager_depth_0"]:first', wrapper);
      done(null, pagerLink.length > 0);
    };

    const sortComments = async () => {
      return await tab.evaluate(triggerSorting);
    };

    const initPage = async (pageNum) => {
      //await tab.screenshot(`page-${pageNum}-before-triggerComments.jpg`);
      await tab.evaluate(triggerComments);
      await tab.waitWhileVisible('[aria-busy="true"][role="progressbar"]');
      if (pageNum === 1) {
        await sortComments();
        await tab.waitWhileVisible('[aria-busy="true"][role="progressbar"]');
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
