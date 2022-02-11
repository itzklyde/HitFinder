// eslint-disable-next-line no-unused-vars
let userApiKey;
let ViewHeaders = new Headers([
  [`X-VIEW-KEY`, `UNSET`],
  [`X-APP-KEY`, `MTurk Suite`],
  [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
]);

chrome.storage.local.get([`options`], keys => {
    userApiKey = (keys.options.turkerviewApiKey) ? keys.options.turkerviewApiKey : ``;
    buildHeaders(userApiKey);
});

function buildHeaders(userApiKey){
    ViewHeaders = new Headers([
        [`X-VIEW-KEY`, userApiKey],
        [`X-APP-KEY`, `MTurk Suite`],
        [`X-APP-VER`, chrome.runtime.getManifest().version] //SemVer
    ]);
}


chrome.storage.onChanged.addListener(function(changes, namespace){
  chrome.storage.local.get([`options`], keys => {
      userApiKey = (keys.options.turkerviewApiKey) ? keys.options.turkerviewApiKey : ``;
      buildHeaders(userApiKey);
  });
})

function FetchTVWithTimeout(input, init, timeout){
    return Promise.race([
        fetch(input, init),
        new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error(`Fetch timeout.`)), timeout)
        )
      ]);
}

// I don't believe this is used anywhere, the function that wraps this is never invoked.
function getTVReviews(url){
    console.log('tvnotimmeout');
    return new Promise(async (resolve) => {
        try {
          const response = await window.fetch(url, {headers: ViewHeaders})

          if (response.status === 200) {
            const json = await response.json()
            resolve([stringSite, json.data.requesters ? Object.assign(...json.data.map((item) => ({
              [item.id]: item.attributes.aggregates
            }))) : json.requesters])
          } else {
            resolve()
          }
        } catch (error) {
          resolve()
        }
      })
}
