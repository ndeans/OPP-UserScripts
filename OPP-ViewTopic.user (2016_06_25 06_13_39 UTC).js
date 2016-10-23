 /// ==UserScript==

// @name          OPP-ViewTopic
// @namespace     http://www.deans.us
// @description   Script for viewing topics. (Intercepts calls to google ads.)
// @author        nigel c. deans - 2015 

// @include       http://www.onepoliticalplaza.com/t-*
// @exclude       https://*

// @noframes
// @run-at        document-start

// ==/UserScript==

console.log("OPP-TopicViewer initialized.");

var base_url = "http://www.onepoliticalplaza.com/t-";

var topic_state = 0;       // 1 = load-only, 2 = extract page, 3 = extract page 
var topic_title;
var topic_number = 0;
var topic_pages = 0;
var current_page = 0;
var post_count = 0;
var last_page = 0;

window.addEventListener('beforescriptexecute', function(e) {
  
  // for external scripts
  
  src = e.target.src;
  if (src.search(/pagead2/) != -1 || src.search(/googletagservice/) != -1) {
    console.log("...intercepting external script, 'googletagservice'...");
    e.preventDefault();
    e.stopPropagation();
    changed++;
  };
  
  // for inline scripts
  if (e.target===document.getElementByTagName("script") [0]) {
    console.log("...intercepting internal script.");changed++;
    e.StopPropagation();
    e.preventDefault();
  }

}, true);

document.addEventListener('DOMContentLoaded', function() {

   console.log(">> EVENT : DOMContentLoaded :");
   init(1);
   
});

document.addEventListener('keydown', function(event) {
   
    if (event.keyCode == 113) {
       console.log("EVENT : keyCode-113 (F2) : single page extraction test requested.");
       init(2);  // start single page extraction (test)
    }

    if (event.keyCode == 115) {
       console.log("EVENT : keyCode-115 (F4) : multipage extraction requested.");
       init(3); // start multipage extraction
    }
   
    if (event.keyCode == 117) {
       console.log("EVENT : keyCode-117 (F6) : save data to file.");
       save_to_file();
    }
   
});

function init(opt) {
 
   var page_data = [];    
   var post_data = [];
   
   // bounce all calls not initiated by document event listener
   if (opt < 1) {
      if (document.readyState == "interactive") {
         console.log("init(opt=" + opt + ") : document loaded : readystate = '" + document.readyState + "'");
         opt = 1;
      }
      else {                                                          // kind of redundant...
         console.log("init(opt=" + opt + ") : document not ready... (readystate = '" + document.readyState + "').");
         return;
      }
   } 
   
   // bounce all calls where session variable is not initialized. (no extraction requested)
   if (opt == 1) {
      
      if (window.name.length < 6) {
         console.log("init(opt=" + opt + ") : #001: bypassing extraction.");
         return 0;
      }
      else {
         console.log("init(opt=" + opt + ") : #002: extraction in progress.");
         console.log("init(opt=" + opt + ") : window.name.length = " + window.name.length);
         opt = 2;
      }
   }


   // extract
   if (opt > 1) {
       console.log("init(opt=" + opt + ") : #002: extraction requested.");
      
       // topic number and current page from HREF
       getTopicAndPage(window.location.href);
       console.log("init(opt=" + opt + ") : topic = " + topic_number + ". page = " + current_page);
   
       if (opt == 3 && current_page > 1) {
         consoler.log("init(opt=" + opt + ") : navigate to the first page to start extraction.");
         return 0;          
       }
      
       if (current_page == 1) {                                            // initialize session variable 
           window.name = null; 
           console.log("init(opt=" + opt + ") : session variable initiated on page " + current_page + ", size = " + page_data.length);
           post_data = [];
           console.log("init(opt=" + opt + ") : starting post_data length = " + post_data.length);
       } 
       else {                                                              // get existing session variable
           page_data = JSON.parse(window.name);
           console.log("init(opt=" + opt + ") : accumulated page_data copied from session variable " + (current_page - 1) + ". size = " + page_data.length);   
           post_data = page_data[1];
           console.log("init(opt=" + opt + ") : incomming post_data length = " + post_data.length);
       }   
   
       // topic title, topic pages and post data from document     
       page_data = processPage(document, post_data);
       topic_data = page_data[0];
       topic_title = topic_data[0];
       topic_pages = parseInt(topic_data[1],10);
       topic_status = 1;
       post_data = page_data[1];
       post_count = post_data.length;
   
      
       console.log("init(opt=" + opt + ") : post_count = " + post_count);
       if (post_count > 15) {
           opt = 3;                                        // post_count > 15 means more than one page - so it's multi-page (option 3)    
       }        
      
       if (opt == 2) {
           checkPageData(page_data, 1);
           window.name = null;
           console.log("init(opt=" + opt + ") : session variable set to null. length = " + window.name.length); 
           return 1;
       }

   }

   // multi-page extract
   if (opt > 2) {
       console.log("init(opt=" + opt + ") : #003: multipage extraction requested.");
      
       // store in session variable 
       window.name = JSON.stringify(page_data);                            // JSON uses the JSON parser - all modern browsers
       console.log("init(opt=" + opt + ") : page_data saved to session variable...");
      
       if (last_page) {
          console.log("init(opt=" + opt + ") : Well then... We've jumped all the pages, haven't we?");
          checkPageData(page_data, 1);
          if (opt == 3) { 
             save_to_file();
          }
       } 
       else {
          console.log("init(opt=" + opt + ") : 'Not there yet...");
          // load next page
          var next_page = 1 + parseInt(current_page, 10);
          var new_url = base_url + topic_number + "-" + next_page + ".html";   
            
          console.log("init(opt=" + opt + ") : next url = " + new_url); 
          window.open(new_url, '_self', false);
         
       }   

   }

}

