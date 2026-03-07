
0.1  Build prototype-01: Keyboard Capture
	1.1 Runs on TamperMonkey
	1.1 Only runs when browser points to the target site
	1.2 captures keyboard (F2 and F3)
	1.3 sends message to console saying which key was hit.

0.2  prototype-01 no longer needed. I found, the cause of the issue.


1. CORS Resolution (Hardcoded Internal URL and CORS Errors): 
	Address CORS by configuring the target server (`vortex.lan:8080`) with appropriate headers.

2. Selection Form (Incomplete Form Submission)
	Complete the `sendData` function in `printStandardForm` to enable selection and upload of posts.

3. Selector Hardening (Fragile DOM Selectors):
	Implement more resilient DOM querying and add defensive checks.
	
4. printNoQuotes (backlog)

5. Window Management (wndow.open and window.stop Usage)

6. Error Handling

7. ~~Keyboard Capture Not Working~~ (resolved)

8. URL changes 

9. Configuration:
	Externalize API endpoints and other configurations for easier management

10. Modern JS:
	Consider replacing deprecated `event.keyCode` with `event.key` and modernizing `window.open` usage if necessary.
	
11. 

	

