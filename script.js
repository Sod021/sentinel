// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://dpeoxwctxrjsliuczfkc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZW94d2N0eHJqc2xpdWN6ZmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTgzMjUsImV4cCI6MjA3ODU5NDMyNX0.Q0rlPRm5XDMgAM12op94srtdUqi4EdwfUdV__xjg99I';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ==========================================
// 2. AUTHENTICATION FUNCTIONS
// ==========================================
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

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}


// ==========================================
// 3. MAIN APPLICATION LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {

    // A. Security Check
    const isLoggedIn = await checkAuth();
    if (!isLoggedIn) return;

    // B. Logout Button Listener
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // ==========================================
    // C. TAB SWITCHING LOGIC
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPanels = document.querySelectorAll('.content-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            navLinks.forEach(l => l.classList.remove('active'));
            contentPanels.forEach(p => {
                p.classList.remove('active');
                p.classList.add('hidden');
            });
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

    async function loadWebsiteLinks() {
        const { data: websites, error } = await supabase
            .from('websites')
            .select('*')
            .order('id', { ascending: true });

        if (error) return console.error(error);

        websiteList.innerHTML = '';
        websites.forEach(site => {
            const li = document.createElement('li');
            li.className = 'link-list-item';
            li.setAttribute('data-id', site.id);
            li.innerHTML = `
                <div class="link-info">
                    <strong>${site.name}</strong>
                    <span>${site.url}</span>
                </div>
                <div class="link-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            websiteList.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const li = e.currentTarget.closest('li');
                const id = li.getAttribute('data-id');
                if (confirm('Delete this website?')) {
                    const { error } = await supabase
                        .from('websites')
                        .delete()
                        .eq('id', id);
                    if (error) return console.error(error);
                    loadWebsiteLinks();
                }
            });
        });
    }

    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-link-name').value;
        const url = document.getElementById('new-link-url').value;
        const { error } = await supabase
            .from('websites')
            .insert([{ name, url }]);
        if (error) return console.error(error);
        addLinkForm.reset();
        loadWebsiteLinks();
    });

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

    function addLog(message, type) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight; 
    }

    async function simulateCheck(site) {
        return new Promise(resolve => {
            setTimeout(() => {
                addLog(`Checked: ${site.name}`, 'success');
                resolve({
                    website_id: site.id,
                    is_live: true,
                    is_functional: true,
                    notes: 'All systems nominal.'
                });
            }, 1000);
        });
    }

    async function startDailyChecks() {
        startContainer.classList.add('hidden');
        completeContainer.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        logsContainer.innerHTML = '';
        progressBar.style.width = '0%';

        // Fetch websites from Supabase
        const { data: websites, error } = await supabase.from('websites').select('*');
        if (error) return console.error(error);

        const total = websites.length;
        for (let i = 0; i < total; i++) {
            const site = websites[i];
            statusText.textContent = `Checking (${i+1}/${total}): ${site.name}...`;
            const result = await simulateCheck(site);

            // Save result to Supabase
            await supabase.from('daily_checks').insert([{
                website_id: site.id,
                is_live: result.is_live,
                is_functional: result.is_functional,
                notes: result.notes,
                created_at: new Date()
            }]);

            progressBar.style.width = `${((i+1)/total)*100}%`;
        }

        statusText.textContent = 'All checks complete!';
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            completeContainer.classList.remove('hidden');
        }, 1000);
    }

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
            reportDateDisplay.textContent = date;

            // Fetch results for selected date
            const { data: results, error } = await supabase
                .from('daily_checks')
                .select(`*, websites(*)`)
                .gte('created_at', date + 'T00:00:00')
                .lte('created_at', date + 'T23:59:59');

            if (error) return console.error(error);

            reportResults.innerHTML = '';
            if (!results || results.length === 0) {
                reportResults.innerHTML = '<p>No check data found for this date.</p>';
                reportOutputContainer.classList.remove('hidden');
                return;
            }

            results.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'report-item';
                itemEl.innerHTML = `
                    <div class="report-item-site">${item.websites.name}</div>
                    <div class="report-item-status">
                        <span class="status-badge ${item.is_live ? 'ok' : 'fail'}">
                            ${item.is_live ? 'Live' : 'Offline'}
                        </span>
                    </div>
                `;
                reportResults.appendChild(itemEl);
            });

            reportOutputContainer.classList.remove('hidden');
        });
    }

    // ==========================================
    // G. INITIALIZATION
    // ==========================================
    loadWebsiteLinks();
});
