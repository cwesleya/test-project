// Constants
const API_BASE_URL = '/api/test';
const BROWSE_ENDPOINT = `${API_BASE_URL}/browse`;
const SEARCH_ENDPOINT = `${API_BASE_URL}/search`;
const FILE_BROWSER_ID = 'file-browser';
const SEARCH_INPUT_ID = 'search';
const DEFAULT_PAGE_SIZE = 25;

/*
paging examples:
browseDirectory('', 1, 0); // Fetch all directories and files
searchFiles(1, 0); // Fetch all search results
pageSize = 0 means fetch all results
*/

/* option to call api on pageload
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
});
*/

window.addEventListener('popstate', () => {
    handleNavigation();
});

function handleNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const query = urlParams.get('query') || '';
    const page = parseInt(urlParams.get('page')) || 1;
    const pageSize = parseInt(urlParams.get('pageSize')) || DEFAULT_PAGE_SIZE;

    if (query) {
        searchFiles(query, page, pageSize);
    } else {
        browseDirectory(path, page, pageSize);
    }
}

function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

function browseDirectory(path = '', page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    updateURL({ path, page, pageSize });

    let url = `${BROWSE_ENDPOINT}?page=${page}&pageSize=${pageSize}`;
    if (path) {
        url += `&path=${encodeURIComponent(path)}`;
    }

    fetch(url)
        .then(handleResponse)
        .then(displayDirectoryContents)
        .catch(handleError);
}

// NOTE: directory will be returned if it has a file containing the search query
function searchFiles(query, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    if (query) {
        updateURL({ query, page, pageSize });

        let url = `${SEARCH_ENDPOINT}?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;

        fetch(url)
            .then(handleResponse)
            .then(displaySearchResults)
            .catch(handleError);
    } else {
        updateURL({ page, pageSize });
        browseDirectory('', page, pageSize);
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
            row.onclick = () => browseDirectory(`${dir.path}`);
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

// Event listener for search input
document.getElementById(SEARCH_INPUT_ID).addEventListener('input', () => {
    const query = document.getElementById(SEARCH_INPUT_ID).value.trim();
    searchFiles(query);
});