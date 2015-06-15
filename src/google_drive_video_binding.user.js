// ==UserScript==
// @name        google drive video binding
// @namespace   wei
// @include     https://tw.movies.yahoo.com/movieinfo_dvd.html/id=*
// @include     http://app.atmovies.com.tw/movie/movie.cfm?*
// @version     1
// @grant       none
// ==/UserScript==

var scripts = {
  'tw.movies.yahoo.com': yahoo,
  'app.atmovies.com.tw': atmovies
};

var host = document.location.host;

(scripts[host] || noop)();

function googleLoginCallback(title, _parent) {
  return function(auth) {if(auth['access_token']) {
    document.getElementById('signinButton').style.display = 'none';
    gapi.client.load('drive', 'v2', function(){
      gapi.client.drive.files.list({q: 'title contains "'+title+'" and mimeType contains "video/"'})
      .execute(addVideos(_parent));
    });
  }}
  
  function addVideos(_parent){
    return function(res){
      var html = '';
      var height = _parent.offsetWidth * 9 / 16;
      res.items.forEach(function(file){
        //var ratio = _parent.offsetWidth / file.videoMediaMetadata.width;
        //var height = file.videoMediaMetadata.height * ratio;
        html += file.title + '<br>'
          + '<iframe src="https://docs.google.com/file/d/'+file.id+'/preview" style="width: 100%; height: '+height+'px"></iframe>';
      });
      _parent.innerHTML += html;
    }
  }
}

function noop(){}

function yahoo(){
  var title = document
    .getElementsByClassName('bulletin')[0]
    .getElementsByTagName('h5')[0]
    .innerHTML;
}

function atmovies(){
  var title = document.getElementsByClassName('at12b_gray')[0].innerHTML;
  unsafeWindow.loginCallback = googleLoginCallback(title, document.getElementById('movie_info01'));
  googleLogin(document.getElementById('logo'));
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
