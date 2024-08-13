// ==UserScript==
// @name         OPP-Extractor
// @namespace    http://deans.us/
// @version      0.3
// @description  script to prepare entire topic for export to file.
// @author       Nigel Deans
// @match        https://www.onepoliticalplaza.com/t-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onepoliticalplaza.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

var base_url = "https://www.onepoliticalplaza.com/t-";
var report_type = 0;
var topic_number = 0;
var current_page = 0;
var job_data;
var topic_data;
var page_data = [];
var post_data = [];

(function() {
    'use strict';

    console.log("OPP-Extractor initialized.");
    if (document.readyState !== 'loading') {
        console.log("document is already ready");
        checkStatus();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
            console.log(">> EVENT : DOMContentLoaded");
            checkStatus();
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 113) {
            console.log(">> EVENT : keyCode-113 (F2) : requesting extraction.");
            report_type = 1;
            initiateExtraction();
        }
        if (event.keyCode == 114) {
            console.log(">> EVENT : keyCode-114 (F3) : requesting extraction.");
            report_type = 2;
            initiateExtraction();
        }

    });
})();

// *****************************************************************************************************************

function checkStatus() {

    if (document.readyState == "interactive") {
        console.log("checkStatus: document loaded : readystate = '" + document.readyState + "'");
        if (sessionStorage.getItem("topic-data")) {
            console.log("checkStatus: #002: extraction in progress.");

            extractFromPage();
            return;
        }
        else {
            console.log("checkStatus: #000: bypassing extraction.");
            return;
        }
    }
    else {
        console.log("checkStatus: document not ready... (readystate = '" + document.readyState + "').");
        return;
    }
}

// triggered by F2: pulls topic_number from URL and stores in session variable then redirects to first page.
function initiateExtraction() {

    data_fromUrl(window.location.href);
    topic_data = {"id":topic_number, "title":"", "page_count":0};
    sessionStorage.setItem("topic-data", JSON.stringify(topic_data));

    job_data = {"topic-id":topic_number, "report_type":report_type};
    sessionStorage.setItem("job-data", JSON.stringify(job_data));

    console.log("initiateExtraction(): #001: extraction requested on page " + current_page + "... session variables initiated.");
    let address = base_url + topic_number + "-1.html";
    window.name = "site";
    window.open(address, "site", false);
}

function extractFromPage() {

    data_fromUrl(window.location.href);

    if (current_page == 1) {

        job_data = JSON.parse(sessionStorage.getItem("job-data"));
        report_type = job_data.report_type;

        // get topic data and page count from initial page
        page_data = data_fromPage(document);
        topic_data = {"id":topic_number, "title":page_data.topic_title, "page_count":page_data.page_count, "report-type":report_type};
        sessionStorage.setItem("topic-data", JSON.stringify(topic_data));
        console.log("extractFromPage(): session variable (topic-data) updated on page " + current_page);
    }
    else {
        topic_data = JSON.parse(sessionStorage.getItem("topic-data"));
    }

    if (current_page <= topic_data.page_count ) {
        // extract page if there is a session variable for it
        if (JSON.parse(sessionStorage.getItem("post-data"))) {
            post_data = JSON.parse(sessionStorage.getItem("post-data"));
        }
        processPage(document);
        sessionStorage.setItem("post-data", JSON.stringify(post_data));
        // redirect if last page
        if (current_page < topic_data.page_count) {
            var new_page = (current_page + 1);
            let address = base_url + topic_number + "-" + new_page + ".html";
            console.log("loading..." + address);
            window.name = "site";
            window.open(address, "site", false);
        }
        // exit script
        else {
            console.log("no more pages.");
            console.log("extractFromPage(): post_data size = " + post_data.length);
            job_data = JSON.parse(sessionStorage.getItem("job-data"));
            report_type = job_data.report_type;
            // report();
            if (report_type == 1) {
                printStandard();
            }
            if (report_type == 2) {
                printNoQuotes();
            }
            // finish();
        }
    }
}

// *****************************************************************************************************************

