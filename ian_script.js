// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-08-17
// @description  try to take over the world!
// @author       You
// @match        https://www.onepoliticalplaza.com/t-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onepoliticalplaza.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const post_data = document.getElementsByClassName("contentlook");
  const posts = Array.from(post_data);

  const savedPostData = getSavedPostData();

  posts.forEach((post) => {
    const post_header = post.previousElementSibling;

    const postData = {
      authorName: "",
      timestamp: "",
      link: "",
      contentHTML: "",
    };

    if (post.querySelector("form")) {
      return;
    }

    postData.timestamp = post_header.querySelector("span").innerHTML;
    postData.link = post_header.querySelector("a").href;

    postData.authorName = post.querySelector("div span a").text;
    postData.contentHTML = post.querySelector("div:last-of-type").outerHTML;
    savedPostData.push(postData);
  });

  console.log(savedPostData);

  storeSavedPostData( savedPostData )


  function getSavedPostData() {
    let savedPostData = localStorage.getItem('savedPostData');
    if ( !savedPostData ) {
      return [];
    }

    return JSON.parse(savedPostData);
  }

  function storeSavedPostData( savedPostData ) {
    const stringedData = JSON.stringify( savedPostData );
    localStorage.setItem( 'savedPostData', stringedData );
  }

  function clearSavedPostData() {
    localStorage.removeItem('savedPostData');
  }

  document.addEventListener('keydown', event => {
    console.log(event);
      if (event.key === '3' && event.altKey) {
          clearSavedPostData();
      }
  })
})();
