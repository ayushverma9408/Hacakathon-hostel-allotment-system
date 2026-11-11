/**
 * AllotmentPro - Main Application Logic
 * Handles file uploads, form interactions, and allocation process
 */

// Global state
const appState = {
  hostelData: null,
  participantData: null,
  allocationResults: null,
  isProcessing: false
};

// DOM Elements
const hostelFile = document.getElementById('hostelFile');
const participantFile = document.getElementById('participantFile');
const hostelStatus = document.getElementById('hostelStatus');
const participantStatus = document.getElementById('participantStatus');
const runBtn = document.getElementById('runBtn');
const progressArea = document.getElementById('progressArea');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const alertContainer = document.getElementById('alertContainer');
const downloadBtn = document.getElementById('downloadBtn');
const resultsTable = document.getElementById('resultsTable');
const allottedCount = document.getElementById('allottedCount');
const waitlistCount = document.getElementById('waitlistCount');
const resultsCount = document.getElementById('resultsCount');

// Drop zone elements
const hostelDropZone = document.getElementById('hostelDropZone');
const participantDropZone = document.getElementById('participantDropZone');

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // File input events
  hostelFile.addEventListener('change', (e) => handleFileSelect(e, 'hostel'));
  participantFile.addEventListener('change', (e) => handleFileSelect(e, 'participant'));

  // Drop zone events for hostel file
  hostelDropZone.addEventListener('dragover', (e) => handleDragOver(e, hostelDropZone));
  hostelDropZone.addEventListener('dragleave', (e) => handleDragLeave(e, hostelDropZone));
  hostelDropZone.addEventListener('drop', (e) => handleDrop(e, 'hostel', hostelDropZone));
  hostelDropZone.addEventListener('click', () => hostelFile.click());

  // Drop zone events for participant file
  participantDropZone.addEventListener('dragover', (e) => handleDragOver(e, participantDropZone));
  participantDropZone.addEventListener('dragleave', (e) => handleDragLeave(e, participantDropZone));
  participantDropZone.addEventListener('drop', (e) => handleDrop(e, 'participant', participantDropZone));
  participantDropZone.addEventListener('click', () => participantFile.click());

  // Run allocation button
  runBtn.addEventListener('click', handleRunAllocation);

  // Download button
  downloadBtn.addEventListener('click', handleDownload);

  // Prevent default drag behavior on document
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
}

/**
 * Handle drag over event
 */
function handleDragOver(e, dropZone) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('active');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e, dropZone) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('active');
}

/**
 * Handle file drop
 */
function handleDrop(e, fileType, dropZone) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('active');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    
    // Validate file type
    const validTypes = ['.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      showAlert(`Invalid file type. Please upload CSV or Excel files.`, 'error');
      return;
    }

    if (fileType === 'hostel') {
      hostelFile.files = files;
      processFile(file, 'hostel');
    } else if (fileType === 'participant') {
      participantFile.files = files;
      processFile(file, 'participant');
    }
  }
}

/**
 * Handle file selection from input
 */
function handleFileSelect(event, fileType) {
  const file = event.target.files[0];
  if (file) {
    processFile(file, fileType);
  }
}

/**
 * Process uploaded file
 */
function processFile(file, fileType) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      let data;

      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (extension !== '.csv') {
        showAlert('Only CSV files are supported right now. Export your spreadsheet as CSV and upload it again.', 'warning');
        return;
      }
      data = parseCSV(content);

      if (fileType === 'hostel') {
        appState.hostelData = data;
        hostelStatus.textContent = `✓ Loaded: ${file.name} (${data.length} rooms)`;
        showAlert(`Hostel data loaded: ${data.length} rooms`, 'success');
      } else if (fileType === 'participant') {
        appState.participantData = data;
        participantStatus.textContent = `✓ Loaded: ${file.name} (${data.length} participants)`;
        showAlert(`Participant data loaded: ${data.length} participants`, 'success');
      }

      // Enable run button if both files are loaded
      updateRunButtonState();
    } catch (error) {
      showAlert(`Error processing file: ${error.message}`, 'error');
      console.error('File processing error:', error);
    }
  };

  reader.onerror = () => {
    showAlert('Error reading file', 'error');
  };

  reader.readAsText(file);
}

/**
 * Parse CSV content
 */