function processPage(doc, post_data) {

   var html_main;
   var page_count = 0;
   var post_count = 0;
   var ad_count = 0;
   
   var post_date;
   var post_link;
   var post_auth;
   var post_text;
   
   var topic_data = [];                            // title and total pages (taken from page)
   
   console.log("processPage() : function test...");
   
   post_count = post_data.length;
   console.log("processPage() : post_data.length (starting) = " + post_count);
   

   
   console.log("processPage() : test 001 : " + doc.getElementsByTagName('body')[0].children.length);
   
   // for some reason, the following code only works for the first page load at 15 post_data records. 
   html_main = document.getElementsByTagName('body')[0].children[2];
   console.log("processPage() : pulled main element..." + html_main.nodeType);
   
   
   
   
   
   // topic data from page header  
   var k = parseInt(html_main.children[2].children.length,10) - 1;
   console.log("processPage() : number of nav links = " + k);
   
   // number of pages from page header
   var last_nav = html_main.children[2].children[k].textContent;
   console.log("processPage() : last nav links = " + last_nav);
   
   if (last_nav == ">>") {
     console.log("processPage() : not the last page.");
     topic_pages = html_main.children[2].children[k-1].textContent;  
   }
   else {
     console.log("processPage() : last page.");     
     topic_pages = html_main.children[2].children[k].textContent;    
     last_page = 1;
   }   

   console.log("processPage() : pulled topic_pages... " + topic_pages);
   
   
   var topic_title = html_main.children[4].innerHTML.trim();
   console.log("processPage() : pulled topic_title... " + topic_title);

   topic_data = [topic_title, topic_pages];
   console.log("processPage() : topic data extracted...");
   
   // post data
   var table = html_main.children[12].children[0];
   for (var i = 1, row; row = table.rows[i]; i++) {                                          // i initialized to 1 to skip the page header row.
     
     post_text = "";

     if (row.querySelector(".postuserinfo").textContent.length == 1) {                       // advertisement row
         ad_count++;
         continue;
     }
    
     if (row.querySelector(".postuserinfo").children.length == 3) {                          // post row 1
         post_date = row.cells[0].children[2].textContent.trim();
         post_link = row.cells[0].children[1].children[0].innerHTML;
         post_count++;
     }
     else {                                                                                  // post row 2 
         post_auth = row.cells[0].children[0].children[0].textContent;
       
         // sift through the actual elements in the post text and just get the original quotes
         var contents = row.cells[1].children[0]; 
         var content  = contents.firstChild;
         var cc = 0;
         
         while (content) {
           
           if (content.nodeType === Node.ELEMENT_NODE) {
           }
           
           if (content.nodeType === Node.TEXT_NODE) {
             post_text += content.textContent + "<hr>";
           }
 
           content = content.nextSibling;  
           cc++;
       }

       post_data.push([post_auth, post_date, post_link, post_text]);
       // post_data.push(["auth": post_auth, "date": post_date, "link": post_link, "text": post_text]);
       
        
       // console.log("..post recorded added to post_data: current_page=" + current_page + ", post_count=" + post_count + ", post_data size=" + post_data.length);   
         
       }

   }  // End of Table Loop
   
   if (post_data.length != post_count ) {
         console.log("...may have a problem here...");                   
   }    
       
   console.log("processPage() : post_data.length (ending) = " + post_count);
   
   return [topic_data, post_data];                                        // return page_data
  
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

function checkPageData(page_data, opt) {

 
   var str = "";
   console.log(".........................................................................................");
   console.log("check - topic title : " + topic_title);
   if (last_page) {
      str = " ( last page ).";
   }
   else {
      str = "";
   }
   console.log("check - page        : " + current_page + " of " + topic_pages + str );
   console.log("check - post        : " + post_count + " (of an estimated " + topic_pages * 15 + ")");
   console.log("check - page_data   : " + page_data.length);
   
   post_data = page_data[1];
   console.log("check - post_data   : " + post_data.length); 
   
   if (opt == 1) {
        for (var m = 0; m < post_data.length; m ++) {
           console.log("> " + post_data[m]);
           //console.log("> " + post_data.[m][0] + ", " + post_data[m][1] + ". " + post_data[m][2]);
           //console.log(post_data[m][3]);
        }  
      // console.log("> " + post_data);
   }
   console.log(".........................................................................................");
}

function save_to_file() {

     console.log("save_to_file() : function check...");
     var entire_topic = "";

     if (window.name.length > 4) {
       console.log("save_to_file() : saving " + window.name.length + " bytes of session data.");
       entire_topic = JSON.stringify(window.name); 
     }
     else {
       console.log("save_to_file() : no session data to save.");
       return null;
     }

     // var entireTopic = JSON.stringify(post_data); 
   
     var textFileAsBlob = new Blob([entire_topic], {type: 'text/plain'});

     console.log("save_to_file() : test-002");

     var fileNameToSaveAs = "opp-topicsaved-001.txt";
     var downloadLink = document.createElement("a");

     console.log("save_to_file() : test-003");
     downloadLink.download = fileNameToSaveAs;
     downloadLink.innerHTML = "bullshit that won't be seen";

     window.URL = window.URL || window.webkitURL;
     downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

     downloadLink.onclick = destroyClickedElement;
   
     console.log("save_to_file() : test-006");
     downloadLink.style.display = "none";

     document.body.appendChild(downloadLink);

     downloadLink.click();
     
    return;
   
   
}

function destroyClickedElement(event) {
    document.body.removeChild(event, target);
}

function searchPosts(){
    return true;
}
