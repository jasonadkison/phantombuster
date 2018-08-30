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
  if (!buster.argument.url) {
    throw new Error('Missing url argument to agent');
  }

  await tab.open(buster.argument.url);
  await tab.untilVisible('div[role="main"]'); // Make sure we have loaded the right page
  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape

  const scrapePage = (arg, done) => {
    try {
      const results = [];
      const items = $('.replies-to li.stream-item:not(.tracked)'); // select the items, excluding previously tracked
      const minPosition = $('.stream-container[data-min-position]').attr('data-min-position');

      if (items.length) {

        // add a css class to track which items we've already processed
        items.addClass('tracked');

        // visibly fade the items for easier debugging via screenshots
        items.css('opacity', 0.25);

        items.each((i, el) => {
          const item = $(el);
          const id = item.data('itemId');

          const data = {
            id,
            text: item.find('.tweet-text').clone().children('.u-hidden').remove().end().text(),
            username: item.find('.account-group .username').text().replace('@', ''),
            userId: item.find('.account-group').data('userId'),
            createdAt: item.find('.time [data-time]').data('time'),
          };

          if (data.text) {
            results.push(data);
          }
        });

      }

      done(null, { results, minPosition });
    } catch(e) {
      done('Something went wrong while scraping the page');
    }
  };

  const triggerNextPage = (arg, done) => {
    try {
      const nextLink = $('.ThreadedConversation-showMoreThreadsButton');
      if (nextLink.length) {
        nextLink.click();
        done(null);
      } else {
        // Trigger the next page by scrolling to the bottom.
        // Here we are jumping back to the top first because sometimes doing a direct jump to
        // the bottom is not triggering twitters javascript to fetch the next page.
        const targetHeight = $('div[role="main"]').height();
        setTimeout(() => {
          $('#permalink-overlay')[0].scrollTo(0, 1);
        }, 0);
        setTimeout(() => {
          $('#permalink-overlay')[0].scrollTo(0, targetHeight);
        }, 100);
        setTimeout(() => {
          done(null);
        }, 200);
      }
    } catch(e) {
      done('Something went triggering the next page');
    }
  };

  const checkForHasMoreLink = (arg, done) => {
    const hasNextPage = $('div.timeline-end.has-items.has-more-items').length > 0;
    done(null, hasNextPage);
  }

  const tracked = {};
  const data = [];

  const addResult = (result) => {
    if (tracked[result.id]) return false;
    tracked[result.id] = true;
    data.push(result);
  };

  const addResults = results => results.forEach(result => addResult(result));

  let page = 1;
  let checkNextPage = true;
  let scrapeResult;

  while (checkNextPage) {
    console.log('Scraping page', page);

    scrapeResult = await tab.evaluate(scrapePage);
    console.log('Scraped page', page);

    if (!scrapeResult.results.length) {
      console.log('No replies found on page', page);
      checkNextPage = false;
      break;
    }

    addResults(scrapeResult.results);
    console.log('Preserving', scrapeResult.results.length, 'results from page', page, 'with minPosition', scrapeResult.minPosition);

    //await tab.screenshot(`${page}-page-before-triggered.jpg`);
    await tab.evaluate(triggerNextPage);
    console.log('Next page triggered from page', page);
    //await tab.screenshot(`${page}-page-after-triggered.jpg`);

    if (scrapeResult.minPosition) {
      await tab.waitWhileVisible(`.stream-container[data-min-position="${scrapeResult.minPosition}"]`);
    } else {
      checkNextPage = await tab.evaluate(checkForHasMoreLink);
    }

    page++;
  }

  console.log('Scraping finished with', data.length, 'result(s)');
  const sortedData = data.sort((a, b) => b.createdAt > a.createdAt);
  await buster.setResultObject(sortedData);
})
.then(() => {
  console.log("Job done!")
  nick.exit()
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`)
  nick.exit(1)
})
