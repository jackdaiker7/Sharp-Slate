// CSV_PATH and CONFIG_PATH can be overridden by the page before this script loads
if (typeof CSV_PATH === 'undefined') var CSV_PATH = 'data/players.csv';
if (typeof CONFIG_PATH === 'undefined') var CONFIG_PATH = 'data/config.json';

let allPlayers = [];
let sortCol = 'projectedPoints';
let sortAsc = false;
let filterText = '';

async function init() {
  try {
    const [csvRes, cfgRes] = await Promise.all([fetch(CSV_PATH), fetch(CONFIG_PATH)]);
    if (!csvRes.ok) throw new Error('Could not load player data.');

    const text = await csvRes.text();
    allPlayers = parseCSV(text);
    buildOpponentMap(allPlayers);
    renderLineup(allPlayers);
    renderTable(allPlayers);

    if (cfgRes.ok) {
      const cfg = await cfgRes.json();
      if (cfg.sport) document.getElementById('header-sport').textContent = cfg.sport + ' — DraftKings';
      if (cfg.tournament) document.getElementById('header-tournament').textContent = cfg.tournament;
      if (cfg.date) document.getElementById('header-date').textContent = cfg.date;
    }

    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').textContent = 'Error loading data: ' + e.message;
  }
}

function parseCSV(text) {
  const results = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  return results.data.map(row => ({
    name: row['Player']?.trim(),
    pairing: parseInt(row['Pairing']),
    number: parseInt(row['Number']),
    projectedPoints: parseFloat(row['Projected Points']),
    salary: parseInt(row['Salary']),
    optimal: parseInt(row['Optimal']) === 1,
    opponent: ''
  }));
}

function buildOpponentMap(players) {
  const byPairing = {};
  players.forEach(p => {
    if (!byPairing[p.pairing]) byPairing[p.pairing] = [];
    byPairing[p.pairing].push(p);
  });
  players.forEach(p => {
    const pair = byPairing[p.pairing];
    if (pair && pair.length === 2) {
      p.opponent = pair.find(x => x.number !== p.number)?.name || '';
    }
  });
}

function renderLineup(players) {
  const optimal = players.filter(p => p.optimal);
  const totalSalary = optimal.reduce((s, p) => s + p.salary, 0);
  const totalPts = optimal.reduce((s, p) => s + p.projectedPoints, 0);

  document.getElementById('lineup-salary').textContent = '$' + totalSalary.toLocaleString();
  document.getElementById('lineup-pts').textContent = totalPts.toFixed(1);

  const grid = document.getElementById('lineup-grid');
  grid.innerHTML = optimal.map(p => `
    <div class="player-card">
      <div class="card-name">${p.name}</div>
      <div class="card-opponent">vs <span>${p.opponent || '—'}</span></div>
      <div class="card-stats">
        <div>
          <div class="card-stat-label">Proj Pts</div>
          <div class="card-stat-value">${p.projectedPoints.toFixed(1)}</div>
        </div>
        <div>
          <div class="card-stat-label">Salary</div>
          <div class="card-stat-value">$${p.salary.toLocaleString()}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function getSortedFiltered() {
  let data = allPlayers.filter(p =>
    !filterText || p.name.toLowerCase().includes(filterText)
  );
  data = data.slice().sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });
  return data;
}

function renderTable(players) {
  const data = getSortedFiltered();
  const tbody = document.getElementById('player-tbody');
  tbody.innerHTML = data.map(p => `
    <tr class="${p.optimal ? 'is-optimal' : ''}">
      <td class="td-player">${p.name}</td>
      <td>${p.opponent || '—'}</td>
      <td>${p.projectedPoints.toFixed(1)}</td>
      <td>$${p.salary.toLocaleString()}</td>
      <td class="td-optimal">${p.optimal ? '<span class="check-icon">&#10003;</span>' : ''}</td>
    </tr>
  `).join('');

  document.querySelectorAll('thead th[data-col]').forEach(th => {
    th.classList.toggle('sorted', th.dataset.col === sortCol);
    const icon = th.querySelector('.sort-icon');
    icon.textContent = (th.dataset.col === sortCol && sortAsc) ? '▲' : '▼';
  });
}

function handleSort(col) {
  if (sortCol === col) {
    sortAsc = !sortAsc;
  } else {
    sortCol = col;
    sortAsc = false;
  }
  renderTable(allPlayers);
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  document.querySelectorAll('thead th[data-col]').forEach(th => {
    th.addEventListener('click', () => handleSort(th.dataset.col));
  });

  document.getElementById('search').addEventListener('input', e => {
    filterText = e.target.value.toLowerCase();
    renderTable(allPlayers);
  });
});
