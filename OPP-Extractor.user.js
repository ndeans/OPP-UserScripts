// ==UserScript==
// @name         OPP-Extractor
// @namespace    http://deans.us/
// @version      0.9.11
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
    var topic_number = 0;
    var current_page = 0;
    var topic_data;
    var export_data;
    var page_data = [];
    var post_data = [];

    console.log("OPP-Extractor v0.9.11 initialized.");

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
            event.preventDefault();
            console.log(">> EVENT : keyCode-113 (F2) : requesting extraction.");
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

        console.log("initiateExtraction(): topic " + topic_number);
        let address = base_url + topic_number + "/1";
        
        window.name = "site";
        window.open(address, "site", false);
    }

    function extractFromPage() {
        data_fromUrl(window.location.href);
        
        var topicDataStr = sessionStorage.getItem("topic-data");
        if (!topicDataStr) return;
        
        topic_data = JSON.parse(topicDataStr);

        if (current_page == 1) {
            page_data = data_fromPage(document);
            topic_data.title = page_data.topic_title;
            topic_data.page_count = page_data.page_count;
            sessionStorage.setItem("topic-data", JSON.stringify(topic_data));
            console.log("extractFromPage(): page 1 init complete. Total pages: " + topic_data.page_count);
        }

        if (sessionStorage.getItem("post-data")) {
            post_data = JSON.parse(sessionStorage.getItem("post-data"));
        }
        
        processPage(document);
        sessionStorage.setItem("post-data", JSON.stringify(post_data));
        
        if (current_page < topic_data.page_count) {
            var new_page = (current_page + 1);
            let address = base_url + topic_number + "/" + new_page;
            window.name = "site";
            window.open(address, "site", false);
        }
        else {
            console.log("extractFromPage(): finishing extraction.");
            showExtractionUI(); 
        }
    }

    function data_fromPage(doc) {
        var topic_title = "Unknown Topic";
        try {
            topic_title = doc.getElementsByClassName('pageheadline')[0].innerText; 
        } catch(e) { console.error("Failed to get topic title"); }

        var page_count = 1;
        try {
            var nav_containers = doc.getElementsByClassName('control_button_container');
            if (nav_containers.length > 0) {
                var nav_text = nav_containers[nav_containers.length - 1].innerText;
                var matches = nav_text.match(/of\s+(\d+)/i) || nav_text.match(/(\d+)\s+pages/i);
                if (matches) {
                    page_count = parseInt(matches[1], 10);
                } else {
                    var numbers = nav_text.match(/\d+/g);
                    if (numbers) {
                        page_count = Math.max(...numbers.map(Number));
                    }
                }
            }
        } catch (e) {
            console.error("Failed to parse page count, defaulting to 1:", e);
        }

        if (isNaN(page_count) || page_count < 1) page_count = 1;
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

    function showExtractionUI() {
        const overlay = document.createElement('div');
        overlay.id = 'opp-selector-overlay';
        overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:10000; overflow-y:scroll; padding:20px; box-sizing:border-box; font-family:Verdana; font-size:10pt;';
        
        const style = document.createElement('style');
        style.innerHTML = ".quote_colors{border-color: #5ba5cb; background-color: #a4ceeb3d;} .post_author{color:red; font-weight:bold;} .post_header{color:gray;} hr{border:0; border-top:1px solid #ccc; margin:20px 0;} .bulk-select{margin: 10px 0; color: #555;} .bulk-select span{text-decoration: underline; cursor: pointer; color: blue; margin-right: 15px;}";
        document.head.appendChild(style);

        let html = `<h2>${topic_data.id}: ${topic_data.title}</h2>`;
        html += `<div class='bulk-select'>Bulk Select: <span id='sel-all'>All</span> <span id='sel-none'>None</span></div>`;
        html += "<div style='position:fixed; top:20px; right:40px; background:white; padding:10px; border:1px solid #ccc; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index:10001;'>";
        html += `<button id='btn-upload-selected' style='padding:10px 20px; background:#4CAF50; color:white; border:none; cursor:pointer; font-weight:bold;'>Upload Selected</button>`;
        html += " <button id='btn-close-overlay' style='padding:10px 20px; background:#f44336; color:white; border:none; cursor:pointer; font-weight:bold;'>Close</button>";
        html += "</div><hr style='margin-top:20px;'>";
        
        post_data.forEach((post, index) => {
            html += `<div class='post' style='padding:15px 10px;'>
                <input type='checkbox' class='post-selector' data-index='${index}' checked style='transform: scale(1.5); margin-right:15px; vertical-align:middle;'> 
                <span class='post_header'>
                    <a href='${post.link}' target='_blank'>Post: ${post.id}</a> - <i>${post.head}</i> - <span class='post_author'>${post.author}</span>
                </span>
                <div class='post_body' style='margin-top:15px;'>${post.html}</div>
            </div><hr>`;
        });
        
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        document.getElementById('sel-all').addEventListener('click', () => {
            document.querySelectorAll('.post-selector').forEach(cb => cb.checked = true);
        });

        document.getElementById('sel-none').addEventListener('click', () => {
            document.querySelectorAll('.post-selector').forEach(cb => cb.checked = false);
        });

        document.getElementById('btn-upload-selected').addEventListener('click', () => {
            const selectedIndices = Array.from(document.querySelectorAll('.post-selector:checked')).map(cb => parseInt(cb.dataset.index));
            const selectedPosts = selectedIndices.map(idx => post_data[idx]);
            
            if (selectedPosts.length === 0) {
                alert("No posts selected!");
                return;
            }

            const export_obj = {
                "topic_id": topic_data.id,
                "topic_title": topic_data.title,
                "report_type": 1, 
                "post_data": selectedPosts
            };

            uploadToRaven(export_obj);
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
                    alert('Upload successful! (' + data.post_data.length + ' posts)');
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
