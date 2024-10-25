import puppeteer from "puppeteer";
import fs from "fs";

const getData = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://console.eximtradedata.com/", {
      waitUntil: "domcontentloaded",
    });

    // Wait for the email and password input selectors to be available
    await page.waitForSelector('#txtUser');
    await page.waitForSelector('#txtPWD');

    // Replace 'your-email' and 'your-password' with the actual email and password
    const email = "mitulb@intemo.tech";
    const password = "!lKytMkjJ@0849";

    // Type the email and password into their respective input fields
    await page.type('#txtUser', email);
    await page.type('#txtPWD', password);

    // Click the login button
    await page.click('#BtnLogin');

    // Wait for OTP popup to appear
    await page.waitForSelector('#MyPopup > div > div', { visible: true });

    console.log("Please enter the OTP manually into the input field within the next 20 seconds...");

    // Wait for 20 seconds for manual OTP entry
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 20000); // Wait for 20 seconds
      });
    });

    console.log("Continuing after manual OTP entry...");

    // Click the verify button
    await page.click('#btnShowPopup');

    console.log("OTP verification initiated.");

    // Wait for navigation to the next page after OTP verification
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("Navigation completed.");

    // Click on the specified "a" link
    await page.waitForSelector('#main-form > div > div.advance-search > a', { timeout: 30000 }); // wait for up to 30 seconds
    await page.click('#main-form > div > div.advance-search > a');

    console.log("Clicked on the 'a' link.");

    // Wait for the popup to appear
    await page.waitForSelector('#advanceModal', { timeout: 30000 });
    console.log("Popup appeared.");

    // Click on the dropdown trigger to open the dropdown
    await page.waitForSelector('.search-country', { timeout: 30000 });
    await page.click('.search-country');
    console.log("Dropdown clicked.");

    // Wait for the country dropdown options to appear
    await page.waitForSelector('#countryadvance li#India', { timeout: 30000 });

    // Select "India" from the country dropdown by clicking on it
    await page.evaluate(() => {
      const countryOption = document.querySelector('#countryadvance li#India a');
      if (countryOption) {
        countryOption.click();
      }
    });

    console.log("Selected 'India' from the country dropdown.");

    // Wait for the data type options to be populated
    await page.waitForFunction(() => {
      const selectElement = document.querySelector('#ddlasdatatype');
      return selectElement && selectElement.options.length > 1;
    }, { timeout: 30000 });

    console.log("Data type options populated.");

    // Wait for the <select> element to be available
    await page.waitForSelector('#ddlasdatatype', { timeout: 30000 });

    // Manually select the desired option by simulating a user action
    await page.evaluate(() => {
      const selectElement = document.querySelector('#ddlasdatatype');
      selectElement.value = '1';
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify the value of the select element
    const selectedValue = await page.evaluate(() => {
      return document.querySelector('#ddlasdatatype').value;
    });
    console.log("Selected value in the dropdown:", selectedValue);

    if (selectedValue !== '1') {
      throw new Error("Failed to set the select value.");
    } 

    console.log("Selected 'Trade Reporting Export Data' from the dropdown.");

    // Wait for the date input field to be available
    await page.waitForSelector('#txtdtrgto', { timeout: 30000 });

    // Set the value of the date input field
    await page.evaluate(() => {
      document.querySelector('#txtdtrgto').value = '2024-05-31';
    });

    console.log("Date input value set to '2024-05-31'.");

    // Set the value of the date input field
    await page.evaluate(() => {
      document.querySelector('#txtdtrgfrom').value = '2023-05-31';
    });

    console.log("Date input value set to '2023-05-31'.");

    // Wait for the button to be available and clickable
    await page.waitForFunction(() => {
      const button = document.querySelector('input[name="btnadvance"]');
      if (button) {
        const { visibility, display, opacity } = window.getComputedStyle(button);
        return (visibility !== 'hidden' && display !== 'none' && opacity > 0 && !button.disabled);
      }
      return false;
    }, { timeout: 30000 });

    // Click the button
    await page.evaluate(() => {
      const button = document.querySelector('input[name="btnadvance"]');
      button.click();
    });

    console.log("Clicked on the advance button.");

    // Wait for the new page or section to load/render
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Wait for the select element to be available
    await page.waitForSelector('#ddl_rows', { timeout: 30000 });

    // Manually select the desired option by simulating a user action
    await page.evaluate(() => {
      const selectElement = document.querySelector('#ddl_rows');
      selectElement.value = '4uSnH72nliUBFSJgOjyfwQ==';
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify the value of the select element
    const selectedValueRows = await page.evaluate(() => {
      return document.querySelector('#ddl_rows').value;
    });
    console.log("Selected value in the rows dropdown:", selectedValueRows);

    if (selectedValueRows !== '4uSnH72nliUBFSJgOjyfwQ==') {
      throw new Error("Failed to set the rows select value.");
    }

    console.log("Selected '100' rows from the dropdown.");

     // Wait for 10 seconds for manual OTP entry
     await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000); // Wait for 10 seconds
      });
    });

    // Wait for the table to render
    await page.waitForSelector('#tbl_data > table', { timeout: 30000 });

    // Extract data from the table
    const tableData = await page.evaluate(() => {
      const table = document.querySelector('#tbl_data > table');
      const headers = Array.from(table.querySelectorAll('thead tr th'))
        .slice(2) // Omit the first two 'th'
        .map(th => th.innerText.trim());

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const data = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
          .slice(1) // Omit the first 'td'
          .map(td => td.innerText.trim());
        return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
      });

      return data;
    });

    console.log("Extracted table data:", JSON.stringify(tableData, null, 2));

    // Save the data as JSON
    fs.writeFileSync('import-data.json', JSON.stringify(tableData, null, 2));

    console.log("Process completed and data saved as JSON.");

    // Close the browser after actions are complete
    await browser.close();

  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
  }
};

getData();
