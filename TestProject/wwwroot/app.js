/*
paging examples:
browseDirectory('', 1, 0); // Fetch all directories and files
searchFiles(1, 0); // Fetch all search results
pageSize = 0 means fetch all results
*/

// Constants
const API_BASE_URL = '/api/test';
const BROWSE_ENDPOINT = `${API_BASE_URL}/browse`;
const SEARCH_ENDPOINT = `${API_BASE_URL}/search`;
const DELETE_ENDPOINT = `${API_BASE_URL}/delete`;
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload`;
const FILE_BROWSER_ID = 'file-browser';
const SEARCH_INPUT_ID = 'search';
const DEFAULT_PAGE_SIZE = 25;
const SORT_ASC = 'asc';
const SORT_DESC = 'desc';

/**
 * Handles the browser's back and forward navigation.
 */
window.addEventListener('popstate', () => {
    handleNavigation();
});

/**
 * Handles the initial page load and adds table sort listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
    addTableSortListeners();

    // Add event listener for file upload
    document
        .getElementById('upload')
        .addEventListener('click', uploadFile);
});

/**
 * Reads the current URL parameters and updates the application state accordingly.
 */
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

/**
 * Updates the URL with the given parameters.
 * @param {Object} params - The parameters to update in the URL.
 */
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

/**
 * Fetches and displays the contents of the specified directory.
 * @param {string} [path=''] - The path of the directory to browse.
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [pageSize=DEFAULT_PAGE_SIZE] - The number of items per page.
 */
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

/**
 * Searches for files matching the query and displays the results.
 * @param {string} query - The search query.
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [pageSize=DEFAULT_PAGE_SIZE] - The number of items per page.
 */
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

/**
 * Handles the response from the fetch call.
 * @param {Response} response - The response from the fetch call.
 * @returns {Promise<Object>} The JSON data from the response.
 * @throws {Error} If the response is not OK.
 */
function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * Displays the contents of the directory.
 * @param {Object} data - The data containing directories and files.
 */
function displayDirectoryContents(data) {
    const fileBrowser = document.getElementById(FILE_BROWSER_ID);
    fileBrowser.innerHTML = '';

    const table = document.createElement('table');
    table.id = 'fileTable';
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Name</th><th>Type</th><th>Size</th><th>Actions</th>';
    table.appendChild(headerRow);

    if (data.directories) {
        data.directories.forEach(dir => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${dir.name}</td><td>Directory</td><td>-</td><td><button onclick="confirmDelete('${dir.name}', true)">Delete</button></td>`;
            row.onclick = () => browseDirectory(`${dir.path}`);
            table.appendChild(row);
        });
    }

    if (data.files) {
        data.files.forEach(file => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${file.name}</td><td>File</td><td>${file.size}</td><td><button onclick="deleteItem('${file.name}', false)">Delete</button></td>`;
            table.appendChild(row);
        });
    }

    fileBrowser.appendChild(table);
    addTableSortListeners();
}

/**
 * Displays the search results.
 * @param {Array<Object>} data - The data containing the search results.
 */
function displaySearchResults(data) {
    const fileBrowser = document.getElementById(FILE_BROWSER_ID);
    fileBrowser.innerHTML = '';

    const table = document.createElement('table');
    table.id = 'fileTable';
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Name</th><th>Type</th><th>Size</th><th>Actions</th>';
    table.appendChild(headerRow);

    data.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${file.name}</td><td>File</td><td>${file.size}</td><td><button onclick="deleteItem('${file.name}', false)">Delete</button></td>`;
        table.appendChild(row);
    });

    fileBrowser.appendChild(table);
    addTableSortListeners();
}

/**
 * Handles errors from the fetch call.
 * @param {Error} error - The error object.
 */
function handleError(error) {
    console.error('Error:', error);
}

/**
 * Confirms deletion of a file or directory.
 * @param {string} name - The name of the file or directory.
 * @param {boolean} isDirectory - Whether the item is a directory.
 */
function confirmDelete(name, isDirectory) {
    if (isDirectory) {
        if (confirm('Are you sure you want to delete this directory and all its contents?')) {
            deleteItem(name, true);
        }
    } else {
        deleteItem(name, false);
    }
}

/**
 * Deletes a file or directory.
 * @param {string} name - The name of the file or directory.
 * @param {boolean} isDirectory - Whether the item is a directory.
 */
function deleteItem(name, isDirectory) {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const fullName = path ? `${path}/${name}` : name;
    const url = `${DELETE_ENDPOINT}?name=${encodeURIComponent(fullName)}&isDirectory=${isDirectory}`;

    fetch(url, { method: 'DELETE' })
        .then(handleResponse)
        .then(() => {
            alert(isDirectory ? 'Directory deleted successfully.' : 'File deleted successfully.');
            handleNavigation();
        })
        .catch(handleError);
}

/**
 * Uploads a selected file to the server.
 */
function uploadFile() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || ''; // Default to HomeDirectory if path is not specified
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch(UPLOAD_ENDPOINT + (path ? `?path=${encodeURIComponent(path)}` : ''), {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                alert('File uploaded successfully!');
                handleNavigation();
            } else {
                alert('Failed to upload file.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during the upload.');
        });
}

// Event listener for search input
document.getElementById(SEARCH_INPUT_ID).addEventListener('input', () => {
    const query = document.getElementById(SEARCH_INPUT_ID).value.trim();
    searchFiles(query);
});

/**
 * Adds event listeners to table headers for sorting.
 */
function addTableSortListeners() {
    const table = document.getElementById('fileTable');
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach((th, index) => {
        th.addEventListener('click', () => {
            sortRows(th, index + 1);
        });
    });
}

/**
 * Sorts the rows of the table based on the clicked column.
 * @param {HTMLElement} th - The table header element.
 * @param {number} column - The column index to sort by.
 */
function sortRows(th, column) {
    const table = document.getElementById('fileTable');
    const bodyRows = Array.from(table.querySelectorAll('tr:nth-child(n+2)'));
    const compareValues = (a, b) => a > b ? -1 : a < b ? 1 : 0;
    const asc = th.getAttribute('sort') === SORT_ASC;

    th.setAttribute('sort', asc ? SORT_DESC : SORT_ASC);

    bodyRows.sort((r1, r2) => {
        const t1 = r1.querySelector(`td:nth-child(${column})`).textContent;
        const t2 = r2.querySelector(`td:nth-child(${column})`).textContent;

        return compareValues(
            parseIntIfNum(asc ? t1 : t2),
            parseIntIfNum(asc ? t2 : t1)
        );
    });

    bodyRows.forEach(row => table.appendChild(row));
}

/**
 * Parses a value to an integer if it is a number, otherwise returns the value as is.
 * @param {string} value - The value to parse.
 * @returns {number|string} The parsed integer or the original value.
 */
function parseIntIfNum(value) {
    return isNaN(value) ? value : parseInt(value, 10);
}