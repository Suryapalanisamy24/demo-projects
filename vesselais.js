import puppeteer from "puppeteer";
import fs from "fs";

const getData = async () => {
    const browser = await puppeteer.launch({
        headless: true, // Set to true for production
        defaultViewport: null,
    });

    const page = await browser.newPage();

    try {
        await page.goto("https://www.myshiptracking.com/vessels/ym-unicorn-mmsi-416464000-imo-9462732", {
            waitUntil: "domcontentloaded",
        });

        // Wait for the element you want to select (table)
        const basicDetailsSelector = '#vsl-info-card > table';
        await page.waitForSelector(basicDetailsSelector);

        // Extract data from the table and map th to td
        const tableData = await page.$$eval(`${basicDetailsSelector} tr`, (rows) => {
            const data = {};
            rows.forEach((row) => {
                const title = row.querySelector('th')?.innerText.trim();
                const value = row.querySelector('td')?.innerText.trim();
                if (title && value) {
                    data[title] = value;
                }
            });
            return data;
        });

        // Selector for origin and destination data
        const portDetailsSelector = '.vpage-trip-slider .flex-grow-1.w-50-force.myst-arrival-cont';
        await page.waitForSelector(portDetailsSelector);

        // Extract port data (origin and destination)
        const portData = await page.$$eval(portDetailsSelector, (elements) => {
            const ports = [];
            elements.forEach((element, index) => {
                const port = {};

                // Extract port name from h3 tag
                const portName = element.querySelector('h3')?.innerText.trim() || null;
                
                // Extract UNLOC code from 'flag-pos' div
                const unlocCode = element.querySelector('.flag-pos')?.innerText.trim() || null;

                // Extract date information from small tag and span
                const key = element.querySelector('small')?.innerText.trim() || null;
                const date = element.querySelector('.px-1 .line')?.innerText.trim() || null;

                if (portName && unlocCode && key && date) {
                    port.portName = portName;
                    port.unlocCode = unlocCode;
                    port[key] = date;
                    ports.push(port);
                }
            });
            return {
                origin: ports[0] || null, 
                destination: ports[1] || null 
            };
        });


         // vessel Data
         const vesselDetailsSelector = '#ft-trip > div:nth-child(1) > div > div.card-body.p-2.p-sm-3 > div.d-flex.border-top.flex-column.flex-sm-row.pt-sm-2.mt-3 > div.p-sm-2.mt-3.mt-sm-0.flex-fill > table';
         await page.waitForSelector(basicDetailsSelector);
         const vesselData = await page.$$eval(`${vesselDetailsSelector} tr`, (rows) => {
             const data = {};
             rows.forEach((row) => {
                 const title = row.querySelector('th')?.innerText.trim();
                 const value = row.querySelector('td')?.innerText.trim();
                 if (title && value) {
                     data[title] = value;
                 }
             });
             return data;
         });


         // locationData
         const locationDataSelector = '#ft-position > div > div.card-body.p-2.p-sm-4.position-relative.bg-transparent > table';
         await page.waitForSelector(basicDetailsSelector);
         const locationData = await page.$$eval(`${locationDataSelector} tr`, (rows) => {
             const data = {};
             rows.forEach((row) => {
                 const title = row.querySelector('th')?.innerText.trim();
                 const value = row.querySelector('td')?.innerText.trim();
                 if (title && value) {
                     data[title] = value;
                 }
             });
             return data;
         });


          // weather data
          const weatherDataSelector = '#ft-weather > div > div.card-body.d-flex.flex-column.p-2.p-sm-3 > table';
          await page.waitForSelector(basicDetailsSelector);
          const weatherData = await page.$$eval(`${weatherDataSelector} tr`, (rows) => {
              const data = {};
              rows.forEach((row) => {
                  const title = row.querySelector('th')?.innerText.trim();
                  const value = row.querySelector('td')?.innerText.trim();
                  if (title && value) {
                      data[title] = value;
                  }
              });
              return data;
          });


          // Wait for the table to load
        const portCallsSelector = '#ft-portcalls > div > div.card-body.table-responsive-sm.p-1.p-sm-3 > table';
        await page.waitForSelector(portCallsSelector);

        // Extract the table data by mapping th to td values for each row
        const portCallsData = await page.$$eval(`${portCallsSelector}`, (table) => {
            const rows = [];
            
            // Get table headers (from thead)
            const headers = Array.from(table[0].querySelectorAll('thead th')).map(header => header.innerText.trim());
            
            // Get table body rows and map values to headers
            table[0].querySelectorAll('tbody tr').forEach((row) => {
                const rowData = {};
                const tds = row.querySelectorAll('td');
                
                tds.forEach((td, index) => {
                    // Get the text value for each td and map it to the corresponding header
                    rowData[headers[index]] = td.innerText.trim();
                });

                rows.push(rowData);
            });

            return rows;
        });


           // Wait for the table to load
           const mostVisitedPortsSelector = '#ft-visitedports > div > div.card-body.table-responsive-sm.p-1.p-sm-3 > table';
           await page.waitForSelector(mostVisitedPortsSelector);
   
           // Extract the table data by mapping th to td values for each row
           const visitedPortData = await page.$$eval(`${mostVisitedPortsSelector}`, (table) => {
               const rows = [];
               
               // Get table headers (from thead)
               const headers = Array.from(table[0].querySelectorAll('thead th')).map(header => header.innerText.trim());
               
               // Get table body rows and map values to headers
               table[0].querySelectorAll('tbody tr').forEach((row) => {
                   const rowData = {};
                   const tds = row.querySelectorAll('td');
                   
                   tds.forEach((td, index) => {
                      if(index != 0)
                       rowData[headers[index]] = td.innerText.trim();
                   });
   
                   rows.push(rowData);
               });
   
               return rows;
           });


           const lastTripsSelector = '#ft-lasttrips > div > div.card-body.table-responsive-sm1.p-1.p-sm-3 > table';
           await page.waitForSelector(lastTripsSelector);
   
           // Extract the table data by mapping th to td values for each row
           const lastTripsData = await page.$$eval(`${lastTripsSelector}`, (table) => {
               const rows = [];
               
               // Get table headers (from thead)
               const headers = Array.from(table[0].querySelectorAll('thead th')).map(header => header.innerText.trim());
               
               // Get table body rows and map values to headers
               table[0].querySelectorAll('tbody tr').forEach((row) => {
                   const rowData = {};
                   const tds = row.querySelectorAll('td');
                   
                   tds.forEach((td, index) => {
                    if(index != 0)
                       rowData[headers[index]] = td.innerText.trim();
                   });
   
                   rows.push(rowData);
               });
   
               return rows;
           });



        // Combine table data with port data
        const combinedData = {
            ...tableData,
            portDetails: portData,
            vesselDetails: vesselData,
            locationDetails: locationData,
            weatherDetails: weatherData,
            lastPortCalls: portCallsData,
            mostVisitedPorts: visitedPortData,
            lastTrips: lastTripsData
        };

        // Save the extracted data to a JSON file
        const jsonFilePath = './aisData.json'; // Path where the JSON will be saved
        fs.writeFileSync(jsonFilePath, JSON.stringify(combinedData, null, 2)); // Pretty print with 2 spaces

        console.log("Extracted Data saved to", jsonFilePath);

    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await browser.close();
    }
};

getData();
