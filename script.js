// script.js

// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://dpeoxwctxrjsliuczfkc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZW94d2N0eHJqc2xpdWN6ZmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTgzMjUsImV4cCI6MjA3ODU5NDMyNX0.Q0rlPRm5XDMgAM12op94srtdUqi4EdwfUdV__xjg99I';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ==========================================
// 2. AUTHENTICATION FUNCTIONS
// ==========================================

// Check if user is logged in
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        console.log('No valid session, redirecting to login.');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('User logged in:', session.user.email);
    return true;
}

// Handle Logout
async function handleLogout() {
    console.log('Logging out...');
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}


// ==========================================
// 3. MAIN APPLICATION LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {

    // A. Security Check: Stop everything if not logged in
    const isLoggedIn = await checkAuth();
    if (!isLoggedIn) return; // Stop execution here if not logged in

    // B. Logout Button Listener
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // --- MOCK DATA (We will use this until you wire up Supabase DB calls) ---
    let mockWebsites = [
        { id: 1, name: 'Google', url: 'https://google.com' },
        { id: 2, name: 'Company Blog', url: 'https://company.com/blog' },
        { id: 3, name: 'Booking System', url: 'https://bookings.company.com' }
    ];
    let mockReports = {};

    // ==========================================
    // C. TAB SWITCHING LOGIC
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPanels = document.querySelectorAll('.content-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');

            // Remove active class from all links and panels
            navLinks.forEach(l => l.classList.remove('active'));
            contentPanels.forEach(p => {
                p.classList.remove('active');
                p.classList.add('hidden');
            });

            // Add active class to clicked link and target panel
            link.classList.add('active');
            const targetPanel = document.getElementById(tab);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('active');
            }
        });
    });

    // ==========================================
    // D. WEBSITE LINKS LOGIC
    // ==========================================
    const websiteList = document.getElementById('website-link-list');
    const addLinkForm = document.getElementById('add-link-form');

    // Load Links Function
    function loadWebsiteLinks() {
        websiteList.innerHTML = ''; // Clear list
        mockWebsites.forEach(site => {
            const li = document.createElement('li');
            li.className = 'link-list-item';
            li.setAttribute('data-id', site.id);
            li.innerHTML = `
                <div class="link-info">
                    <strong>${site.name}</strong>
                    <span>${site.url}</span>
                </div>
                <div class="link-actions">
                    <button class="edit-btn"><i class="ph ph-pencil-simple"></i></button>
                    <button class="delete-btn"><i class="ph ph-trash"></i></button>
                </div>
            `;
            websiteList.appendChild(li);
        });

        // Re-attach listeners to new buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteLink);
        });
    }

    // Add Link Listener
    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-link-name').value;
        const url = document.getElementById('new-link-url').value;

        const newSite = { id: Date.now(), name, url };
        mockWebsites.push(newSite);
        
        loadWebsiteLinks(); 
        addLinkForm.reset();
    });

    // Delete Link Function
    function handleDeleteLink(e) {
        const li = e.currentTarget.closest('li');
        const id = li.getAttribute('data-id');
        if (confirm('Delete this website?')) {
            mockWebsites = mockWebsites.filter(site => site.id != id);
            loadWebsiteLinks();
        }
    }


    // ==========================================
    // E. DAILY CHECKS LOGIC
    // ==========================================
    const startBtn = document.getElementById('start-checks-btn');
    const runAgainBtn = document.getElementById('run-checks-again-btn');
    const startContainer = document.getElementById('checks-start-container');
    const progressContainer = document.getElementById('checks-progress-container');
    const completeContainer = document.getElementById('checks-complete-container');
    const logsContainer = document.getElementById('check-logs');
    const statusText = document.getElementById('current-check-status');
    const progressBar = document.getElementById('progress-bar-inner');

    // Helper: Add Log
    function addLog(message, type) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight; 
    }

    // Helper: Simulate Check
    function simulateCheck(site) {
        return new Promise(resolve => {
            setTimeout(() => {
                const results = {
                    id: site.id,
                    name: site.name,
                    isLive: true,
                    isFunctional: true,
                    notes: 'All systems nominal.'
                };

                if (Math.random() < 0.1) {
                    results.isLive = false;
                    results.isFunctional = false;
                    addLog(`ERROR: ${site.name} is offline!`, 'error');
                } else {
                    addLog(`SUCCESS: ${site.name} is live.`, 'success');
                    if (site.name.includes('Booking') && Math.random() < 0.2) {
                        results.isFunctional = false;
                        addLog(`ERROR: ${site.name} booking form seems broken.`, 'error');
                    } else {
                        addLog(`SUCCESS: ${site.name} functional.`, 'success');
                    }
                }
                resolve(results);
            }, 1500); // 1.5 seconds per check
        });
    }

    // Main Check Function
    async function startDailyChecks() {
        // Reset UI
        startContainer.classList.add('hidden');
        completeContainer.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        logsContainer.innerHTML = '';
        progressBar.style.width = '0%';

        const sitesToCheck = [...mockWebsites];
        const totalSites = sitesToCheck.length;
        let sitesChecked = 0;

        for (const site of sitesToCheck) {
            statusText.textContent = `Checking (${sitesChecked + 1}/${totalSites}): ${site.name}...`;
            addLog(`INFO: Starting check for ${site.url}`, 'info');

            const results = await simulateCheck(site);
            
            // Save mock results
            const today = new Date().toISOString().split('T')[0];
            if (!mockReports[today]) mockReports[today] = [];
            mockReports[today].push(results);

            sitesChecked++;
            progressBar.style.width = `${(sitesChecked / totalSites) * 100}%`;
        }

        statusText.textContent = 'All checks complete!';
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            completeContainer.classList.remove('hidden');
        }, 1000);
    }

    // Attach Listeners to Buttons
    if (startBtn) startBtn.addEventListener('click', startDailyChecks);
    if (runAgainBtn) runAgainBtn.addEventListener('click', startDailyChecks);


    // ==========================================
    // F. REPORT GENERATION LOGIC
    // ==========================================
    const generateReportBtn = document.getElementById('generate-report-btn');
    const datePicker = document.getElementById('report-date-picker');
    const reportOutputContainer = document.getElementById('report-output-container');
    const reportResults = document.getElementById('report-results');
    const reportDateDisplay = document.getElementById('report-date-display');
    
    if (datePicker) datePicker.value = new Date().toISOString().split('T')[0];

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            const date = datePicker.value;
            if (!date) { alert('Please select a date.'); return; }

            const reportData = mockReports[date] || [];
            reportDateDisplay.textContent = date;
            reportOutputContainer.classList.remove('hidden');
            reportResults.innerHTML = ''; 

            if (reportData.length === 0) {
                reportResults.innerHTML = '<p>No check data found for this date.</p>';
                return;
            }

            reportData.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'report-item';
                itemEl.innerHTML = `
                    <div class="report-item-site">${item.name}</div>
                    <div class="report-item-status">
                        <span class="status-badge ${item.isLive ? 'ok' : 'fail'}">
                            ${item.isLive ? 'Live' : 'Offline'}
                        </span>
                    </div>
                `;
                reportResults.appendChild(itemEl);
            });
        });
    }

    // ==========================================
    // G. INITIALIZATION
    // ==========================================
    loadWebsiteLinks();

}); // END OF DOMContentLoaded