## OPP-Extractor Analysis (Unified)

This document consolidates notes and analysis regarding the `OPP-Extractor-0.7.user.js` script, combining insights from different analytical perspectives.

### Script Purpose and Functionality

The `OPP-Extractor-0.7.user.js` is a browser userscript designed to run on OnePoliticalPlaza topic pages (`https://www.onepoliticalplaza.com/t-*`). Its primary function is to extract posts from all pages within a given topic. The extraction process is triggered by keyboard shortcuts (F2 for report type 1, F3 for report type 2).

The script follows these steps:
1.  **Initialization:** It sets up event listeners, including for keyboard input and DOM readiness.
2.  **Extraction Initiation:** Upon triggering (F2/F3), it parses the current URL for topic and page information, stores essential data (topic details, job parameters) in `sessionStorage`, and initiates navigation to the first page of the topic.
3.  **Page Processing:** The script navigates through each page of the topic. It extracts the topic title and total page count from specific HTML elements on the first page. For each subsequent page, it iterates through the posts, extracting details like author, timestamp, link, and the full HTML content of each post. All extracted post data is cumulatively stored in `sessionStorage`.
4.  **Reporting:** Once all pages are processed, the script prepares an `export_data` object.
    *   **Report Type 1 (`printStandard`):** Opens a new window displaying all extracted posts with their original HTML content. It then attempts to upload this data as JSON via an HTTP POST request to `http://vortex.lan:8080/Raven/api/upload`.
    *   **Report Type 2 (`printStandardForm`):** Generates an HTML form with checkboxes for each post, intended for user selection. However, the form submission logic for selecting and sending specific posts is incomplete.
5.  **Cleanup:** The script aims to remove temporary data from `sessionStorage` upon completion.

### Strengths of the Script

*   **Deterministic Workflow:** Provides a consistent method for extracting data across paginated topics.
*   **State Management:** Effectively uses `sessionStorage` to maintain state across different pages and windows during the extraction process.
*   **Data Preservation:** Captures both the full HTML content and the raw text of posts.
*   **Separation of Concerns:** Differentiates between the data extraction logic and the reporting/upload mechanisms.

### Issues, Risks, and Recommendations

1.  **Hardcoded Internal URL and CORS Errors:**
    *   **Issue:** The script attempts to upload data to a hard-coded internal network address (`http://vortex.lan:8080/Raven/api/upload`). This address is only accessible within the author's specific lab environment. Furthermore, when requests are made from one origin (`onepoliticalplaza.com`) to a different origin (`vortex.lan:8080`), browsers enforce CORS (Cross-Origin Resource Sharing) policies. Without server-side configuration to allow requests from the script's origin, CORS errors occur.
    *   **User Acceptance:** The user accepts this limitation for lab use.
    *   **Recommendation for CORS:** To resolve CORS errors, the server at `vortex.lan:8080` must be configured to send appropriate HTTP response headers, such as `Access-Control-Allow-Origin` (e.g., `http://www.onepoliticalplaza.com` or `*`), `Access-Control-Allow-Methods` (`POST`), and `Access-Control-Allow-Headers` (`Content-Type`).

2.  **Incomplete Form Submission (Report Type 2):**
    *   **Issue:** The `printStandardForm` function creates an interactive form with checkboxes for post selection. However, the associated `sendData` JavaScript function within the form is not fully implemented; it currently only displays alerts and clears `sessionStorage`, without sending selected data.
    *   **User Acceptance:** This is acceptable for now, with plans for future completion.

3.  **Fragile DOM Selectors:**
    *   **Issue:** The script relies heavily on class names (`pageheadline`, `control_button_container`, `contentlook`, `contentlookseparator`) and positional assumptions (e.g., `[1]`, `[2]`, `nav_info[6]`) to parse HTML. These are prone to breaking if the `onepoliticalplaza.com` website's structure or class names change.
    *   **Recommendation:** To improve robustness, identify elements with more stable attributes like unique `id`s. If `id`s are unavailable or not unique, use more specific CSS selectors based on element hierarchy rather than just class names. Always inspect the target website's HTML source for the most reliable identifiers.

4.  **Unused/Commented-out Functionality:**
    *   **Issue:** The `printNoQuotes()` function is defined but not called in the primary execution flow.
    *   **User Acceptance:** This is acceptable for now.

5.  **`window.open` and `window.stop` Usage:**
    *   **Issue:** The script uses `window.open` for navigation and report display, managing windows by `window.name`. The `window.stop()` call after report generation is a forceful method to halt script execution and page loading, which could potentially interrupt other browser processes.
    *   **Recommendation:** While `window.stop()` may be functional for halting the script, consider if a less abrupt method is suitable for script termination if it causes unintended side effects. Ensure all necessary cleanup (like `sessionStorage` removal) is completed *before* `window.stop()` is invoked.

6.  **Limited Error Handling:**
    *   **Issue:** Critical operations such as JSON parsing (`JSON.parse`), `sessionStorage` access, and `GM.xmlHttpRequest` lack explicit error handling (e.g., `try...catch` blocks). This could lead to script crashes or silent failures if data is malformed, unavailable, or network requests fail.
    *   **Recommendation:** Wrap these operations within `try...catch` blocks to log specific errors (e.g., using `console.error` or `GM_log`) and implement graceful failure handling, such as exiting the script or using default values.

7.  **Keyboard Capture Not Working (Issue #7):**
    *   **Analysis:** Comparison of `OPP-Extractor-0.7.user.js` and `OPP-KeyCapture-prototype-01.user.js` shows that the core logic for listening to `keydown` events (F2/F3) is functionally identical.
    *   **Verification:** The code appears correct. The issue might stem from environmental factors, such as event propagation/consumption by other scripts on the page, execution context interference (especially with multiple windows), or race conditions with other listeners like `DOMContentLoaded`.

8. **URL Changes:**
	OnePoliticalPlaza.com has changed the URLs for retrieving pages. This was the reason why I couldn't even get my keyboard capture to work. The @match pattern at the header of the userscript says " https://www.onepoliticalplaza.com/t-* " But now the URL for any of the content being extracted is " https://www.onepoliticalplaza.com/topic/* "
	Some of the script uses the information in the URL so we need to update the script accordingly.


    

### Maintenance and Future Work

*   **Selector Hardening:** Implement more resilient DOM querying and add defensive checks.
*   **Error Handling & Cleanup:** Integrate `try...catch` blocks and ensure cleanup routines are consistently called.
*   **Configuration:** Externalize API endpoints and other configurations for easier management.
*   **Form Functionality:** Complete the `sendData` function in `printStandardForm` to enable selection and upload of posts.
*   **Modern JS:** Consider replacing deprecated `event.keyCode` with `event.key` and modernizing `window.open` usage if necessary.
*   **CORS Resolution:** Address CORS by configuring the target server (`vortex.lan:8080`) with appropriate headers.


