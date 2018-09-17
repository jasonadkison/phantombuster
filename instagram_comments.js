// Phantombuster configuration {

  "phantombuster command: nodejs"
  "phantombuster package: 5"
  "phantombuster flags: save-folder"
  "phantombuster dependencies: lib-Mattr-Helper.js"

  const Buster = require("phantombuster")
  const buster = new Buster()

  const Nick = require("nickjs")
  const nick = new Nick()

  const _ = require("lodash")

  const MattrHelper = require('./lib-Mattr-Helper');

  // }

  nick.newTab().then(async (tab) => {
    const mattrHelper = new MattrHelper(buster, nick, tab);

    const arg = buster.argument;
    const { id } = arg;
    await mattrHelper.openTab(`https://www.instagram.com/p/${id}`);
    await tab.untilVisible("#react-root");
    await tab.inject("../injectables/jquery-3.0.0.min.js");
    await tab.inject("../injectables/lodash-full-4.13.1.min.js");

    return await tab.evaluate((arg, callback) => {
      function md5(n,r,t){function e(n,r){var t=(65535&n)+(65535&r);return(n>>16)+(r>>16)+(t>>16)<<16|65535&t}function o(n,r,t,o,u,c){return e((f=e(e(r,n),e(o,c)))<<(a=u)|f>>>32-a,t);var f,a}function u(n,r,t,e,u,c,f){return o(r&t|~r&e,n,r,u,c,f)}function c(n,r,t,e,u,c,f){return o(r&e|t&~e,n,r,u,c,f)}function f(n,r,t,e,u,c,f){return o(r^t^e,n,r,u,c,f)}function a(n,r,t,e,u,c,f){return o(t^(r|~e),n,r,u,c,f)}function i(n,r){var t,o,i,h,v;n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var g=1732584193,l=-271733879,d=-1732584194,C=271733878;for(t=0;t<n.length;t+=16)o=g,i=l,h=d,v=C,l=a(l=a(l=a(l=a(l=f(l=f(l=f(l=f(l=c(l=c(l=c(l=c(l=u(l=u(l=u(l=u(l,d=u(d,C=u(C,g=u(g,l,d,C,n[t],7,-680876936),l,d,n[t+1],12,-389564586),g,l,n[t+2],17,606105819),C,g,n[t+3],22,-1044525330),d=u(d,C=u(C,g=u(g,l,d,C,n[t+4],7,-176418897),l,d,n[t+5],12,1200080426),g,l,n[t+6],17,-1473231341),C,g,n[t+7],22,-45705983),d=u(d,C=u(C,g=u(g,l,d,C,n[t+8],7,1770035416),l,d,n[t+9],12,-1958414417),g,l,n[t+10],17,-42063),C,g,n[t+11],22,-1990404162),d=u(d,C=u(C,g=u(g,l,d,C,n[t+12],7,1804603682),l,d,n[t+13],12,-40341101),g,l,n[t+14],17,-1502002290),C,g,n[t+15],22,1236535329),d=c(d,C=c(C,g=c(g,l,d,C,n[t+1],5,-165796510),l,d,n[t+6],9,-1069501632),g,l,n[t+11],14,643717713),C,g,n[t],20,-373897302),d=c(d,C=c(C,g=c(g,l,d,C,n[t+5],5,-701558691),l,d,n[t+10],9,38016083),g,l,n[t+15],14,-660478335),C,g,n[t+4],20,-405537848),d=c(d,C=c(C,g=c(g,l,d,C,n[t+9],5,568446438),l,d,n[t+14],9,-1019803690),g,l,n[t+3],14,-187363961),C,g,n[t+8],20,1163531501),d=c(d,C=c(C,g=c(g,l,d,C,n[t+13],5,-1444681467),l,d,n[t+2],9,-51403784),g,l,n[t+7],14,1735328473),C,g,n[t+12],20,-1926607734),d=f(d,C=f(C,g=f(g,l,d,C,n[t+5],4,-378558),l,d,n[t+8],11,-2022574463),g,l,n[t+11],16,1839030562),C,g,n[t+14],23,-35309556),d=f(d,C=f(C,g=f(g,l,d,C,n[t+1],4,-1530992060),l,d,n[t+4],11,1272893353),g,l,n[t+7],16,-155497632),C,g,n[t+10],23,-1094730640),d=f(d,C=f(C,g=f(g,l,d,C,n[t+13],4,681279174),l,d,n[t],11,-358537222),g,l,n[t+3],16,-722521979),C,g,n[t+6],23,76029189),d=f(d,C=f(C,g=f(g,l,d,C,n[t+9],4,-640364487),l,d,n[t+12],11,-421815835),g,l,n[t+15],16,530742520),C,g,n[t+2],23,-995338651),d=a(d,C=a(C,g=a(g,l,d,C,n[t],6,-198630844),l,d,n[t+7],10,1126891415),g,l,n[t+14],15,-1416354905),C,g,n[t+5],21,-57434055),d=a(d,C=a(C,g=a(g,l,d,C,n[t+12],6,1700485571),l,d,n[t+3],10,-1894986606),g,l,n[t+10],15,-1051523),C,g,n[t+1],21,-2054922799),d=a(d,C=a(C,g=a(g,l,d,C,n[t+8],6,1873313359),l,d,n[t+15],10,-30611744),g,l,n[t+6],15,-1560198380),C,g,n[t+13],21,1309151649),d=a(d,C=a(C,g=a(g,l,d,C,n[t+4],6,-145523070),l,d,n[t+11],10,-1120210379),g,l,n[t+2],15,718787259),C,g,n[t+9],21,-343485551),g=e(g,o),l=e(l,i),d=e(d,h),C=e(C,v);return[g,l,d,C]}function h(n){var r,t="",e=32*n.length;for(r=0;r<e;r+=8)t+=String.fromCharCode(n[r>>5]>>>r%32&255);return t}function v(n){var r,t=[];for(t[(n.length>>2)-1]=void 0,r=0;r<t.length;r+=1)t[r]=0;var e=8*n.length;for(r=0;r<e;r+=8)t[r>>5]|=(255&n.charCodeAt(r/8))<<r%32;return t}function g(n){var r,t,e="0123456789abcdef",o="";for(t=0;t<n.length;t+=1)r=n.charCodeAt(t),o+=e.charAt(r>>>4&15)+e.charAt(15&r);return o}function l(n){return unescape(encodeURIComponent(n))}function d(n){return h(i(v(r=l(n)),8*r.length));var r}function C(n,r){return function(n,r){var t,e,o=v(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),t=0;t<16;t+=1)u[t]=909522486^o[t],c[t]=1549556828^o[t];return e=i(u.concat(v(r)),512+8*r.length),h(i(c.concat(e),640))}(l(n),l(r))}return r?t?C(r,n):g(C(r,n)):t?d(n):g(d(n))}
      function getCookie(t){if(!document.cookie)return null;const e=document.cookie.split(";").map(t=>t.trim()).filter(e=>e.startsWith(t+"="));return 0===e.length?null:decodeURIComponent(e[0].split("=")[1])}

      const sharedData = window._sharedData || {};
      const payload = _.get(sharedData, 'entry_data.PostPage[0].graphql');
      const shortcode = _.get(payload, 'shortcode_media.shortcode', null);
      const pageInfo = extractPageInfo(payload);
      const rhxGis = _.get(sharedData, 'rhx_gis', null);
      const csrfToken = getCookie('csrftoken');

      function extractCommentEdges(data) {
        return _.get(data, 'shortcode_media.edge_media_to_comment.edges', [])
      }

      function extractPageInfo(data) {
        return _.get(data, 'shortcode_media.edge_media_to_comment.page_info', {})
      }

      const results = [];
      _.forEach(extractCommentEdges(payload), function(commentEdge) {
        results.push(commentEdge);
      });

      const generateGisHeader = (variables) => md5(`${rhxGis}:${variables}`);//md5(`${rhxGis}:${csrfToken}:${variables}`);

      // function for fetching the next page of results
      // https://www.instagram.com/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables={"shortcode":"Bf-I2P6grhd","first":20,"after":"XXXXXXXX"}
      const fetchNextPage = (endCursor) => {
        const variables = JSON.stringify({
          shortcode: shortcode,
          first: 1000,
          after: endCursor
        });
        const gisHeader = generateGisHeader(variables);

        const res = $.ajax({
          url: `https://www.instagram.com/graphql/query`,
          data: {
            query_hash: 'f0986789a5c5d17c2400faebf16efd0d',
            variables,
          },
          async: false,
          headers: {
            'x-instagram-gis': gisHeader,
            //'x-requested-with': 'XMLHttpRequest',
          },
          xhrFields: { withCredentials: true },
        });

        let data;

        try {
          data = JSON.parse(res.responseText);
        } catch(e) {
          throw new Error(`json fetch failed with status code ${res.status}`);
        }

        return _.get(data, 'data', {});
      };

      let hasNextPage = _.get(pageInfo, 'has_next_page', false);
      let endCursor = _.get(pageInfo, 'end_cursor', null);

      // If we have more results
      if (hasNextPage) {

        // fetch all results
        while (hasNextPage) {
          const nextPage = fetchNextPage(endCursor);
          const nextPageCommentEdges = extractCommentEdges(nextPage);
          const nextPageInfo = extractPageInfo(nextPage);

          _.forEach(nextPageCommentEdges, function(commentEdge) {
            results.push(commentEdge);
          });

          hasNextPage = _.get(nextPageInfo, 'has_next_page', false);
          endCursor = _.get(nextPageInfo, 'end_cursor', null);
        }

      }

      callback(null, results);
    });
  })
  .then((commentEdges) => {
    console.log('Performing data mapping...');

    // extract basic fields and sort results
    const comments = _(_.map(commentEdges, 'node'))
                   .map(item => _.pick(item, ['id', 'text', 'created_at', 'owner']))
                   .sortBy(['created_at'])
                   .reverse()
                   .value();

    // normalize flat objects
    const results = _.map(comments, comment => ({
      id: _.get(comment, 'id', null),
      createdAt: _.get(comment, 'created_at', null),
      text: _.get(comment, 'text', null),
      userId: _.get(comment, 'owner.id', null),
      userAvatar: _.get(comment, 'owner.profile_pic_url', null),
      username: _.get(comment, 'owner.username', null),
    }));

    console.log('Data mapping complete!');
    return results;
  })
  .then(async (data) => {
    console.log('Saving data to file');
    const arg = buster.argument;
    const { id } = arg;
    const text = JSON.stringify(data);
    const path = `comments/${id}.json`;
    const mime = 'application/json';
    const url = await buster.saveText(text, path, mime);
    const agentObject = await buster.getAgentObject();

    const result = {
      mediaShortcode: id,
      commentsUrl: url,
      commentsSize: data.length,
      agentId: buster.agentId,
      containerId: buster.containerId,
    };
    return result;
  })
  .then(async (result) => {
    console.log('Setting result object', result);
    /*{
    "url": "https://phantombuster.s3.amazonaws.com/Br7nF5sLuTc/c8wATtZQxsP1mE3zLvdfSQ/comments/Bl6h-pRB1MX.json",
    "id": "Bl6h-pRB1MX",
    "size": 159
    }*/
    await buster.setResultObject(result);
  })
  .then(() => {
    console.log("Job done!");
    nick.exit();
  })
  .catch((err) => {
    console.log(`Something went wrong: ${err}`);
    nick.exit(1);
  });
