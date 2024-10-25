// Import necessary modules
import { readFile } from 'fs/promises';

// Function to make POST request
async function postData(apiUrl, data) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to loop through the array and make the API call
async function loopPostRequests(apiUrl, dataArray) {
    for (let i = 400; i < 800; i++) {
        await postData(apiUrl, {vesselName : dataArray[i].name});
        console.log(`Processed item ${i + 1} of ${dataArray.length}`);
    }
}

// Main function to read the JSON file and start the process
async function main() {
    const apiUrl = 'https://demo.api.vesselais.intemo.tech/vessel-details';

    try {
        const data = await readFile('vesseldetails.json', 'utf-8');
        const dataArray = JSON.parse(data); // Convert JSON string to array

        await loopPostRequests(apiUrl, dataArray);
    } catch (error) {
        console.error('Error reading or processing the file:', error);
    }
}

// Call the main function
main();
