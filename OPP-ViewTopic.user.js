// ==UserScript==
// @name         OPP-ViewTopic
// @namespace    us.deans.greasemonkey
// @version      0.1
// @description  script to prepare entire topic for export to file.
// @author       Nigel Deans
// @match        http://www.onepoliticalplaza.com/t-*
// @grant        none
// ==/UserScript==

var base_url = "http://www.onepoliticalplaza.com/t-";
var topic_state = 0;       // 1 = load-only, 2 = extract page, 3 = extract page
var topic_title;

var topic_number = 0;      // returned from GetTopicAndPage()
var current_page = 0;      // returend from GetTopicAndPage()

var topic_pages = 0;
var post_count = 0;
var last_page = 0;

var page_data = [];        // returned from processPage() - contains topic_data and updated post_data
var post_data = [];        // initialized by controller
var windowName;            // initialized by controller

console.log("OPP-TopicViewer initialized.");

// google tag service (ads)
window.addEventListener('beforescriptexecute', function(e) {

	src = e.target.src;
    console.log("...beforescriptexecute");
	// for external scripts
	src = e.target.src;
	if (src.search(/pagead2/) != -1 || src.search(/googletagservice/) != -1) {
		console.log("...intercepting external script, 'googletagservice'...");
		e.preventDefault();
		e.stopPropagation();
		changed++;
	}

	// for inline scripts
	if (e.target===document.getElementByTagName("script") [0]) {
		console.log("...intercepting internal script.");changed++;
		e.StopPropagation();
		e.preventDefault();
	}

}, true);

document.addEventListener('DOMContentLoaded', function() {

   console.log(">> EVENT : DOMContentLoaded : calling ctrl(1)");
   ctrl(1);

});

document.addEventListener('keydown', function(event) {

    if (event.keyCode == 113) {
       console.log(">> EVENT : keyCode-113 (F2) : single page extraction requested.");
       ctrl(2);  // start single page extraction (test)
    }

    if (event.keyCode == 115) {
       console.log(">> EVENT : keyCode-115 (F4) : multipage extraction requested.");
       ctrl(3); // start multipage extraction
    }

    if (event.keyCode == 117) {
       console.log(">> EVENT : keyCode-117 (F6) : save data to file.");
       save_to_file();
    }

});

/*

0 ...
1 ...
2 ...
3 ...

*/

function ctrl(opt) {

	// bounce all calls not initiated by document event listener
	if (opt < 1) {
		if (document.readyState == "interactive") {
			console.log("ctrl(opt=" + opt + ") : document loaded : readystate = '" + document.readyState + "'");
			opt = 1;
		}
		else {
			console.log("ctrl(opt=" + opt + ") : document not ready... (readystate = '" + document.readyState + "').");
			return;
		}
	}

	// bounce all calls where session variable is not initialized. (no extraction requested)
	if (opt == 1) {

		if (window.name.length > 5) {
			console.log("ctrl(opt=" + opt + ") : #002: extraction in progress.");
			opt = 2; console.log("ctrl(opt=" + opt + ") : option changed");
		}
		else {
			console.log("ctrl(opt=" + opt + ") : #001: bypassing extraction.");
			return 0;
		}

	}

	// extract
	if (opt > 1) {

		console.log("ctrl(opt=" + opt + ") : #002: extraction requested.");

		if (opt == 3 && current_page > 1) {
			console.log("ctrl(opt=" + opt + ") : navigate to the first page to start extraction.");
			return 0;
		}

		getTopicAndPage(window.location.href);
		console.log("ctrl(opt=" + opt + ") : getTopicAndPage() : topic = " + topic_number + ". page = " + current_page);


		if (opt == 2 ) {
			window.name = null;                        // initialize session variable
			console.log("ctrl(opt=" + opt + ") : session variable initiated on page " + current_page + ", size = " + page_data.length);
			post_data = [];
			console.log("ctrl(opt=" + opt + ") : starting post_data length = " + post_data.length);
		}

//			page_data = JSON.parse(window.name);       // gwt existing session variable
//			console.log("ctrl(opt=" + opt + ") : accumulated page_data copied from session variable " + (current_page - 1) + ". size = " + page_data.length);
//			post_data = page_data[1];
//			console.log("ctrl(opt=" + opt + ") : incomming post_data length = " + post_data.length);

		// topic title, topic pages and post data from document
		page_data = processPage(document, post_data);
		topic_data = page_data[0];
		topic_title = topic_data[0];
		topic_pages = parseInt(topic_data[1],10);
		topic_status = 1;
		post_data = page_data[1];
		post_count = post_data.length;

		console.log("ctrl(opt=" + opt + ") : post_count = " + post_count);

		if (post_count > 15) {
			opt = 3;                                 // post_count > 15 means more than one page - so it's multi-page (option 3)
		}
		if (opt ) {
			console.log("");
			return 1;
		}
	}

	// multi-page extract
	if (opt > 2) {
		console.log("ctrl(opt=" + opt + ") : #003: multipage extraction requested.");
	}
}

