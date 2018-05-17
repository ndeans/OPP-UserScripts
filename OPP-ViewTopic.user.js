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

// extracted from url
var urlData;
var topic_number = 0;
var current_page = 0;

var topic_pages = 0;       // updated by processPage() on first page
var page_count = 0;        // redundant?
//var last_page = 0;         // redundant?

var post_data = [];        // initialized by controller
//var topic_data = [];       // initialized by controller
var page_data = [];        // returned from processPage() - contains topic_data and updated post_data
//var sess_data = [];

var topic_data;

//var winName = "opptopicviewer";
//var w_report;
var report_name = "Topic Viewer";

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
       console.log(">> EVENT : keyCode-113 (F2) : requesting extraction. calling ctrl(2)");
       ctrl(2);  // start extraction (test)
    }

    if (event.keyCode == 117) {
       console.log(">> EVENT : keyCode-117 (F6) : save data to file.");
       save_to_file();
    }

});



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
		if (sessionStorage.getItem("topic-data")) {
			console.log("ctrl(opt=" + opt + ") : #002: extraction in progress. calling ctrl(3)");
			document.body.style.backgroundColor = "#e6f2f3";
			opt = 3;
		}
		else {
			console.log("ctrl(opt=" + opt + ") : #000: bypassing extraction.");
			return 0;
        }
	}

	// initialize
	if (opt > 1) {
		// get topic data from URL: Need it for both option 2 (to load topic_data) and option 3 (to control page loop)
		urlData = data_fromUrl(window.location.href);
		console.log("ctrl(opt=" + opt + ") : loading " + window.location.href);
		topic_number = urlData.topic_number;
		current_page = urlData.current_page;
		console.log("ctrl(opt=" + opt + ") : topic_number = " + topic_number + ", current_page " + current_page);
	}

	if (opt == 2) {

		console.log("ctrl(opt=" + opt + ") : #001: extraction requested.");
		h_line();

		// get topic data and page count from initial page
		var page_data = data_fromPage(document);
		topic_data = page_data.topic_data;
		page_count = page_data.page_count;
		console.log("ctrl(opt=" + opt + ") : page_count (from page_data) = " + page_count);
	    checkTopicData(topic_data);


		sessionStorage.setItem("topic-data", JSON.stringify(topic_data));                                     // [page count, [topic_data], [post_data]]
		sessionStorage.setItem("page-count", page_count);

		console.log("ctrl(opt=" + opt + ") : session variable initiated on page " + current_page);
		console.log("ctrl(opt=" + opt + ") : navigating to first page to start extraction.");


		// load first page
		let address = base_url + topic_data.id + "-1.html";
		alert(address);
		window.name = "site";
		window.open(address, "site", false);


		return 0;
	}
	// extract
	if (opt == 3) {

		var return_data = [];                                                                       //string return from sessionStoraage
		page_count = sessionStorage.getItem('page-count');		                           console.log("ctrl(opt=" + opt + ") : page_count = " + page_count);
		topic_data = JSON.parse(sessionStorage.getItem('topic-data'));
		checkTopicData(topic_data);
		console.log("ctrl(opt=" + opt + ") : current_page = " + current_page);

		if (page_count == -1) return 0;

		if (current_page == 1) post_data = []; else post_data = JSON.parse(sessionStorage.getItem("post-data"));

		if (current_page <= page_count ) {

			post_count = processPage(document, topic_data.post_count);

			console.log(">>> new post count: " + post_count);
			console.log(">>> new post_data size " + post_data.length);

			// sessionStorage.setItem("post-data", JSON.stringify(post_data));
			topic_data.post_count = post_count;
			sessionStorage.setItem("topic-data", JSON.stringify(topic_data));

			current_page++;
			console.log("ctrl(opt=" + opt + ") : current_page = " + current_page);
			let address = base_url + topic_data.id + "-" + current_page + ".html";
		//	alert(address);
			window.open(address, window.name, false);
		}
		else {
			post_data = JSON.parse(sessionStorage.getItem("post-data"));

			if (post_data) {
				console.log("ctrl(opt=" + opt + ") : post_data size = " + post_data.length);
				saveTopic(post_data, topic_data);
			}
			else {
				console.log("post_data is gone?");
			}
			exitScript();
		}
	}

}

function saveTopic(post_data, topic_data) {

	var w_report; 
	console.log("saveTopic() : function check..."); 

	// post_data = sessionStorage.getItem("post-data");

	if (post_data) {
		// open report window
		// get current window and open new window
		window.name = "site";
		w_report = window.open("","report","");
		//blur();//focus();

		w_report.document.write("<html><head><title>topic-" + topic_data.id + "</title>");
		w_report.document.write("<style type='text/css'>body{font-family:Verdana;font-size:10pt}h2{font-size:12pt}.post{}</style>");
		w_report.document.write("</head><body>");
		w_report.document.write("<h2>" + topic_data.id + ": " + topic_data.title + "  ( " + page_count + " pages )</h2><hr>");

		post_data.forEach(function(post){
			w_report.document.write("<div class='post'><div class='post_header'><font color='gray'><b><a href='" + post.link + "'>Post: " , post.id + "</a> - <i>" , post.time + "</i> - </font><font color='red'>" + post.user + " </b></font></div><br>");
			w_report.document.write("<div class='post_body'>" + post.comment + "</div></div><hr>");
		});

		w_report.document.write("</body></html>");

		// start new report
		
		w_author = window.open("","author","");
		w_author.document.write("<html><head><title>topic-" + topic_data.id + "</title>");
		
		w_author.document.write("</body></html>");
		
		// end of new report
		
	}
	else {
		console.log("post_data is 0 legnth.");
	}

	
	
	console.log("function done...");

	return 0;
}

