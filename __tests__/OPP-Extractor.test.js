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
                <div style="color:#333333;">
                    <a href="/user/456">AuthorName</a>
                </div>
                <div class="smalltext">&nbsp;</div>
                <div style="line-height:1.5em;">
                    Actual Post Content
                    Text Node 1
                    <br>
                    Text Node 2
                </div>
            </div>
        `;

        // Structure mirrors actual OPP contentlook:
        // div[0] = author header, div[1] = spacer, div[2] = post body

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

describe("OPP-Extractor Pasted Image Extraction", () => {
    let processPage;

    beforeAll(() => {
        jest.resetModules();
        processPage = require("../OPP-Extractor.user.js").processPage;
    });

    test("should append pasted image div HTML to the post html field", () => {
        document.body.innerHTML = `
            <div class="contentlookseparator" id="post789">
                <a href="https://www.onepoliticalplaza.com/t-99999-1#789"></a>
                <span>May 18, 2026</span>
            </div>
            <div class="contentlook">
                <a href="/user/111">MemeAuthor</a>
                <div></div>
                <div class="post_body_container">
                    <div></div>
                </div>
                <div style="text-align:center; overflow-wrap:break-word;">
                    <br>
                    <img src="https://static.onepoliticalplaza.com/upload/2024/1/1/test-meme.jpg" alt="" style="max-width:100%; max-height:850px;">
                    <br>
                </div>
            </div>
        `;

        const results = processPage(document);
        const post = results[results.length - 1];

        expect(post.id).toBe("post789");
        expect(post.html).toContain("test-meme.jpg");
    });

    test("should not include avatar images or non-image centered divs", () => {
        document.body.innerHTML = `
            <div class="contentlookseparator" id="post790">
                <a href="https://www.onepoliticalplaza.com/t-99999-1#790"></a>
                <span>May 18, 2026</span>
            </div>
            <div class="contentlook">
                <div style="color:#333333;">
                    <img src="https://static.onepoliticalplaza.com/avatars/avatar.jpg" alt="" class="avatar_responsive_width_topic" style="float:left; margin-right:1%;">
                    <a href="/user-profile?usernum=123" class="tdn vsc">SomeAuthor</a>
                </div>
                <div class="smalltext" style="clear:both;">&nbsp;</div>
                <div style="line-height:1.5em; margin-top:1%; overflow-wrap:break-word;">Just some text, no meme.</div>
                <div class="postsigtext">SomeAuthor</div>
            </div>
        `;

        const results = processPage(document);
        const post = results[results.length - 1];

        expect(post.id).toBe("post790");
        expect(post.html).not.toContain("avatar.jpg");
    });
});