function getTopicAndPage(url) {

  var idx1 = url.indexOf("/t-") + 3;
  var str1 = url.substring(idx1);

  var idx2 = str1.indexOf("-");
  var idx3 = str1.indexOf(".html");

  topic_number = str1.substring(0, idx2);
  current_page = parseInt(str1.substring(idx2+1,idx3), 10);
  // current_page = str1.substring(idx2+1,idx3);

}

function extractPost() {

}

function processPage(doc, post_data) {

	// var html_body;
	var div_main;
	var div_title;
    var div_pages;

	var page_count = 0;
	var post_count = 0;
	var ad_count = 0;

	var post_date;
	var post_link;
	var post_auth;
	var post_text;

	var post_collection;
	var topic_data = [];                                                  // title and total pages (taken from page)

	post_count = post_data.length;	                                         console.log("processPage() : post_data.length (starting) = " + post_count);

	// get the page headline "title"
	div_title = doc.getElementsByClassName('pageheadline')[0].innerHTML;     console.log("processPage() : test 003 : div_title: " + div_title);

    // get number of pages ( use the page navigation links on the first page)
	//maybe here is where I should use a collection from a CSS selection like "boxlook" and use the LAST index.
	div_UI = doc.body.children[2].getElementsByClassName('boxlook');
	div_pages = div_UI[div_UI.length-1];

	// div_pages = doc.body.children[2].children[6];                            // console.log("processPage() : number of children under div_pages: " + div_pages.children.length);
	var pos = div_pages.children.length - 2;                                 // console.log("processPage() : last page is on the " + pos + "th link");
    var last_page = div_pages.children[pos].innerHTML;                       console.log("processPage() : this topic is " + last_page + " pages long");
	page_count = parseInt(last_page, 10);                                    console.log("processPage() : this topic is " + page_count + " pages long");


	post_collection = doc.body.children[2].getElementsByClassName('contentlook');
	console.log("processPage() : number of posts on this page : " + post_collection.length);

	for (var i=0; i < post_collection.length-1; i++ ) {

		post_text = ""; post_count++;
		console.log(".......................................................... >");

		var post = post_collection[i];                                         console.log("post : " + post_count + ", loop : " + i);
		var div_collection = post.getElementsByTagName('div');
		var span_collection = post.getElementsByTagName('span');               console.log("div collection: " + div_collection.length + ", span collection: " + span_collection.length);


		var userlink = span_collection[0].innerHTML;                           console.log("userlink: " + userlink);
		var user = span_collection[0].children[0].innerHTML;                   console.log("user: " + user);
		var usercrap = div_collection[2].innerHTML;                            console.log("usercrap: " + usercrap);

		var objPost = {"post_id": post_count, "user": user, "comment": usercrap};
		var jsnPost = JSON.stringify(objPost);

	}

	// number of pages from page header
	var last_nav = div_pages.textContent;
	// console.log("processPage() : last nav links = " + last_nav);

	return [topic_data, post_data];                                        // return page_data
}

function save_to_file(post_data) {
	console.log("save_to_file() : function check...");

	let req = new XMLHttpRequest();
	let url = 'http://ozone:1880/hello-form';

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/json");
	req.send(post_data);
	return;
}

console.log("OPP-TopicViewer finished.");