function data_fromUrl(url) {

    var idx1 = url.indexOf("/t-") + 3;
    var str1 = url.substring(idx1);
    var idx2 = str1.indexOf("-");
    var idx3 = str1.indexOf(".html");

    var topic_number = str1.substring(0, idx2);
    var current_page = parseInt(str1.substring(idx2+1,idx3), 10);
    var objReturn = [topic_number, current_page];
	return {"topic_number":topic_number, "current_page":current_page};

}


function data_fromPage(doc) {


	var urlData = data_fromUrl(window.location.href);	                                     // console.log("data_fromPage() : data_fromUrl() : topic = " + topic_number + ". page = " + current_page);
	var topic_number = urlData.topic_number;
	var current_page = urlData.current_page;

	var topic_title = doc.getElementsByClassName('pageheadline')[0].innerHTML;  // get topic data from page

    // get number of pages ( use the page navigation links on the first page)
	var div_UI = doc.body.children[2].getElementsByClassName('boxlook');
	var div_pages = div_UI[div_UI.length-1];
	var pos = div_pages.children.length - 2;                                 // console.log("processPage() : last page is on the " + pos + "th link");
	var page_count = parseInt(div_pages.children[pos].innerHTML, 10);            // console.log("data_fromPage() : this topic is " + page_count + " pages long");
	sessionStorage.setItem("page-count", page_count);

	var topic_data = {"id":topic_number, "title":topic_title, "author":"author", "post_count":0};

    return {"topic_data":topic_data,"page_count":page_count};

}


function processPage(doc, post_count) {

	var page;
	var post_auth;
	var post_collection;    //collection of html elements that make up the posts
    var time_stamp;
	var post_link = "";
	var i;


    console.log("processPage() : post_data.length = " + post_count + " post count = " + post_count);
	page = doc.body.children[2];
	post_collection = page.getElementsByClassName('contentlook');
//	post_collection = doc.body.children[2].getElementsByClassName('contentlook');
	console.log("processPage() : number of posts on this page : " + post_collection.length);


	for (i=0; i < post_collection.length; i++ ) {

		//post_text = "";
		post_id = post_count + (i + 1);
		// post_count = post_count + i;
		//h_line();

		var post_html = post_collection[i];                                            // console.log("post_id : " + post_id + ", loop : " + i);
		var header_html = post_html.previousSibling.previousSibling;
		if (header_html.children[0]) {
		    time_stamp = header_html.children[0].innerHTML;
			post_link = header_html.children[1].href;                                  // console.log("timestamp: " + time_stamp + " - " + post_link);
		}
		var div_collection = post_html.getElementsByTagName('div');
		var span_collection = post_html.getElementsByTagName('span');                  // console.log("~ ~ div collection: " + div_collection.length + ", span collection: " + span_collection.length);

		var userlink = span_collection[0].innerHTML;                                   // console.log("userlink: " + userlink);

		//console.log("uh... " + userlink[1]);
		if (userlink[1] == "i") {
            console.log("reached the end of the posts for this page.");
			break;
		}

		var user_name = span_collection[0].children[0].innerHTML;                       // console.log("user: " + username);
		var user_crap = div_collection[2].innerHTML;                                    // console.log("usercrap: " + usercrap);

		// build the post
    	var objPost = {"id": post_id, "user": user_name, "time":time_stamp , "link":post_link, "comment": user_crap};          // console.log("processPage() : objPost = " + objPost);
		console.log("post : " , objPost);
		//console.log("processPage() : post_data size = " + post_data.length);
		post_data.push(objPost);
		//console.log("processPage() : post_data size = " + post_data.length);
		sessionStorage.setItem("post-data", JSON.stringify(post_data));

		// increment the post count
	}
	post_count = post_data.length; 	console.log(">>> post_count = " + post_count);
	return post_count;                                     // return page_data
}

function checkTopicData(topic_data) {

	//console.log("checkTopicData() : topic_data = " + topic_data.toSource());
	console.log("checkTopicData() : topic_data.id = " + topic_data.id);
	console.log("checkTopicData() : topic_data.title = " + topic_data.title);
	console.log("checkTopicData() : topic_data.author = " + topic_data.author);
	console.log("checkTopicData() : topic_data.post_count = " + topic_data.post_count);
	console.log("checkTopicData() : topic_data.id = " + topic_data.id);
    return 0;
}



function exitScript() {
	sessionStorage.removeItem("post-data");
	sessionStorage.removeItem("topic-data");
	sessionStorage.removeItem("page-count");
	console.log("exiting script.");
	return 0;
}

// utility...

function h_line(){
	console.log(".......................................................... >");
}

//  maybe not...

function checkPostData(post_datas) {

	post_data = sessionStorage.getItem("post-data");

	post_data.forEach(function(post){
		console.log("checkPostData() : id: " , post.id + ", author: " , post.user);
		console.log("checkPostData() : comment" , post.comment);
	});

	/*
	if (post_data) {
		console.log("checkPostData() : post_data.length = " + post_data.length);
		for (var j = 0;  j< post_data.length; j++) {
			console.log("checkPostData() : id: " , post_data[j].id + "author: " , post_data[j].user);
			console.log("checkPostData() : comment" , post_data[j].comment);
		}
	}

	else {

	}
	*/
}

console.log("OPP-TopicViewer finished.");

