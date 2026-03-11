// ==UserScript==
// @name         OPP-Extractor
// @namespace    http://deans.us/
// @version      0.9.4
// @description  script to prepare entire topic for export to file.
// @author       Nigel Deans
// @match        https://www.onepoliticalplaza.com/topic/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onepoliticalplaza.com
// @connect      vortex
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';

    var base_url = "https://www.onepoliticalplaza.com/topic/";
    var report_type = 0;
    var topic_number = 0;
    var current_page = 0;
    var job_data;
    var topic_data;
    var export_data;
    var page_data = [];
    var post_data = [];

    console.log("OPP-Extractor initialized.");

    if (document.readyState !== 'loading') {
        checkStatus();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
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

    // *****************************************************************************************************************

    function checkStatus() {
        if (document.readyState == "interactive" || document.readyState == "complete") {
            if (sessionStorage.getItem("topic-data")) {
                extractFromPage();
                return;
            }
        }
    }

    function initiateExtraction() {
        data_fromUrl(window.location.href);
        topic_data = {"id":topic_number, "title":"", "page_count":0};
        sessionStorage.setItem("topic-data", JSON.stringify(topic_data));

        job_data = {"topic-id":topic_number, "report_type":report_type};
        sessionStorage.setItem("job-data", JSON.stringify(job_data));

        console.log("initiateExtraction(): extraction requested on page " + current_page);
        let address = base_url + topic_number + "/1";
        window.location.href = address;
    }

    function extractFromPage() {
        data_fromUrl(window.location.href);

        if (current_page == 1) {
            job_data = JSON.parse(sessionStorage.getItem("job-data"));
            report_type = job_data.report_type;
            page_data = data_fromPage(document);
            topic_data = {"id":topic_number, "title":page_data.topic_title, "page_count":page_data.page_count, "report-type":report_type};
            sessionStorage.setItem("topic-data", JSON.stringify(topic_data));
        }
        else {
            topic_data = JSON.parse(sessionStorage.getItem("topic-data"));
            job_data = JSON.parse(sessionStorage.getItem("job-data"));
            report_type = job_data.report_type;
        }

        if (current_page <= topic_data.page_count ) {
            if (JSON.parse(sessionStorage.getItem("post-data"))) {
                post_data = JSON.parse(sessionStorage.getItem("post-data"));
            }
            processPage(document);
            sessionStorage.setItem("post-data", JSON.stringify(post_data));
            
            if (current_page < topic_data.page_count) {
                var new_page = (current_page + 1);
                window.location.href = base_url + topic_number + "/" + new_page;
            }
            else {
                console.log("Extraction complete. post_data size = " + post_data.length);
                export_data = {"topic_id":topic_data.id, "topic_title":topic_data.title, "report_type":job_data.report_type, "post_data":post_data};

                if (report_type == 1) {
                    printStandard();
                }
                if (report_type == 2) {
                    showSelectiveUploadUI();
                }
            }
        }
    }

    function data_fromPage(doc) {
        var topic_title = doc.getElementsByClassName('pageheadline')[0].innerHTML; 
        var nav_info = doc.getElementsByClassName('control_button_container')[1].innerHTML.split("\n");
        var page_count = parseInt(nav_info[6], 10);
        return {"topic_title":topic_title, "page_count":page_count};
    }

    function data_fromUrl(url) {
        const topicMatch = url.match(/\/topic\/(\d+)/);
        if (topicMatch) {
            topic_number = topicMatch[1];
        }
        const pageMatch = url.match(/\/(\d+)\/?$/);
        if (pageMatch && pageMatch[1] !== topic_number) {
            current_page = parseInt(pageMatch[1], 10);
        } else {
            current_page = 1;
        }
    }

    function processPage(doc) {
        var post_collection = doc.getElementsByClassName('contentlook');
        var meta_collection = doc.getElementsByClassName('contentlookseparator');
        var separators = meta_collection.length;
        var j=0;
        for (var i=0; i < separators; i++ ) {
            var post_id = meta_collection[i].id;
            if (post_id) {
                var post_text = "";
                var post_time = meta_collection[i].getElementsByTagName('span')[0].innerText;
                var post_link = meta_collection[i].getElementsByTagName('a')[0].href;
                var post_author = post_collection[j].getElementsByTagName('a')[0].innerText;
                var post_content = post_collection[j].getElementsByTagName('div')[2].innerHTML;
                var post_blocks = post_collection[j].getElementsByTagName('div')[2].childNodes;

                for (var k=0; k < post_blocks.length; k++ ) {
                    if(post_blocks[k].nodeType == Node.TEXT_NODE) {
                        post_text = post_text + "<br>" + post_blocks[k].nodeValue;
                        if (k < post_blocks.length-1) { post_text = post_text + "<br>---<br>"; }
                    }
                }

                var post_record = {"id": post_id, "author": post_author,"head": post_time, "link": post_link, "text": post_text, "html": post_content};
                post_data.push(post_record);
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

    function printStandard() {
        var w_report = window.open("","report","");
        w_report.document.write("<html><head><title>Topic " + topic_data.id + "</title>");
        w_report.document.write("<style>body{font-family:Verdana;font-size:10pt} .post_header{font-weight:bold;color:gray} .post_author{color:red}</style>");
        w_report.document.write("</head><body><h2>" + topic_data.id + ": " + topic_data.title + "</h2><hr>");
        
        post_data.forEach(function(post){
            w_report.document.write("<div class='post'><div class='post_header'><a href='" + post.link + "' target='_blank'>Post: " + post.id + "</a> - <i>" + post.head + "</i> - <span class='post_author'>" + post.author + "</span></div><br>");
            w_report.document.write("<div class='post_body'>" + post.html + "</div></div><hr>");
        });
        w_report.document.write("</body></html>");
        w_report.document.close();

        uploadToRaven(export_data);
    }

    function showSelectiveUploadUI() {
        const overlay = document.createElement('div');
        overlay.id = 'opp-selector-overlay';
        overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:10000; overflow-y:scroll; padding:20px; box-sizing:border-box; font-family:Verdana; font-size:10pt;';
        
        let html = "<h2>Select Posts to Upload</h2><button id='btn-upload-selected' style='position:fixed; top:20px; right:40px; padding:10px 20px; background:#4CAF50; color:white; border:none; cursor:pointer; font-weight:bold;'>Upload Selected</button>";
        html += "<button id='btn-close-overlay' style='position:fixed; top:20px; right:180px; padding:10px 20px; background:#f44336; color:white; border:none; cursor:pointer; font-weight:bold;'>Cancel</button><hr>";
        
        post_data.forEach((post, index) => {
            html += `<div style='border-bottom:1px solid #ccc; padding:10px;'>
                <input type='checkbox' class='post-selector' data-index='${index}' checked> 
                <b>Post: ${post.id}</b> - <i>${post.head}</i> - <span style='color:red;'>${post.author}</span><br>
                <div style='max-height:100px; overflow:hidden; opacity:0.7; font-size:9pt;'>${post.html}</div>
            </div>`;
        });
        
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        document.getElementById('btn-upload-selected').addEventListener('click', () => {
            const selectedIndices = Array.from(document.querySelectorAll('.post-selector:checked')).map(cb => parseInt(cb.dataset.index));
            const selectedPosts = selectedIndices.map(idx => post_data[idx]);
            
            if (selectedPosts.length === 0) {
                alert("No posts selected!");
                return;
            }

            const selective_export = {
                "topic_id": topic_data.id,
                "topic_title": topic_data.title,
                "report_type": report_type,
                "post_data": selectedPosts
            };

            uploadToRaven(selective_export);
            document.body.removeChild(overlay);
        });

        document.getElementById('btn-close-overlay').addEventListener('click', () => {
            document.body.removeChild(overlay);
            finish();
        });
    }

    function uploadToRaven(data) {
        const api = (typeof GM_xmlhttpRequest !== 'undefined') ? GM_xmlhttpRequest : GM.xmlHttpRequest;
        api({
            method: 'POST',
            url: 'http://vortex:8080/Raven/api/upload',
            data: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'},
            onload: function(response) {
                if (response.status >= 200 && response.status < 400) {
                    alert('Upload successful!');
                } else {
                    alert('Upload failed: ' + response.status);
                }
                finish();
            },
            onerror: function(response) {
                alert('Network error during upload.');
                finish();
            }
        });
    }

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            data_fromUrl: data_fromUrl,
            data_fromPage: data_fromPage,
            processPage: processPage
        };
    }

})();
