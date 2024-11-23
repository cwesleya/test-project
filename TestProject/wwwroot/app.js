// Constants
const API_BASE_URL = '/api/test';
const BROWSE_ENDPOINT = `${API_BASE_URL}/browse`;
const SEARCH_ENDPOINT = `${API_BASE_URL}/search`;
const FILE_BROWSER_ID = 'file-browser';
const SEARCH_INPUT_ID = 'search';
const DEFAULT_PAGE_SIZE = 25;

/*
examples:
browseDirectory('', 1, 0); // Fetch all directories and files
searchFiles(1, 0); // Fetch all search results
pageSize = 0 means fetch all results
*/

function browseDirectory(path = '', page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const url = `${BROWSE_ENDPOINT}?page=${page}&pageSize=${pageSize}`;

    fetch(url + (path ? `&path=${encodeURIComponent(path)}` : ''))
        .then(handleResponse)
        .then(displayDirectoryContents)
        .catch(handleError);
}

function searchFiles(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const query = document.getElementById(SEARCH_INPUT_ID).value.trim();
    let url = `${SEARCH_ENDPOINT}?page=${page}&pageSize=${pageSize}`;

    fetch(url + (query ? `&query=${encodeURIComponent(query)}` : ''))
        .then(handleResponse)
        .then(displaySearchResults)
        .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function displayDirectoryContents(data) {
    const fileBrowser = document.getElementById(FILE_BROWSER_ID);
    fileBrowser.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Name</th><th>Type</th><th>Size</th>';
    table.appendChild(headerRow);
    
    if (data.directories) {
        data.directories.forEach(dir => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${dir.name}</td><td>Directory</td><td>-</td>`;
            row.onclick = () => browseDirectory(`${path}/${dir.name}`);
            table.appendChild(row);
        });
    }

    if (data.files) {
        data.files.forEach(file => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${file.name}</td><td>File</td><td>${file.size}</td>`;
            table.appendChild(row);
        });
    }

    fileBrowser.appendChild(table);
}

function displaySearchResults(data) {
    const fileBrowser = document.getElementById(FILE_BROWSER_ID);
    fileBrowser.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Name</th><th>Type</th><th>Size</th>';
    table.appendChild(headerRow);

    data.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${file.name}</td><td>File</td><td>${file.size}</td>`;
        table.appendChild(row);
    });

    fileBrowser.appendChild(table);
}

function handleError(error) {
    console.error('Error:', error);
}