function data_fromPage(doc) {

    // get topic title
    var topic_title = doc.getElementsByClassName('pageheadline')[0].innerHTML; // get topic data from page

    // get number of pages
    var nav_info = doc.getElementsByClassName('control_button_container')[1].innerHTML.split("\n");
    var page_count = parseInt(nav_info[6], 10);

    return {"topic_title":topic_title, "page_count":page_count};

}

function data_fromUrl(url) {
    var idx1 = url.indexOf("/t-") + 3;
    var str1 = url.substring(idx1);
    var idx2 = str1.indexOf("-");
    var idx3 = str1.indexOf(".html");
    topic_number = str1.substring(0, idx2);
    current_page = parseInt(str1.substring(idx2+1,idx3), 10);
}

function processPage(doc) {
    var post_collection;
    var meta_collection;
    var i; // separators - (meta_collection) these will outnumber the postblocks because some blocks are ads. - (page level)
    var j; // postblocks - (post_collection) (page level)
    var k; // breakouts - (post level)
    var quote_size;
    var post_text = "";

    // console.log("processPage() : post_data.length = " + post_count + " post count = " + post_count);
    post_collection = doc.getElementsByClassName('contentlook');
    meta_collection = doc.getElementsByClassName('contentlookseparator');
    // var posts_on_page = post_collection.length;
    var separators = meta_collection.length;

    console.log("processPage() : number of posts on this page : " + post_collection.length);

    j=0;

    for (i=0; i < separators; i++ ) {
        var post_id = meta_collection[i].id;
        if (post_id) {
            post_text = "";
            var post_time = meta_collection[i].getElementsByTagName('span')[0].innerText;
            var post_link = meta_collection[i].getElementsByTagName('a')[0].href;
            var post_author = post_collection[j].getElementsByTagName('a')[0].innerText;
            var post_content = post_collection[j].getElementsByTagName('div')[2].innerHTML;
            var post_blocks = post_collection[j].getElementsByTagName('div')[2].childNodes;

            for (k=0; k < post_blocks.length; k++ ) {
                if(post_blocks[k].nodeType == Node.TEXT_NODE) {
                    post_text = post_text + "<br>" + post_blocks[k].nodeValue;
                    // check word list and increment scorekeeper on matches.
                    if (k < post_blocks.length-1) { post_text = post_text + "<br>---<br>"; }
                }
            }

            var post_record = {"id": post_id, "author": post_author,"head": post_time, "link": post_link, "text": post_text, "html": post_content};
            post_data.push(post_record);
            console.log("post_record : " , post_record);
            j++;
        }
    }
    return post_data;
}


function finish() {
    console.log("removing session variables.");
    sessionStorage.removeItem("topic-data");
    sessionStorage.removeItem("post-data");
    sessionStorage.removeItem("job-data");
}

// *****************************************************************************************************************

function headerHTML2(report_title) {
    var html;
    html = "<html><head><title>" + report_title + "</title>";
    html = html + "<style type='text/css'>";
    html = html + "body{font-family:Verdana;font-size:10pt}";
    html = html + "h2{font-size:12pt}.post{}";
    html = html + ".quote_colors{border-color: #5ba5cb; background-color: #a4ceeb3d;}";
    html = html + "</style>";
    html = html + "</head><body><form name='Submit' onSubmit='return sendData()'>";
    html = html + "<h2>" + topic_data.id + ": " + topic_data.title + "  ( " + topic_data.page_count + " pages )</h2><hr>";
    return html;
}

function sendData() {
    alert("hello - this is a test.");
    finish();
}

