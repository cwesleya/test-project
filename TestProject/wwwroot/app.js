// Constants
const API_BASE_URL = '/api/test';
const BROWSE_ENDPOINT = `${API_BASE_URL}/browse`;
const SEARCH_ENDPOINT = `${API_BASE_URL}/search`;
const FILE_BROWSER_ID = 'file-browser';
const SEARCH_INPUT_ID = 'search';

// document.addEventListener('DOMContentLoaded', () => {
//     browseDirectory();
// });

function browseDirectory(path = '') {
    let url = BROWSE_ENDPOINT;
    if (path) {
        url += `?path=${encodeURIComponent(path)}`;
    }

    fetch(url)
        .then(handleResponse)
        .then(displayDirectoryContents)
        .catch(handleError);
}

function searchFiles() {
    const query = document.getElementById(SEARCH_INPUT_ID).value.trim();
    if (query === '') {
        // If the search input is empty or contains only whitespace, browse the root directory
        browseDirectory();
    } else {
        fetch(`${SEARCH_ENDPOINT}?query=${encodeURIComponent(query)}`)
            .then(handleResponse)
            .then(displaySearchResults)
            .catch(handleError);
    }
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