import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

// Add stealth plugin to puppeteer to avoid detection
puppeteer.use(StealthPlugin());

const getData = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Custom delay function
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

  try {
    // Navigate to the target page
    await page.goto("https://www.marinetraffic.com/en/ais/home/centerx:6.7/centery:56.4/zoom:9", {
      waitUntil: "domcontentloaded",
    });

    // Wait for and click the consent button
    const consentButtonSelector = "#qc-cmp2-ui > div.qc-cmp2-footer.qc-cmp2-footer-overlay.qc-cmp2-footer-scrolled > div > button.css-1yp8yiu";
    await page.waitForSelector(consentButtonSelector, { timeout: 20000 });
    await page.click(consentButtonSelector);
    console.log("Clicked the consent button.");

    // Wait for and click the search button
    const searchButtonSelector = "#searchMarineTraffic";
    await page.waitForSelector(searchButtonSelector, { timeout: 10000 });
    await page.click(searchButtonSelector);
    console.log("Clicked the search button.");

    // Wait for the input field and type the search text
    const inputSelector = "#searchMT";
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    const searchText = "ever ethic";
    await page.type(inputSelector, searchText);
    console.log(`Typed "${searchText}" into the search input.`);

    const dialogSelector = "body > div.MuiDialog-root.MuiModal-root.css-126xj0f > div.MuiDialog-container.MuiDialog-scrollPaper.css-16u656j > div";
    await page.waitForSelector(dialogSelector, { timeout: 10000 });
    console.log("Dialog box rendered.");

    await delay(3000);

    // Extract the links
    const links = await page.evaluate((selector) => {
      const anchorTags = Array.from(document.querySelectorAll(`${selector} a`));
      return anchorTags.map(a => ({
        href: a.href,
        text: a.textContent.trim(),
      }));
    }, dialogSelector);

    console.log("Extracted links:", links);

    // Save the links to a file
    fs.writeFileSync('extracted_links.json', JSON.stringify(links, null, 2));
    console.log("Links saved to extracted_links.json.");

    // If links are found, proceed with each link
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      console.log(`Opening link ${i + 1}/${links.length}:`, link.href);

      try {
        
        const newPage = await browser.newPage();
        await newPage.goto(link.href, { waitUntil: 'networkidle0' });

        const shipIdMatch = link.href.match(/shipid:(\d+)/);
        if (shipIdMatch && shipIdMatch[1]) {
          const shipId = shipIdMatch[1];
          console.log("Extracted shipId:", shipId);

          const newPageUrl = newPage.url();
          console.log("Navigated to URL:", newPageUrl);

          const mmsi = newPageUrl.match(/mmsi:(\d+)/)[1];
          const imo = newPageUrl.match(/imo:(\d+)/)[1];

        //   await delay(3000);

          const positionApiUrl = `https://www.marinetraffic.com/en/vessels/${shipId}/position`;
          const voyageApiUrl = `https://www.marinetraffic.com/en/vessels/${shipId}/voyage`;
          const portDetailsApi = (portCode) => `https://www.marinetraffic.com/en/ports/${portCode}`;

          // Fetch position data
          const positionData = await fetchApiData(browser, positionApiUrl);
          console.log("Fetched position data.");

          // Fetch voyage data
          const voyageData = await fetchApiData(browser, voyageApiUrl);
          console.log("Fetched voyage data.");

          // Fetch arrival and departure port data if available
          const arrivalPortData = voyageData?.arrivalPortId ? await fetchApiData(browser, portDetailsApi(voyageData.arrivalPortId)) : {};
          const departurePortData = voyageData?.departurePortId ? await fetchApiData(browser, portDetailsApi(voyageData.departurePortId)) : {};

          const vesselDetails = { positionData, voyageData, arrivalPortData, departurePortData, mmsi, imo };

          fs.writeFileSync(`positionData_${i + 1}.json`, JSON.stringify(vesselDetails, null, 2));
          console.log(`Vessel details saved to positionData_${i + 1}.json.`);
        } else {
          console.log("shipId not found in the URL.");
        }

        await newPage.close(); // Close the tab after processing the page

      } catch (err) {
        console.error(`Error processing link ${i + 1}:`, err);
      }
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
};

// Function to fetch data from a given API URL
const fetchApiData = async (browser, url) => {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const data = JSON.parse(await preTagSelectorFunction(page));
    await page.close();
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return {}; // Return empty object if there's an error
  }
};

// Function to extract data from pre tags
const preTagSelectorFunction = async (page) => {
  const preTagSelector = 'pre';
  await page.waitForSelector(preTagSelector, { timeout: 10000 });
  const preTagContent = await page.$eval(preTagSelector, (el) => el.textContent);
  return preTagContent;
};

// Execute the getData function
getData();