function headerHTML(report_title) {
    var html;
    html = "<html><head><title>" + report_title + "</title>";
    html = html + "<style type='text/css'>";
    html = html + "body{font-family:Verdana;font-size:10pt}";
    html = html + "h2{font-size:12pt}.post{}";
    html = html + ".quote_colors{border-color: #5ba5cb; background-color: #a4ceeb3d;}";
    html = html + "</style>";

    /* html = html + "<script src='https://raw.githubusercontent.com/ndeans/OPP-UserScripts/master/testscript.js '>\n"; */


    html = html + "<script type='text/javascript'>\n";
    html = html + "function sendData(){\n";
    html = html + "    alert('hello');\n";
    html = html + "    var post_collection_out = [];\n";
    html = html + "    var post_collection_in = document.getElementsByClassName('post');\n";
    html = html + "    alert('posts in report... ' + post_collection_in.length);\n";
    html = html + "";
    html = html + "";
    html = html + "    for (i=0; i < post_collection_in.length; i++ ) {\n";
    html = html + "        if (post_collection_in[i].getElementsByName('selected')){\n";
    html = html + "//          post_collection_out.push(post_data[i])\n";
    html = html + "        }\n";
    html = html + "    }\n";
    html = html + "";
    html = html + "    console.log('removing session variables.');\n";
    html = html + "    sessionStorage.removeItem('topic-data');\n";
    html = html + "    sessionStorage.removeItem('post-data');\n";
    html = html + "    sessionStorage.removeItem('job-data');\n";
    html = html + "}</script>\n";
    html = html + "</head><body><form name='Submit' onSubmit='return sendData()'>";
    html = html + "<h2>" + topic_data.id + ": " + topic_data.title + "  ( " + topic_data.page_count + " pages )</h2><hr>";
    return html;
}

// post_record = {"id": post_id, "author": post_author,"head": post_time, "link": post_link , "text": post_content};
function printStandard() {
    var w_report;
    window.name = "report";
    w_report = window.open("","report","");
    w_report.document.write(headerHTML("topic-" + topic_data.id));
    console.log("printStandard() : function check...");
    post_data = JSON.parse(sessionStorage.getItem("post-data"));
    if (post_data) {
        post_data.forEach(function(post){
            w_report.document.write("<div class='post'><div class='post_header'><font color='gray'><b>");
            w_report.document.write("<input type='checkbox' name='selected' value='false'>&nbsp");
            w_report.document.write("<a name='plink' href='" + post.link + "' target='_blank'>Post: " + post.id + "</a>");
            w_report.document.write("- <i>" , post.head + "</i> - </font><font color='red'>" + post.author + " </b></font></div><br>");
            w_report.document.write("<div class='post_body'>" + post.html + "</div></div><hr>");
        });
    }
    w_report.document.write("<input name='Submit' type='submit' value='Update'></form></body></html>");
    window.stop();Webstorm
}



function printNoQuotes(){
    var w_report;
    window.name = "report";
    w_report = window.open("","","");
    w_report.document.write(headerHTML("topic-" + topic_data.id));
    console.log("printNoQuotes() : function check...");
    post_data = JSON.parse(sessionStorage.getItem("post-data"));

    if (post_data) {

        GM.xmlHttpRequest({
            method: 'POST',
            // url: 'http://localhost:1880/websvc',
            // url: 'http://localhost:8080/JAXRS-EX-06_mod/opp/upload',
            url: 'http://localhost:8080/Raven-Jakarta/opp/upload',
            data: JSON.stringify(post_data),
            headers: {'Content-Type': 'application/json'},
            onload: function(response) {
                if (response.status >= 200 && response.status < 400) {
                    console.log('Response received:', response.responseText);
                } else {
                    console.error('Error during GET request: ', response.status);
                }
            },
            onerror: function(response) {
                console.error('Network error',response.status);
            }
        });

        post_data.forEach(function(post){
            w_report.document.write("<div class='post'><div class='post_header'><font color='gray'><b>");
            w_report.document.write("<input type='checkbox' name='selected' value='true'>&nbsp");
            w_report.document.write("<a href='" + post.link + "' target='_blank'>Post: " + post.id + "</a>");
            w_report.document.write("- <i>" , post.head + "</i> - </font><font color='red'>" + post.author + " </b></font></div><br>");
            w_report.document.write("<div class='post_body'>" + post.text + "</div></div><hr>");
        });
    }
}
// ********************************************************************************************** END OF FILE **************