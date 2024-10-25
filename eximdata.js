import puppeteer from "puppeteer";
import fs from "fs";

const getData = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const mappedData = []; // Declare mappedData array here

  try {
    console.log("Navigating to login page...");
    await page.goto("https://console.eximtradedata.com/", {
      waitUntil: "domcontentloaded",
    });

    // Wait for the email and password input selectors to be available
    console.log("Waiting for email and password input fields...");
    await page.waitForSelector('#txtUser');
    await page.waitForSelector('#txtPWD');

    const email = "mitulb@intemo.tech";
    const password = "!lKytMkjJ@0849";

    console.log("Entering email and password...");
    await page.type('#txtUser', email);
    await page.type('#txtPWD', password);

    console.log("Clicking the login button...");
    await page.click('#BtnLogin');

    console.log("Waiting for OTP popup...");
    await page.waitForSelector('#MyPopup > div > div', { visible: true });

    console.log("Please enter the OTP manually into the input field within the next 20 seconds...");
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 20000); // Wait for 20 seconds
      });
    });

    console.log("Continuing after manual OTP entry...");
    console.log("Clicking the verify button...");
    await page.click('#btnShowPopup');

    console.log("Waiting for navigation to complete after OTP verification...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("Clicking on the specified 'a' link...");
    await page.waitForSelector('#main-form > div > div.advance-search > a', { timeout: 30000 });
    await page.click('#main-form > div > div.advance-search > a');

    console.log("Waiting for the popup to appear...");
    await page.waitForSelector('#advanceModal', { timeout: 30000 });

    console.log("Clicking on the dropdown to open the country list...");
    await page.waitForSelector('.search-country', { timeout: 30000 });
    await page.click('.search-country');

    console.log("Waiting for country dropdown options to appear...");
    await page.waitForSelector('#countryadvance li#India', { timeout: 30000 });

    console.log("Selecting 'India' from the country dropdown...");
    await page.evaluate(() => {
      const countryOption = document.querySelector('#countryadvance li#India a');
      if (countryOption) {
        countryOption.click();
      }
    });

    console.log("Waiting for the data type options to be populated...");
    await page.waitForFunction(() => {
      const selectElement = document.querySelector('#ddlasdatatype');
      return selectElement && selectElement.options.length > 1;
    }, { timeout: 30000 });

    console.log("Waiting for the data type select element...");
    await page.waitForSelector('#ddlasdatatype', { timeout: 30000 });

    console.log("Selecting 'Trade Reporting Export Data' from the dropdown...");
    await page.evaluate(() => {
      const selectElement = document.querySelector('#ddlasdatatype');
      selectElement.value = '2';
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const selectedValue = await page.evaluate(() => {
      return document.querySelector('#ddlasdatatype').value;
    });
    console.log("Selected value in the dropdown:", selectedValue);

    if (selectedValue !== '2') {
      throw new Error("Failed to set the select value.");
    }

    console.log("Waiting for the date input field to be available...");
    await page.waitForSelector('#txtdtrgto', { timeout: 30000 });

    console.log("Setting the date input field value to '2024-05-31'...");
    await page.evaluate(() => {
      document.querySelector('#txtdtrgto').value = '2024-05-31';
    });

    console.log("Setting the date input field value to '2023-05-31'...");
    await page.evaluate(() => {
      document.querySelector('#txtdtrgfrom').value = '2023-05-31';
    });

    console.log("Waiting for the advance button to be available and clickable...");
    await page.waitForFunction(() => {
      const button = document.querySelector('input[name="btnadvance"]');
      if (button) {
        const { visibility, display, opacity } = window.getComputedStyle(button);
        return (visibility !== 'hidden' && display !== 'none' && opacity > 0 && !button.disabled);
      }
      return false;
    }, { timeout: 30000 });

    console.log("Clicking the advance button...");
    await page.evaluate(() => {
      const button = document.querySelector('input[name="btnadvance"]');
      button.click();
    });

    console.log("Waiting for the new page or section to load...");
    await page.waitForSelector('#importer_exporter_tab', { timeout: 30000 });

    console.log("Clicking on the #importer-exporter-tab button...");
    await page.click('#importer-exporter-tab');

    console.log("Waiting for the #ddl_rows_importer_exporter select element...");
    await page.waitForSelector('#ddl_rows_importer_exporter', { timeout: 30000 });

    console.log("Selecting '50' rows from the dropdown...");
    await page.evaluate(() => {
      const selectElement = document.querySelector('#ddl_rows_importer_exporter');
      selectElement.value = '50';
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const selectedValueRows = await page.evaluate(() => {
      return document.querySelector('#ddl_rows_importer_exporter').value;
    });
    console.log("Selected value in the rows dropdown:", selectedValueRows);

    if (selectedValueRows !== '50') {
      throw new Error("Failed to set the rows select value.");
    }

    let hasNextPage = true;
    let pageNum = 1;

    while (hasNextPage) {
      console.log(`Extracting data from page ${pageNum}...`);

      // Extract table data
      console.log("Waiting for the table to render...");
      await page.waitForSelector('#DivImExList > table', { timeout: 100000 });

      console.log("Extracting table data...");
      const tableData = await page.evaluate(() => {
        const table = document.querySelector('#DivImExList > table');
        const headings = Array.from(table.querySelectorAll('thead tr:nth-child(2) th'))
          .map((th, index) => index !== 1 && index !== 2 ? th.innerText.trim().replaceAll(" ", "_") : null)
          .filter(th => th !== null);

        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
          const cells = Array.from(tr.querySelectorAll('td')).map((td, index) => {
            if (index === 3) {
              return td.querySelector('a') ? td.querySelector('a').innerText.trim() : td.innerText.trim();
            }
            return index !== 1 && index !== 2 ? td.innerText.trim() : null;
          }).filter(td => td !== null);
          const rowData = {};
          headings.forEach((heading, index) => {
            if (heading === "Importer_Name")
               rowData["Importer_List"] = cells[index] || 'N/A'
            else
              rowData[heading] = cells[index] || 'N/A'; // Use 'N/A' as fallback if cell is empty
          });
          return rowData;
        });

        // Filter out rows where exportter list is 'N/A'
        return rows.filter(row => row['Importer_List'] !== 'N/A');
      });

      console.log("Filtered table data:", tableData);

      console.log("Constructing URLs...");
      const urls = tableData.map(row => {
        const companyName = encodeURIComponent(row['Importer_List']);
        return `https://console.eximtradedata.com/company-profile.aspx?recval=${companyName}&sumforbuysup=Buyer%20List&sumforImEx=Importer%20List`;
      });

      console.log("Constructed URLs:", urls);

      console.log("Opening new tabs for each URL and gathering additional data...");
      for (let i = 0; i < tableData.length; i++) {
        const url = urls[i];
        try {
          const newPage = await browser.newPage();
          await newPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Set a timeout for navigation
          await newPage.waitForSelector("#DivHsCodewise > table", { timeout: 30000 }); // Set a timeout for selector

          console.log("Extracting company data...");
          const companyData = await newPage.evaluate(() => {
            const totalShipments = document.querySelector('#txtshipment')?.innerText.trim() || 'N/A';
            const totalValue = document.querySelector('#txttotal')?.innerText.trim() || 'N/A';
            const shipments = document.querySelector('#txtshipment1')?.innerText.trim() || 'N/A';
            const buyer = document.querySelector('#txtbuysupvalue')?.innerText.trim() || 'N/A';
            const country = document.querySelector('#txtcountry')?.innerText.trim() || 'N/A';
            const port = document.querySelector('#txtport')?.innerText.trim() || 'N/A';

            return { totalShipments, totalValue, shipments, buyer, country, port };
          });

          console.log("Extracting company table data...");
          const companyTableData = await newPage.evaluate(() => {
            const table = document.querySelector('#DivHsCodewise > table');
            const headings = Array.from(table.querySelectorAll('thead tr:nth-child(2) th'))
              .map(th => th.innerText.trim().replaceAll(" ", "_"));

            const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
              const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
              const rowData = {};
              headings.forEach((heading, index) => {
                rowData[heading] = cells[index] || 'N/A'; // Use 'N/A' as fallback if cell is empty
              });
              return rowData;
            });
            return rows;
          });

          console.log("Company data:", companyData);
          console.log("Company table data:", companyTableData);

          await newPage.close();

          const combinedData = {
            ...tableData[i],
            ...companyData,
            HsCodeDetails: companyTableData
          };

          mappedData.push(combinedData);

          // Append data to the exportData.json file
          const outputData = {
            mappedData: [combinedData],
          };

          let existingData = [];
          if (fs.existsSync('importData.json')) {
            existingData = JSON.parse(fs.readFileSync('importData.json', 'utf8')).mappedData || [];
          }

          existingData.push(combinedData);
          fs.writeFileSync('importData.json', JSON.stringify({ mappedData: existingData }, null, 2));
          console.log(`Data for company ${combinedData['Importer_List']} appended to importData.json.`);

        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          // Continue to the next URL without breaking the loop
          continue;
        }
      }

      // Check if there is a next page
      const nextPageButton = await page.$('#li_next_importer:not(.disabled)');
      console.log(pageNum);
      if (nextPageButton || pageNum == 65) {
        console.log("Clicking on 'Next' button to load next page...");

        await nextPageButton.click();

        await page.waitForFunction(() => {
          const section = document.querySelector('#importer-exporter > section > div > div.row.align-items-center.mt-3.position-relative > section');
          return section && window.getComputedStyle(section).display === 'none';
        }, { timeout: 50000 });

        pageNum++;
      } else {
        console.log("No more pages to load. Exiting loop.");
        hasNextPage = false;
      }
    }

    console.log("Closing browser...");
    await browser.close();

  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
  }
};

getData();
