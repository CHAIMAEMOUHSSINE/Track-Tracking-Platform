const tokenKey = 'truck_tracking_token';
const userKey = 'truck_tracking_user';

function readUser() {
    try {
        return JSON.parse(localStorage.getItem(userKey) || 'null');
    } catch {
        return null;
    }
}

function saveSession(authResponse) {
    localStorage.setItem(tokenKey, authResponse.token);
    localStorage.setItem(userKey, JSON.stringify({
        email: authResponse.email,
        nom: authResponse.nom,
        prenom: authResponse.prenom,
        role: authResponse.role
    }));
}

function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
}

function getToken() {
    return localStorage.getItem(tokenKey);
}

async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    const token = getToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
    }
    return response;
}

function formatNumber(value, digits = 0) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(value);
}

function redirectIfAuthenticated() {
    if (getToken()) {
        window.location.replace('/dashboard.html');
    }
}

function bindLoginPage() {
    redirectIfAuthenticated();

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const demoFill = document.getElementById('demoFill');

    demoFill?.addEventListener('click', () => {
        document.getElementById('email').value = 'chaimae@gmail.coma';
        document.getElementById('password').value = 'Fati@2016';
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorBox.hidden = true;

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            saveSession(data);
            window.location.href = '/dashboard.html';
        } catch (error) {
            errorBox.textContent = 'Connexion impossible. Vérifiez vos identifiants ou le backend.';
            errorBox.hidden = false;
        }
    });
}

function buildStatCard({ label, value, foot }) {
    const card = document.createElement('article');
    card.className = 'stat-card';
    card.innerHTML = `
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        <div class="stat-foot">${foot}</div>
    `;
    return card;
}

async function bindDashboardPage() {
    const token = getToken();
    if (!token) {
        window.location.replace('/');
        return;
    }

    const user = readUser();
    const greeting = document.getElementById('userGreeting');
    const meta = document.getElementById('userMeta');
    const logoutBtn = document.getElementById('logoutBtn');
    const statsGrid = document.getElementById('statsGrid');
    const stateBars = document.getElementById('stateBars');

    if (user) {
        greeting.textContent = `${user.prenom} ${user.nom}`;
        meta.textContent = `${user.email} · ${user.role}`;
    }

    logoutBtn?.addEventListener('click', () => {
        clearSession();
        window.location.replace('/');
    });

    try {
        const response = await apiFetch('/api/dashboard/stats');
        const stats = await response.json();

        statsGrid.innerHTML = '';
        statsGrid.append(
            buildStatCard({ label: 'Total camions', value: formatNumber(stats.totalCamions), foot: 'Camions enregistrés' }),
            buildStatCard({ label: 'En cours', value: formatNumber(stats.camionsEnCours), foot: 'Trajets actifs' }),
            buildStatCard({ label: 'Terminés', value: formatNumber(stats.camionsTermines), foot: 'Trajets finalisés' }),
            buildStatCard({ label: 'Alertes actives', value: formatNumber(stats.alertesActives), foot: 'Nécessitent une action' })
        );

        const repartition = stats.repartitionParEtat || {};
        const entries = ['VERT', 'ORANGE', 'ROUGE'].map((state) => [state, repartition[state] || 0]);
        const maxValue = Math.max(...entries.map(([, value]) => value), 1);
        stateBars.innerHTML = '';

        entries.forEach(([state, value]) => {
            const row = document.createElement('div');
            const lower = state.toLowerCase();
            row.className = `state-row ${lower}`;
            row.innerHTML = `
                <strong>${state}</strong>
                <div class="state-track"><div class="state-fill" style="width:${(value / maxValue) * 100}%"></div></div>
                <span class="state-value">${formatNumber(value)}</span>
            `;
            stateBars.appendChild(row);
        });

        const footerCard = buildStatCard({
            label: 'Temps moyen parcours',
            value: `${formatNumber(stats.tempsMoyenParcoursMinutes, 1)} min`,
            foot: `${formatNumber(stats.pourcentageRetards, 1)}% de retards`
        });
        statsGrid.appendChild(footerCard);
    } catch {
        clearSession();
        window.location.replace('/');
    }
}

if (document.body.dataset.page === 'login') {
    bindLoginPage();
}

if (document.body.dataset.page === 'dashboard') {
    bindDashboardPage();
}