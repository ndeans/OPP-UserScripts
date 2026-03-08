
## Challenge 01 ##
:
*Background:
:
URL = https://www.onepoliticalplaza.com/t-377456-why-should-hard-working-taxpayers-bail-out-people-who-refuse-to-pay-their-bills-1
topic_number = 377456
current_page = 2
:
here's the current code...
:
`function data_fromUrl(url) {`
    `var idx1 = url.indexOf("/t-") + 3;`
    `var str1 = url.substring(idx1);`
    `var idx2 = str1.indexOf("-");`
    `var idx3 = str1.indexOf(".html");`
    `topic_number = str1.substring(0, idx2);`
    `current_page = parseInt(str1.substring(idx2+1,idx3), 10);`
`}`
:
Challenge: The URL has changed...
:
URL = https://www.onepoliticalplaza.com/topic/377456-why-should-hard-working-taxpayers-bail-out-people-who-refuse-to-pay-their-bills/2
:
Request:  Please recommend changes to code.
:
---
## Challenge 02: Testing ##
:
[[_recommendations#Recommendation _02]]
*Background:
:
I need to test the user script (OPP-Extractor).
Currently, 
I copy the entire source file into a new user script in TamperMonkey, all the settings are specified in @variables at the head.
Then I point the browser to a topic page on onepoliticalplaza and trigger the F2 keyboard event.
:
Challenge:  I would like to automate this 
:
Request: Recommendations
:
:
Response:
  ---
:
## Challenge 03: Selector ##





