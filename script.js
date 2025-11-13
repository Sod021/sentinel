// script.js
document.addEventListener('DOMContentLoaded', () => {

    // --- SUPABASE CLIENT SETUP ---
    const SUPABASE_URL = 'https://dpeoxwctxrjsliuczfkc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZW94d2N0eHJqc2xpdWN6ZmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTgzMjUsImV4cCI6MjA3ODU5NDMyNX0.Q0rlPRm5XDMgAM12op94srtdUqi4EdwfUdV__xjg99I';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- AUTHENTICATION ---
// Function to check if user is logged in
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Error getting session:', error);
        return;
    }
    
    if (!session) {
        // No user session, redirect to login
        console.log('No session found, redirecting to login.');
        window.location.href = 'login.html';
    } else {
        // User is logged in
        console.log('Session found, user is logged in:', session.user.email);
    }
}

// Function to handle logout
async function handleLogout() {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Error logging out:', error);
    } else {
        // Redirect to login page on successful logout
        window.location.href = 'login.html';
    }
}


// --- MAIN APP LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    // --- !! RUN AUTH CHECK ON PAGE LOAD !! ---
    checkAuth();
    
    // --- !! ADD LOGOUT BUTTON LISTENER !! ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // --- (Your existing mock data can be removed later) ---
    let mockWebsites = [ 
        /* ... */ 
    ];
    let mockReports = { 
        /* ... */ 
    };

    // --- (All your other code for navigation, panels, etc. goes here) ---
    const navLinks = document.querySelectorAll('.nav-link');
    // ... all your other functions ...

});

    // --- NAVIGATION / TAB SWITCHING ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPanels = document.querySelectorAll('.content-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show correct panel
            contentPanels.forEach(panel => {
                if (panel.id === tab) {
                    panel.classList.remove('hidden');
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                    panel.classList.add('hidden');
                }
            });
        });
    });

    // --- WEBSITE LINKS PANEL ---
    const websiteList = document.getElementById('website-link-list');
    const addLinkForm = document.getElementById('add-link-form');

    async function loadWebsiteLinks() {
        // --- SUPABASE STUB: fetchWebsites() ---
        // const { data, error } = await supabase.from('websites').select('*');
        // if (error) { console.error('Error fetching websites:', error); return; }
        // mockWebsites = data;
        
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

        // Add event listeners for new buttons
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDeleteLink));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEditLink));
    }

    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-link-name').value;
        const url = document.getElementById('new-link-url').value;

        // --- SUPABASE STUB: addWebsite() ---
        // const { data, error } = await supabase.from('websites').insert([{ name, url }]);
        // if (error) { console.error('Error adding website:', error); return; }
        
        // Mock implementation
        const newSite = { id: Date.now(), name, url };
        mockWebsites.push(newSite);
        
        console.log('Added site:', newSite);
        loadWebsiteLinks(); // Refresh list
        addLinkForm.reset();
    });

    async function handleDeleteLink(e) {
        const li = e.currentTarget.closest('li');
        const id = li.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this website?')) {
            // --- SUPABASE STUB: deleteWebsite() ---
            // const { error } = await supabase.from('websites').delete().match({ id: id });
            // if (error) { console.error('Error deleting website:', error); return; }

            // Mock implementation
            mockWebsites = mockWebsites.filter(site => site.id != id);
            
            console.log('Deleted site:', id);
            loadWebsiteLinks(); // Refresh list
        }
    }

    function handleEditLink(e) {
        // You can implement an edit modal or inline editing here
        alert('Edit functionality not yet implemented.');
    }

    // --- DAILY CHECKS PANEL ---
    const startBtn = document.getElementById('start-checks-btn');
    const runAgainBtn = document.getElementById('run-checks-again-btn');
    const startContainer = document.getElementById('checks-start-container');
    const progressContainer = document.getElementById('checks-progress-container');
    const completeContainer = document.getElementById('checks-complete-container');
    const logsContainer = document.getElementById('check-logs');
    const statusText = document.getElementById('current-check-status');
    const progressBar = document.getElementById('progress-bar-inner');

    startBtn.addEventListener('click', startDailyChecks);
    runAgainBtn.addEventListener('click', startDailyChecks);

    async function startDailyChecks() {
        startContainer.classList.add('hidden');
        completeContainer.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        logsContainer.innerHTML = '';
        progressBar.style.width = '0%';

        // --- SUPABASE STUB: fetchWebsites() ---
        // For this demo, we just use the loaded mockWebsites
        const sitesToCheck = [...mockWebsites];
        const totalSites = sitesToCheck.length;
        let sitesChecked = 0;

        for (const site of sitesToCheck) {
            statusText.textContent = `Checking (${sitesChecked + 1}/${totalSites}): ${site.name}...`;
            addLog(`INFO: Starting check for ${site.url}`, 'info');

            // SIMULATE THE CHECKS
            const results = await simulateCheck(site);
            sitesChecked++;

            // --- SUPABASE STUB: saveCheckResults() ---
            // const { error } = await supabase.from('checks').insert([
            //     { website_id: results.id, is_live: results.isLive, is_functional: results.isFunctional, notes: results.notes, check_date: new Date().toISOString() }
            // ]);
            // if(error) { addLog(`ERROR: Failed to save results for ${site.name}`, 'error'); }
            
            // Mock saving results
            const today = new Date().toISOString().split('T')[0];
            if (!mockReports[today]) mockReports[today] = [];
            mockReports[today].push(results);

            progressBar.style.width = `${(sitesChecked / totalSites) * 100}%`;
        }

        statusText.textContent = 'All checks complete!';
        progressContainer.classList.add('hidden');
        completeContainer.classList.remove('hidden');
    }

    /**
     * SIMULATES a website check.
     * In a real app, 'isLive' would be a fetch().
     * 'isFunctional' is VERY complex and would require a backend service
     * like Puppeteer. We will just mock it.
     */
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

                // Simulate a 10% chance of failure
                if (Math.random() < 0.1) {
                    results.isLive = false;
                    results.isFunctional = false;
                    results.notes = 'Site offline. (Status 503)';
                    addLog(`ERROR: ${site.name} is offline!`, 'error');
                } else {
                    addLog(`SUCCESS: ${site.name} is live.`, 'success');
                    
                    // Simulate a 10% chance of form failure
                    if (site.name.includes('Booking') && Math.random() < 0.2) {
                        results.isFunctional = false;
                        results.notes = 'Site is live, but booking form API failed.';
                        addLog(`ERROR: ${site.name} booking form seems broken.`, 'error');
                    } else {
                        addLog(`SUCCESS: ${site.name} forms appear functional.`, 'success');
                    }
                }
                
                resolve(results);

            }, 2000); // Simulate 2-second check
        });
    }

    function addLog(message, type) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight; // Auto-scroll
    }


    // --- GENERATE REPORT PANEL ---
    const generateReportBtn = document.getElementById('generate-report-btn');
    const datePicker = document.getElementById('report-date-picker');
    const reportOutputContainer = document.getElementById('report-output-container');
    const reportResults = document.getElementById('report-results');
    const reportDateDisplay = document.getElementById('report-date-display');
    
    // Set default date to today
    datePicker.value = new Date().toISOString().split('T')[0];

    generateReportBtn.addEventListener('click', async () => {
        const date = datePicker.value;
        if (!date) {
            alert('Please select a date.');
            return;
        }

        // --- SUPABASE STUB: fetchReportByDate() ---
        // const { data, error } = await supabase.from('checks')
        //     .select('*, websites(name, url)') // Join with websites table
        //     .eq('check_date', date);
        // if(error) { console.error('Error fetching report:', error); return; }
        
        // Mock implementation
        const reportData = mockReports[date] || [];

        reportDateDisplay.textContent = new Date(date + 'T00:00:00').toLocaleDateString();
        reportOutputContainer.classList.remove('hidden');
        reportResults.innerHTML = ''; // Clear old results

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
                        <i class="ph ${item.isLive ? 'ph-check-circle' : 'ph-x-circle'}"></i>
                        Live
                    </span>
                    <span class="status-badge ${item.isFunctional ? 'ok' : 'warn'}">
                        <i class="ph ${item.isFunctional ? 'ph-check-circle' : 'ph-warning-circle'}"></i>
                        Functional
                    </span>
                </div>
                <div class="report-item-notes">${item.notes}</div>
            `;
            reportResults.appendChild(itemEl);
        });
    });


    // --- INITIAL LOAD ---
    loadWebsiteLinks();
});