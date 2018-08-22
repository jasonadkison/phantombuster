// Phantombuster configuration {

"phantombuster command: nodejs"
"phantombuster package: 5"
"phantombuster flags: save-folder"

const Buster = require("phantombuster")
const buster = new Buster()

const Nick = require("nickjs")
const nick = new Nick({ userAgent: ' ' })

const _ = require("lodash")

// }

nick.newTab().then(async (tab) => {
  const arg = buster.argument;
  const { handle, count, excludePrivateFollowers } = arg;

  await tab.open('https://www.instagram.com/accounts/login/');
  await tab.waitUntilVisible('#react-root form');
  await tab.inject("../injectables/jquery-3.0.0.min.js");

  const login = await tab.evaluate(({ username, password }, done) => {
    if (!username || !password) {
      return done('Missing username or password arguments');
    }

    completeField('input[name="username"]', username);
    completeField('input[name="password"]', password);
    done(null);

    function completeField(selector, value) {
      const field = $(selector);

      if (!field.length) {
        return done(`cannot find find field using ${selector}`);
      }

      const input = field[0];

      // create the fake event
      const event = new Event('input', { bubbles: true });

      // backup original value
      const lastValue = input.value;

      // set the new value
      input.value = value;

      // react15 hack
      event.simulated = true;

      // react16 hack
      if (input._valueTracker) {
        input._valueTracker.setValue(lastValue);
      }

      input.dispatchEvent(event);
    }

  }, arg);

  //await tab.screenshot('./fields_completed.png');
  await tab.click('#react-root form button');
  //await tab.screenshot('./button_clicked.png');


  await tab.waitUntilVisible('#react-root section main section', 5000);
  //await tab.screenshot('./logged_in.png');

  await tab.open(`https://www.instagram.com/${handle}`);
  await tab.untilVisible("#react-root"); // Make sure we have loaded the page
  //await tab.screenshot('./target_acquired.png');

  await tab.inject("../injectables/jquery-3.0.0.min.js"); // We're going to use jQuery to scrape
  await tab.inject("../injectables/lodash-full-4.13.1.min.js"); // We're going to use lodash to extract certain data from graphql structure

  // fetch the account and list of followers
  const data = await tab.evaluate((arg, callback) => {
    // In the current page context

    const { count, excludePrivateFollowers } = arg;

    function md5(n,r,t){function e(n,r){var t=(65535&n)+(65535&r);return(n>>16)+(r>>16)+(t>>16)<<16|65535&t}function o(n,r,t,o,u,c){return e((f=e(e(r,n),e(o,c)))<<(a=u)|f>>>32-a,t);var f,a}function u(n,r,t,e,u,c,f){return o(r&t|~r&e,n,r,u,c,f)}function c(n,r,t,e,u,c,f){return o(r&e|t&~e,n,r,u,c,f)}function f(n,r,t,e,u,c,f){return o(r^t^e,n,r,u,c,f)}function a(n,r,t,e,u,c,f){return o(t^(r|~e),n,r,u,c,f)}function i(n,r){var t,o,i,h,v;n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var g=1732584193,l=-271733879,d=-1732584194,C=271733878;for(t=0;t<n.length;t+=16)o=g,i=l,h=d,v=C,l=a(l=a(l=a(l=a(l=f(l=f(l=f(l=f(l=c(l=c(l=c(l=c(l=u(l=u(l=u(l=u(l,d=u(d,C=u(C,g=u(g,l,d,C,n[t],7,-680876936),l,d,n[t+1],12,-389564586),g,l,n[t+2],17,606105819),C,g,n[t+3],22,-1044525330),d=u(d,C=u(C,g=u(g,l,d,C,n[t+4],7,-176418897),l,d,n[t+5],12,1200080426),g,l,n[t+6],17,-1473231341),C,g,n[t+7],22,-45705983),d=u(d,C=u(C,g=u(g,l,d,C,n[t+8],7,1770035416),l,d,n[t+9],12,-1958414417),g,l,n[t+10],17,-42063),C,g,n[t+11],22,-1990404162),d=u(d,C=u(C,g=u(g,l,d,C,n[t+12],7,1804603682),l,d,n[t+13],12,-40341101),g,l,n[t+14],17,-1502002290),C,g,n[t+15],22,1236535329),d=c(d,C=c(C,g=c(g,l,d,C,n[t+1],5,-165796510),l,d,n[t+6],9,-1069501632),g,l,n[t+11],14,643717713),C,g,n[t],20,-373897302),d=c(d,C=c(C,g=c(g,l,d,C,n[t+5],5,-701558691),l,d,n[t+10],9,38016083),g,l,n[t+15],14,-660478335),C,g,n[t+4],20,-405537848),d=c(d,C=c(C,g=c(g,l,d,C,n[t+9],5,568446438),l,d,n[t+14],9,-1019803690),g,l,n[t+3],14,-187363961),C,g,n[t+8],20,1163531501),d=c(d,C=c(C,g=c(g,l,d,C,n[t+13],5,-1444681467),l,d,n[t+2],9,-51403784),g,l,n[t+7],14,1735328473),C,g,n[t+12],20,-1926607734),d=f(d,C=f(C,g=f(g,l,d,C,n[t+5],4,-378558),l,d,n[t+8],11,-2022574463),g,l,n[t+11],16,1839030562),C,g,n[t+14],23,-35309556),d=f(d,C=f(C,g=f(g,l,d,C,n[t+1],4,-1530992060),l,d,n[t+4],11,1272893353),g,l,n[t+7],16,-155497632),C,g,n[t+10],23,-1094730640),d=f(d,C=f(C,g=f(g,l,d,C,n[t+13],4,681279174),l,d,n[t],11,-358537222),g,l,n[t+3],16,-722521979),C,g,n[t+6],23,76029189),d=f(d,C=f(C,g=f(g,l,d,C,n[t+9],4,-640364487),l,d,n[t+12],11,-421815835),g,l,n[t+15],16,530742520),C,g,n[t+2],23,-995338651),d=a(d,C=a(C,g=a(g,l,d,C,n[t],6,-198630844),l,d,n[t+7],10,1126891415),g,l,n[t+14],15,-1416354905),C,g,n[t+5],21,-57434055),d=a(d,C=a(C,g=a(g,l,d,C,n[t+12],6,1700485571),l,d,n[t+3],10,-1894986606),g,l,n[t+10],15,-1051523),C,g,n[t+1],21,-2054922799),d=a(d,C=a(C,g=a(g,l,d,C,n[t+8],6,1873313359),l,d,n[t+15],10,-30611744),g,l,n[t+6],15,-1560198380),C,g,n[t+13],21,1309151649),d=a(d,C=a(C,g=a(g,l,d,C,n[t+4],6,-145523070),l,d,n[t+11],10,-1120210379),g,l,n[t+2],15,718787259),C,g,n[t+9],21,-343485551),g=e(g,o),l=e(l,i),d=e(d,h),C=e(C,v);return[g,l,d,C]}function h(n){var r,t="",e=32*n.length;for(r=0;r<e;r+=8)t+=String.fromCharCode(n[r>>5]>>>r%32&255);return t}function v(n){var r,t=[];for(t[(n.length>>2)-1]=void 0,r=0;r<t.length;r+=1)t[r]=0;var e=8*n.length;for(r=0;r<e;r+=8)t[r>>5]|=(255&n.charCodeAt(r/8))<<r%32;return t}function g(n){var r,t,e="0123456789abcdef",o="";for(t=0;t<n.length;t+=1)r=n.charCodeAt(t),o+=e.charAt(r>>>4&15)+e.charAt(15&r);return o}function l(n){return unescape(encodeURIComponent(n))}function d(n){return h(i(v(r=l(n)),8*r.length));var r}function C(n,r){return function(n,r){var t,e,o=v(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),t=0;t<16;t+=1)u[t]=909522486^o[t],c[t]=1549556828^o[t];return e=i(u.concat(v(r)),512+8*r.length),h(i(c.concat(e),640))}(l(n),l(r))}return r?t?C(r,n):g(C(r,n)):t?d(n):g(d(n))}
    function getCookie(t){if(!document.cookie)return null;const e=document.cookie.split(";").map(t=>t.trim()).filter(e=>e.startsWith(t+"="));return 0===e.length?null:decodeURIComponent(e[0].split("=")[1])}

    // At the moment, Instagram creates a global js object on media pages called _sharedData which contains the graphql edge data.
    const sharedData = window._sharedData || {};
    const userEdge = _.get(sharedData, 'entry_data.ProfilePage[0].graphql.user', {});

    // We need to set the X-Instagram-GIS header for the AJAX requests, which is the md5 hash of the rhx_gis, csrf token, and query variables.
    // These variables will be used when generating the header value
    const rhxGis = _.get(sharedData, 'rhx_gis', null);
    const csrfToken = getCookie('csrftoken');

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

    // utility function to extract follower edges
    const extractFollowerEdgesFromPage = (pageWithFollowers) => {
      const edges = _.get(pageWithFollowers, 'edge_followed_by.edges', []);
      if (!excludePrivateFollowers) return edges;
      _.remove(edges, (edge) => _.get(edge, 'node.is_private', false));
      return edges;
    };

    // follower edges will be pushed to this array until we're out of results or reach our desired count
    const followerEdges = [];

    // function for accumulating follower edges, abiding by the desired count
    const addFollowerEdges = (edges) => {
      _.forEach(edges, (edge) => {
        if (followerEdges.length >= count) return false;
        followerEdges.push(edge);
      });
    };

    const generateGisHeader = (variables) => md5(`${rhxGis}:${variables}`);//md5(`${rhxGis}:${csrfToken}:${variables}`);

    // function for fetching results
    const fetchFollowers = (endCursor) => {
      let variables = {
        id: account.id,
        include_reel: false,
        first: 24,
      };

      if (endCursor) {
        variables.after = endCursor;
      }

      variables = JSON.stringify(variables);

      const gisHeader = generateGisHeader(variables);

      const res = $.ajax({
        url: `https://www.instagram.com/graphql/query`,
        data: {
          query_hash: '7dd9a7e2160524fd85f50317462cff9f',
          variables,
        },
        async: false,
        headers: {
          'cache-control': 'no-cache',
          'x-instagram-gis': gisHeader,
          'x-requested-with': 'XMLHttpRequest',
        },
        xhrFields: { withCredentials: true },
      });

      let data;

      try {
        data = JSON.parse(res.responseText);
      } catch(e) {
        throw new Error(`json fetch failed with status code ${res.status}`);
      }

      return _.get(data, 'data.user', {});
    };

    // fetch the first page
    const firstPage = fetchFollowers();
    const firstPageFollowerEdges = extractFollowerEdgesFromPage(firstPage);
    addFollowerEdges(firstPageFollowerEdges);

    // If we need more results
    if (count - followerEdges.length > 0) {

      let hasNextPage = _.get(firstPage, 'edge_followed_by.page_info.has_next_page', false);
      let endCursor = _.get(firstPage, 'edge_followed_by.page_info.end_cursor', null);

      // fetch results until we hit our desired total
      while (hasNextPage && count - followerEdges.length > 0) {
        const nextPage = fetchFollowers(endCursor);
        const nextPageFollowerEdges = extractFollowerEdgesFromPage(nextPage);
        addFollowerEdges(nextPageFollowerEdges);
        hasNextPage = _.get(nextPage, 'edge_followed_by.page_info.has_next_page', false);
        endCursor = _.get(nextPage, 'edge_followed_by.page_info.end_cursor', null);
      }

    }

    callback(null, { account, followerEdges });
  }, arg);

  // fetch additional data for each follower
  return await tab.evaluate(({ account, followerEdges }, done) => {
    async function fetchMoreInfo(accountIds) {
      return await Promise.all(accountIds.map(async accountId => await $.getJSON(`https://i.instagram.com/api/v1/users/${accountId}/info/`)));
    }

    try {
      fetchMoreInfo(followerEdges.map(edge => edge['node']['id']))
        .then(extendedFollowerEdges => done(null, { account, followerEdges, extendedFollowerEdges }));
    } catch(err) {
      done(err);
    }
  }, data);

})
.then(async ({ account, followerEdges, extendedFollowerEdges }) => {
  console.log('Performing data mapping...');

  function extractHdAvatar(followerEdge) {
    const small = _.get(followerEdge, 'profile_pic_url', null);
    const primary = _.get(followerEdge, 'hd_profile_pic_url_info.url', null);
    const versions = _.get(followerEdge, 'hd_profile_pic_versions', []);
    const secondary = _.get(_.last(versions), 'url', null);
    
    if (primary) return primary;
    if (secondary) return secondary;
    return small || null;
  }

  const mergedFollowerEdges =  _.merge(_.map(followerEdges, 'node'), _.map(extendedFollowerEdges, 'user'));

  const followers = _.map(mergedFollowerEdges, followerEdge => ({
    id: _.get(followerEdge, 'id', null),
    username: _.get(followerEdge, 'username', null),
    name: _.get(followerEdge, 'full_name', null),
    bio: _.get(followerEdge, 'biography', null),
    avatar: _.get(followerEdge, 'profile_pic_url', null),
    hdAvatar: extractHdAvatar(followerEdge),
    followerCount: _.get(followerEdge, 'follower_count', null),
    followingCount: _.get(followerEdge, 'following_count', null),
    mediaCount: _.get(followerEdge, 'media_count', null),
    isPrivate: _.get(followerEdge, 'is_private', null),
    isVerified: _.get(followerEdge, 'is_verified', null),
    isBusiness: _.get(followerEdge, 'is_business', null),
  }));

  console.log('Data mapping complete!');
  await buster.setResultObject({ account, followers });
})
.then(() => {
  console.log("Job done!");
  nick.exit();
})
.catch((err) => {
  console.log(`Something went wrong: ${err}`);
  nick.exit(1);
});
