var checkUrl = function(details) {
  var tabId = details.tabId;
  var url = details.url;

  if(url == 'https://www.google.fr/') { // TODO : parse JSON file to see if the actual url needs to be changed
    changeUrl(tabId, url);
  }
}

var tabsCallback = function() {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
    } else {
        // Tab exists
    }
}

var changeUrl = function(tabId, url) {
  var newUrl = 'http://yahoo.com';

  //console.log('url : ' + url);
  //console.log('newUrl : ' + newUrl);

  if(newUrl != url) {
    chrome.tabs.update(tabId, { url: newUrl }, tabsCallback);
  }
};

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  checkUrl(details);
});