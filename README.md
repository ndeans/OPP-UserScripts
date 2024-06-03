# OPP-UserScripts
OPP-UserScripts -  published from Github Desktop 

OPP is an online discuission site that breaks content down into topics and posts. OF course the site deliveres the content in pages. The site limits the number of posts to 15 per page. Sometimes, a topic can span 30 or more pages. There is no function that allows a user the chance to search the entire topic for anythingh specific. You have to select a page, search, select another page, search and so on... (That's fussy).

So... This script allows the user to press "F4" and get the entire topic loaded into a single, searchable page.

This is done by installing a user script engine, such as GreaseMonky (Firefox) or TamperMonkey (Chrome) and then adding this script and associating it with the URL for the discussion site. When the browser encounters this URL it loads the script.

Since the site has a navigation control, involving HREF links that specifies among other things, the number of the last page, my script can extract the total number of pages from that. Then it sets up a loop, using variables stored in the browsers global space, to load each page in succession, reading from the DOM and storing in a global variable, until the last page is read, then it creates a new page and dumps all the extracted data into that page and formats it.

The object here was to just get it working... which it does. I have not spent the time to refactor tp make the code exemplary.  

6/3/2024 - Added a new script... OPP-Extractor. This is a complete rebuild of the previous script. At this point, OPP-Extractor.js is the valid script the previous scripts are no longer viable.



