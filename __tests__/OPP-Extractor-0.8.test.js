const { data_fromUrl, getTopicNumber, getCurrentPage } = require("../OPP-Extractor-0.8.user.js");

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
    const { data_fromPage } = require("../OPP-Extractor-0.8.user.js");

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

