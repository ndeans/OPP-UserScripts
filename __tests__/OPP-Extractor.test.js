const { data_fromUrl, getTopicNumber, getCurrentPage } = require("../OPP-Extractor.user.js");

describe("OPP-Extractor URL Parsing", () => {
    test("should extract topic ID and page 1 from a standard URL without page number", () => {
        const url = "https://www.onepoliticalplaza.com/topic/377456-why-should-hard-working-taxpayers-bail-out-people-who-refuse-to-pay-their-bills/";
        data_fromUrl(url);
        expect(getTopicNumber()).toBe("377456");
        expect(getCurrentPage()).toBe(1);
    });

    test("should extract topic ID and specific page number (e.g., page 2)", () => {
        const url = "https://www.onepoliticalplaza.com/topic/377456-why-should-hard-working-taxpayers-bail-out-people-who-refuse-to-pay-their-bills/2";
        data_fromUrl(url);
        expect(getTopicNumber()).toBe("377456");
        expect(getCurrentPage()).toBe(2);
    });

    test("should extract topic ID and page number with trailing slash", () => {
        const url = "https://www.onepoliticalplaza.com/topic/377456-why-should-hard-working-taxpayers-bail-out-people-who-refuse-to-pay-their-bills/3/";
        data_fromUrl(url);
        expect(getTopicNumber()).toBe("377456");
        expect(getCurrentPage()).toBe(3);
    });

    test("should handle URLs with just topic ID and no slug", () => {
        const url = "https://www.onepoliticalplaza.com/topic/12345/5";
        data_fromUrl(url);
        expect(getTopicNumber()).toBe("12345");
        expect(getCurrentPage()).toBe(5);
    });

    test("should default to page 1 if URL ends in topic ID", () => {
        const url = "https://www.onepoliticalplaza.com/topic/98765";
        data_fromUrl(url);
        expect(getTopicNumber()).toBe("98765");
        expect(getCurrentPage()).toBe(1);
    });
});

describe("OPP-Extractor Page Data Extraction", () => {
    const { data_fromPage } = require("../OPP-Extractor.user.js");

    test("should extract topic title and page count from page HTML", () => {
        // Mocking the document structure used by data_fromPage
        document.body.innerHTML = `
            <div class="pageheadline">Test Topic Title</div>
            <div class="control_button_container"></div>
            <div class="control_button_container">
                <div class="some_inner_div">
                    Line 0\nLine 1\nLine 2\nLine 3\nLine 4\nLine 5\n10\nLine 7
                </div>
            </div>
        `;

        // The script expects the 2nd control_button_container's innerHTML to be split by \n
        // and expects the 7th element (index 6) to be the page count.
        const mockContainer = document.getElementsByClassName('control_button_container')[1];
        mockContainer.innerHTML = "dummy\ndummy\ndummy\ndummy\ndummy\ndummy\n15\ndummy";

        const result = data_fromPage(document);

        expect(result.topic_title).toBe("Test Topic Title");
        expect(result.page_count).toBe(15);
    });
});

describe("OPP-Extractor Post Data Extraction", () => {
    const { processPage } = require("../OPP-Extractor.user.js");

    test("should extract post details from page HTML", () => {
        document.body.innerHTML = `
            <div class="contentlookseparator" id="post123">
                <a href="https://www.onepoliticalplaza.com/t-377456-1#123"></a>
                <span>March 9, 2026</span>
            </div>
            <div class="contentlook">
                <a href="/user/456">AuthorName</a>
                <div></div>
                <div class="post_body_container">
                    <div>Actual Post Content</div>
                    Text Node 1
                    <br>
                    Text Node 2
                </div>
            </div>
        `;

        // The script expects:
        // meta_collection[i].getElementsByTagName('span')[0].innerText for post_time
        // meta_collection[i].getElementsByTagName('a')[0].href for post_link
        // post_collection[j].getElementsByTagName('a')[0].innerText for post_author
        // post_collection[j].getElementsByTagName('div')[2].innerHTML for post_content
        // post_collection[j].getElementsByTagName('div')[2].childNodes for post_text extraction

        const results = processPage(document);

        expect(results.length).toBe(1);
        expect(results[0].id).toBe("post123");
        expect(results[0].author).toBe("AuthorName");
        expect(results[0].head).toBe("March 9, 2026");
        expect(results[0].link).toBe("https://www.onepoliticalplaza.com/t-377456-1#123");
        expect(results[0].html).toContain("Actual Post Content");
        expect(results[0].text).toContain("Text Node 1");
        expect(results[0].text).toContain("Text Node 2");
    });
});

