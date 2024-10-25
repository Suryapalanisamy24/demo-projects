import puppeteer from "puppeteer";

const getData = async () => {
    const browser = await puppeteer.launch({
        headless: true, // Set to true for production
        defaultViewport: null,
    });

    const page = await browser.newPage();

    try {
        await page.goto("https://www.forwarderspages.com/country/india", {
            waitUntil: "domcontentloaded",
        });

        await page.waitForSelector('#main > div > section > div.entries');

        // Get all article elements
        const articles = await page.$$('#main > div > section > div.entries article');

        // for (const article of articles) {
        //     // Click the h2 tag inside each article to expand
        //     const h2 = await article.$('h2');
        //     if (h2) {
        //         await h2.click();
        //         await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        //         await page.waitForSelector("#post-19646 > div");

        //         // Extract data from the article
        //         const keyValuePairs = await page.evaluate(() => {
        //             const parentElement = document.querySelector('#post-19646 > div');
        //             const pTags = parentElement.querySelectorAll('p');
        //             const keyValuePairs = {};
        //             let currentKey = null;

        //             pTags.forEach(pTag => {
        //                 const text = pTag.innerHTML.trim();
        //                 const brIndex = text.indexOf("<br>");
        //                 const aTag = pTag.querySelector('a');
        //                 console.log(text)

        //                 if (brIndex !== -1) {
        //                     if (currentKey) {
        //                         // If there was a previous key, use the text after <br> as its value
        //                         const key = currentKey.replace(':', '').trim();
        //                         const value = text.substring(brIndex + 4).trim(); // +4 to skip "<br>"
        //                         keyValuePairs[key] = value;
        //                         currentKey = null;
        //                     } else {
        //                         // Otherwise, treat it as a new key-value pair
        //                         const key = text.substring(0, brIndex).replace(':', '').trim();
        //                         const value = text.substring(brIndex + 4).trim(); // +4 to skip "<br>"
        //                         keyValuePairs[key] = value;
        //                     }
        //                 } else if (aTag && aTag.nextSibling && aTag.nextSibling.nodeName === "#text") {
        //                     // Check if <a> tag exists and has a text node sibling
        //                     const key = aTag.textContent.trim().replace(':', '');
        //                     keyValuePairs[key] = aTag.nextSibling.textContent.trim();
        //                 } else if (aTag) {
        //                     // Check if <a> tag exists
        //                     currentKey = aTag.textContent.trim().replace(':', '');
        //                 } else if (currentKey && pTag.textContent.trim() !== currentKey) {
        //                     // If there is a currentKey and the content is not the same as currentKey
        //                     const key = currentKey.replace(':', '').trim();
        //                     const value = pTag.textContent.trim();
        //                     keyValuePairs[key] = value;
        //                     currentKey = null;
        //                 } else if (!currentKey) {
        //                     // In the case where the currentKey does not exist
        //                     const key = pTag.textContent.trim().replace(':', '').trim();
        //                     currentKey = key;
        //                 }

        //             });
        //             return keyValuePairs;
        //         });

        //         // Clean up key-value pairs
        //         const cleanedKeyValuePairs = {};
        //         Object.keys(keyValuePairs).forEach(key => {
        //             let cleanedKey = key.replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove any HTML tags
        //             let cleanedValue = keyValuePairs[key].replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove any HTML tags
        //             cleanedKeyValuePairs[cleanedKey] = cleanedValue;
        //         });
        //         console.log(cleanedKeyValuePairs);
        //     }
        // }

    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await browser.close();
    }
};

getData();
