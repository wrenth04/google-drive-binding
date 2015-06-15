// ==UserScript==
// @name        google drive video binding
// @namespace   wei
// @include     https://tw.movies.yahoo.com/movieinfo_dvd.html/id=*
// @include     http://*.atmovies.com.tw/movie/*
// @include     http://www.imdb.com/title/*
// @version     1
// @grant       none
// ==/UserScript==

var scripts = {
  'tw.movies.yahoo.com': yahoo,
  'www.atmovies.com.tw': atmovies,
  'app.atmovies.com.tw': atmovies,
  'www.imdb.com': imdb
};

var host = document.location.host;

(scripts[host] || noop)();

function googleLoginCallback(titles, _parent) {
  if(typeof titles === 'string') titles = [titles];
  return function(auth) {if(auth['access_token']) {
    var query = titles.map(function(title) {
      return 'title contains "'+title+'"';
    }).join(' or ');
    document.getElementById('signinButton').style.display = 'none';
    gapi.client.load('drive', 'v2', function() {
      gapi.client.drive.files.list({q: '('+query+') and mimeType contains "video/"'})
      .execute(addVideos(_parent));
    });
  }}
  
  function addVideos(_parent) {
    return function(res) {
      var height = _parent.offsetWidth * 9 / 16;
      _parent.innerHTML += res.items.map(function(video) {
        return [
          video.title,
          '<iframe src="https://docs.google.com/file/d/'+video.id+'/preview" style="width: 100%; height: '+height+'px"></iframe>'
        ].join('<br>');
      }).join('');
    }
  }
}

function noop() {}

function yahoo() {
  var title = document
    .getElementsByClassName('bulletin')[0]
    .getElementsByTagName('h5')[0]
    .innerHTML;
}

function atmovies() {
  var title = document.querySelector('.at12b_gray').innerHTML;
  var title2 = document.querySelector('.at21b').innerHTML.replace(/<[^>]*>/g, '').replace(/[\t\r\n ]/g, '');
  unsafeWindow.loginCallback = googleLoginCallback([title, title2], document.querySelector('#movie_info01'));
  googleLogin(document.querySelector('#logo'));
}

function imdb() {
  var title = document.querySelector('#overview-top .itemprop').innerHTML;
  unsafeWindow.loginCallback = googleLoginCallback(title, document.querySelector('#title-overview-widget'));
  var _login = document.createElement('li');
  document.querySelector('#consumer_main_nav').appendChild(_login);
  googleLogin(_login);
}

function googleLogin(_parent) {
  _parent.innerHTML +=
    '<span id="signinButton">'
    +'  <span'
    +'    class="g-signin"'
    +'    data-callback="loginCallback"'
    +'    data-clientid="199356316902-jor53ru2cn6p7stgmf1du7s2dgfdvm5k.apps.googleusercontent.com"'
    +'    data-cookiepolicy="single_host_origin"'
    +'    data-scope="https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/drive">'
    +' </span>'
    +'</span>';
  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
  po.src = 'https://apis.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
}

