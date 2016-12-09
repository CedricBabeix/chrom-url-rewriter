var data = {};
var dataFile = "http://localhost/webextension-dom-url-rewriter/extension/data.json";
var lastDataCheck = 0;
var timeStep = 60 * 60 * 1000; // Time in milliseconds

var getData = function() {

  var time = new Date().valueOf();

  if(time >= lastDataCheck + timeStep) {

    lastDataCheck = time;

    var xhr = new XMLHttpRequest();
    try {
      // Opera 8.0+, Firefox, Chrome, Safari
      xhr = new XMLHttpRequest();
    } catch(e) {
      return false;
    }

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        data = JSON.parse(xhr.responseText);
      }
    }

    xhr.open("GET", dataFile, true);
    xhr.send();
  }
}

var getWebsite = function(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);

  if(match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    var hostname = match[2];
    var parts = hostname.split('.');
    var website = parts[parts.length - 2];

    return website;
  } else {
    return null;
  }
}

var transformPage = function(website) {

  var objects = data[website];
  var keywordsString = 'var keywords = [';
  var urlString = 'var urls = [';
  for(var i = 0; i < objects.length; i++) {
    keywordsString += '"' + objects[i]['keyword'] + '"';
    urlString += '"' + objects[i]['url'] + '"';
    if(i != objects.length -1) {
      keywordsString += ', ';
      urlString += ', ';
    }
  }
  keywordsString += '];';
  urlString += '];';

  var codeString = 'var anchors = document.getElementsByTagName("a");';
  codeString += keywordsString;
  codeString += urlString;
  codeString += 'for(i = 0; i < anchors.length; i++) {';
  codeString += ' for(j = 0; j < keywords.length; j++) {';
  codeString += '   if(anchors[i].href.indexOf(keywords[j]) !== -1) {';
  codeString += '     anchors[i].href = urls[j];';
  codeString += '   }';
  codeString += ' };';
  codeString += '};';

  chrome.tabs.executeScript({
    code: codeString
  });

}

var checkPage = function(details) {
  var url = details.url;
  var website = getWebsite(url);

  for(var dataWebsite in data) {
    if(dataWebsite == website) {
      transformPage(website);
    }
  }
}

chrome.webNavigation.onCompleted.addListener(function(details) {
  getData();
  checkPage(details);
});