function parseCSV(content) {
  const text = String(content ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ',') { row.push(field.trim()); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim()); field = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field.trim());
  if (row.some(value => value !== '')) rows.push(row);
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one data row.');
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/^\uFEFF/, ''));
  if (headers.some(h => !h)) throw new Error('CSV headers cannot be empty.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate column headers.');
  return rows.slice(1).map((values, index) => {
    if (values.length > headers.length) throw new Error(`CSV row ${index + 2} has more values than the header row.`);
    const record = {};
    headers.forEach((header, column) => { record[header] = values[column] ?? ''; });
    return record;
  });
}

function updateRunButtonState() {
  const canRun = appState.hostelData && appState.participantData && !appState.isProcessing;
  runBtn.disabled = !canRun;
}

/**
 * Handle run allocation
 */
async function handleRunAllocation() {
  if (!appState.hostelData || !appState.participantData) {
    showAlert('Please upload both files before running allocation', 'error');
    return;
  }

  appState.isProcessing = true;
  updateRunButtonState();
  progressArea.classList.remove('hidden');
  resultsSection.classList.add('hidden');

  try {
    // Simulate processing with progress updates
    updateProgress(0);
    await sleep(500);

    // Call allocation function
    const results = allocateParticipants(appState.hostelData, appState.participantData);
    
    updateProgress(100);
    await sleep(300);

    // Store results and display them
    appState.allocationResults = results;
    localStorage.setItem('allocationResults', JSON.stringify({ ...results, createdAt: new Date().toISOString() }));
    displayResults(results);

    showAlert('Allocation completed successfully!', 'success');
  } catch (error) {
    showAlert(`Allocation error: ${error.message}`, 'error');
    console.error('Allocation error:', error);
  } finally {
    appState.isProcessing = false;
    updateRunButtonState();
    setTimeout(() => {
      progressArea.classList.add('hidden');
    }, 1000);
  }
}

/**
 * Main allocation algorithm
 */
function allocateParticipants(hostelData, participantData) {
  if (typeof AllocationEngine === 'undefined' || typeof AllocationUtils === 'undefined') {
    throw new Error('Allocation engine failed to load. Refresh the page and try again.');
  }
  AllocationUtils.validateHostelData(hostelData);
  AllocationUtils.validateParticipantData(participantData);
  return new AllocationEngine(hostelData, participantData, AllocationStrategy.GENDER_FIRST).execute();
}

function displayResults(results) {
  const allResults = [...results.allotted, ...results.waitlist];
  
  // Update counts
  allottedCount.textContent = results.allotted.length;
  waitlistCount.textContent = results.waitlist.length;
  resultsCount.textContent = `${allResults.length} participants processed`;

  // Clear previous results
  resultsTable.innerHTML = '';

  // Populate table
  allResults.forEach((result) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-outline-variant hover:bg-surface-container-high transition-colors';
    
    const statusColor = result.status === 'Allotted' ? 'text-secondary' : 'text-error';
    
    row.innerHTML = `
      <td class="px-md py-sm text-body-sm text-on-surface">${escapeHtml(result.name)}</td>
      <td class="px-md py-sm text-body-sm ${statusColor} font-semibold">${result.status}</td>
      <td class="px-md py-sm text-body-sm text-on-surface-variant">${escapeHtml(result.room)}</td>
    `;
    
    resultsTable.appendChild(row);
  });

  // Show results section
  resultsSection.classList.remove('hidden');
}

/**
 * Update progress bar
 */
function updateProgress(percentage) {
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}%`;
}

/**
 * Handle download
 */
function handleDownload() {
  if (!appState.allocationResults) {
    showAlert('No results to download', 'warning');
    return;
  }

  const results = appState.allocationResults;
  const allResults = [...results.allotted, ...results.waitlist];

  // Prepare CSV content
  let csv = 'Name,Status,Room,Gender,Department,Year\n';
  
  allResults.forEach((result) => {
    csv += `"${result.name}","${result.status}","${result.room}","${result.gender || ''}","${result.department || ''}","${result.year || ''}"\n`;
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `allocation-results-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  showAlert('Results downloaded successfully!', 'success');
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.setAttribute('role', 'alert');
  alert.textContent = message;

  alertContainer.appendChild(alert);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sleep utility for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('AllotmentPro initialized');
  initializeEventListeners();
  updateRunButtonState();
});
