const CASH_PERIODS = {
  harian: [
    { id: '2026-11-16', label: '16 November 2026' },
    { id: '2026-11-15', label: '15 November 2026' },
    { id: '2026-11-12', label: '12 November 2026' },
    { id: '2026-11-01', label: '1 November 2026' }
  ],
  mingguan: [
    { id: '2026-11-10', label: '10–16 November 2026' },
    { id: '2026-11-03', label: '3–9 November 2026' }
  ],
  bulanan: [
    { id: '2026-11', label: 'November 2026' },
    { id: '2026-10', label: 'Oktober 2026' }
  ]
};

const TRAFFIC_PERIODS = {
  mingguan: [
    { id: '2026-11-10', label: '10–16 November 2026' },
    { id: '2026-11-03', label: '3–9 November 2026' }
  ],
  harian: [
    { id: '2026-11-16', label: '16 November 2026' },
    { id: '2026-11-15', label: '15 November 2026' },
    { id: '2026-11-01', label: '1 November 2026' }
  ],
  bulanan: [
    { id: '2026-11', label: 'November 2026' },
    { id: '2026-10', label: 'Oktober 2026' }
  ]
};

const TRANSACTIONS = [
  { id: 'STL-261116-024', date: '2026-11-16', note: 'Nisa · 1 kg × Rp7.000', kind: 'masuk', amount: 7000 },
  { id: 'STL-261116-025', date: '2026-11-16', note: 'Bima · 1 kg × Rp7.000', kind: 'masuk', amount: 7000 },
  { id: 'STL-261116-026', date: '2026-11-16', note: 'Nadia · 2 kg × Rp7.000', kind: 'masuk', amount: 14000 },
  { id: 'STL-261116-027', date: '2026-11-16', note: 'Tio · 3 kg × Rp7.000', kind: 'masuk', amount: 21000 },
  { id: 'STL-261116-028', date: '2026-11-16', note: 'Lia · 3 kg × Rp7.000', kind: 'masuk', amount: 21000 },
  { id: 'EXP-261116-01', date: '2026-11-16', note: 'Pembelian detergen', kind: 'keluar', amount: 30000 },
  { id: 'EXP-261116-02', date: '2026-11-16', note: 'Plastik kemasan', kind: 'keluar', amount: 15000 },
  { id: 'STL-261115-030', date: '2026-11-15', note: 'Rani · 3 kg × Rp7.000', kind: 'masuk', amount: 21000 },
  { id: 'STL-261115-031', date: '2026-11-15', note: 'Dimas · 2 kg × Rp7.000', kind: 'masuk', amount: 14000 },
  { id: 'EXP-261115-01', date: '2026-11-15', note: 'Token listrik', kind: 'keluar', amount: 50000 },
  { id: 'STL-261110-011', date: '2026-11-10', note: 'Ayu · 2 kg × Rp7.000', kind: 'masuk', amount: 14000 },
  { id: 'STL-261111-012', date: '2026-11-11', note: 'Fajar · 2 kg × Rp7.000', kind: 'masuk', amount: 14000 },
  { id: 'STL-261113-018', date: '2026-11-13', note: 'Sari · 4 kg × Rp7.000', kind: 'masuk', amount: 28000 },
  { id: 'STL-261114-021', date: '2026-11-14', note: 'Rani · 3 kg × Rp7.000', kind: 'masuk', amount: 21000 },
  { id: 'EXP-261113-01', date: '2026-11-13', note: 'Pewangi pakaian', kind: 'keluar', amount: 20000 }
];

const TRAFFIC_DAYS = [
  { date: '2026-11-10', label: '10 Nov', baru: 1, kembali: 2 },
  { date: '2026-11-11', label: '11 Nov', baru: 2, kembali: 2 },
  { date: '2026-11-12', label: '12 Nov', baru: 1, kembali: 1 },
  { date: '2026-11-13', label: '13 Nov', baru: 2, kembali: 4 },
  { date: '2026-11-14', label: '14 Nov', baru: 2, kembali: 2 },
  { date: '2026-11-15', label: '15 Nov', baru: 2, kembali: 5 },
  { date: '2026-11-16', label: '16 Nov', baru: 2, kembali: 3 }
];

const MONTH_LABELS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatRupiah(number) {
  return 'Rp' + Number(number).toLocaleString('id-ID');
}

function kindBadge(kind) {
  const masuk = kind === 'masuk';
  const icon = masuk ? 'assets/img/ikon-masuk.svg' : 'assets/img/ikon-keluar.svg';
  const label = masuk ? 'Masuk' : 'Keluar';
  return `<span class="owner-kind ${masuk ? 'is-in' : 'is-out'}"><img src="${icon}" alt="" width="16" height="16">${label}</span>`;
}

class SativaPemilik {
  constructor() {
    this.cashRange = 'harian';
    this.cashPeriod = '2026-11-16';
    this.trafficRange = 'mingguan';
    this.trafficPeriod = '2026-11-10';
  }

  init() {
    window.sativaAuth.requireAuth('pemilik');
    this.bindLogout();
    this.bindNav();
    this.bindCashflow();
    this.bindTraffic();
    this.fillPeriodSelect('cash');
    this.fillPeriodSelect('traffic');
    this.renderCashflow();
    this.renderTraffic();

    const hash = window.location.hash.replace('#', '') || 'cashflow';
    this.switchView(hash === 'trafik' ? 'trafik' : 'cashflow', false);
    window.addEventListener('hashchange', () => {
      const next = window.location.hash.replace('#', '');
      this.switchView(next === 'trafik' ? 'trafik' : 'cashflow', false);
    });
  }

  bindLogout() {
    const button = document.getElementById('btnKeluar');
    if (!button) return;
    button.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        window.sativaAuth.logout();
      }
    });
  }

  bindNav() {
    document.querySelectorAll('[data-nav-target]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.switchView(link.getAttribute('data-nav-target'));
      });
    });
  }

  switchView(name, updateHash = true) {
    document.querySelectorAll('[data-nav-target]').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-nav-target') === name);
    });
    document.getElementById('view-cashflow').hidden = name !== 'cashflow';
    document.getElementById('view-trafik').hidden = name !== 'trafik';
    const note = document.getElementById('sidebarNote');
    if (note) {
      note.innerHTML = name === 'cashflow'
        ? 'Operasional toko<br>08.00–21.00 WIB'
        : 'Laporan terbatas untuk pemilik toko.';
    }
    if (updateHash) window.location.hash = name;
  }

  bindCashflow() {
    const range = document.getElementById('cashRange');
    range.addEventListener('change', () => {
      this.cashRange = range.value;
      this.fillPeriodSelect('cash');
    });
    document.getElementById('formCashflow').addEventListener('submit', (event) => {
      event.preventDefault();
      this.cashRange = range.value;
      this.cashPeriod = document.getElementById('cashPeriod').value;
      this.renderCashflow();
    });
  }

  bindTraffic() {
    const range = document.getElementById('trafficRange');
    range.addEventListener('change', () => {
      this.trafficRange = range.value;
      this.fillPeriodSelect('traffic');
    });
    document.getElementById('formTrafik').addEventListener('submit', (event) => {
      event.preventDefault();
      this.trafficRange = range.value;
      this.trafficPeriod = document.getElementById('trafficPeriod').value;
      this.renderTraffic();
    });
  }

  fillPeriodSelect(which) {
    const isCash = which === 'cash';
    const range = isCash ? this.cashRange : this.trafficRange;
    const select = document.getElementById(isCash ? 'cashPeriod' : 'trafficPeriod');
    const options = isCash ? CASH_PERIODS[range] : TRAFFIC_PERIODS[range];
    const current = isCash ? this.cashPeriod : this.trafficPeriod;
    select.innerHTML = options.map((option) => `<option value="${option.id}">${option.label}</option>`).join('');
    if (options.some((option) => option.id === current)) {
      select.value = current;
    } else {
      select.value = options[0].id;
      if (isCash) this.cashPeriod = select.value;
      else this.trafficPeriod = select.value;
    }
  }

  periodBounds(range, id) {
    if (range === 'harian') return { start: id, end: id };
    if (range === 'mingguan') {
      const start = new Date(`${id}T00:00:00`);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: id, end: end.toISOString().slice(0, 10) };
    }
    const [year, month] = id.split('-');
    const last = new Date(Number(year), Number(month), 0).getDate();
    return { start: `${id}-01`, end: `${id}-${String(last).padStart(2, '0')}` };
  }

  inRange(date, bounds) {
    return date >= bounds.start && date <= bounds.end;
  }

  renderCashflow() {
    const bounds = this.periodBounds(this.cashRange, this.cashPeriod);
    const rows = TRANSACTIONS.filter((item) => this.inRange(item.date, bounds));
    const masuk = rows.filter((item) => item.kind === 'masuk');
    const keluar = rows.filter((item) => item.kind === 'keluar');
    const totalMasuk = masuk.reduce((sum, item) => sum + item.amount, 0);
    const totalKeluar = keluar.reduce((sum, item) => sum + item.amount, 0);
    const periodLabel = this.selectedLabel('cash');

    document.getElementById('cashStats').innerHTML = `
      <article class="owner-stat">
        <p class="owner-stat-label">Kas masuk</p>
        <p class="owner-stat-value is-in">${formatRupiah(totalMasuk)}</p>
        <p class="owner-stat-note">${masuk.length} transaksi lunas</p>
      </article>
      <article class="owner-stat">
        <p class="owner-stat-label">Kas keluar</p>
        <p class="owner-stat-value is-out">${formatRupiah(totalKeluar)}</p>
        <p class="owner-stat-note">${keluar.length} pengeluaran operasional</p>
      </article>
      <article class="owner-stat">
        <p class="owner-stat-label">Arus kas bersih</p>
        <p class="owner-stat-value is-net">${formatRupiah(totalMasuk - totalKeluar)}</p>
        <p class="owner-stat-note">Pemasukan − pengeluaran</p>
      </article>
    `;

    const monthId = this.cashPeriod.slice(0, 7);
    const monthBounds = this.periodBounds('bulanan', monthId);
    const monthIn = TRANSACTIONS
      .filter((item) => item.kind === 'masuk' && this.inRange(item.date, monthBounds))
      .reduce((sum, item) => sum + item.amount, 0);
    const shownMonthIncome = monthId === '2026-11' ? 1260000 : monthIn;
    const monthIndex = Number(monthId.slice(5, 7)) - 1;
    const through = bounds.end < monthBounds.end ? bounds.end : monthBounds.end;
    document.getElementById('cashMonth').innerHTML = `
      <p class="owner-month-label">Pendapatan bulan ${MONTH_LABELS[monthIndex]} ${monthId.slice(0, 4)}</p>
      <p class="owner-month-value">${formatRupiah(shownMonthIncome)}</p>
      <p class="owner-month-note">Hingga ${this.shortDate(through)}</p>
    `;

    const meta = document.getElementById('cashHistoryMeta');
    const body = document.getElementById('cashTableBody');
    const cards = document.getElementById('cashCardList');
    const note = document.getElementById('cashEmptyNote');

    if (rows.length === 0) {
      meta.textContent = `${periodLabel} · 0 transaksi`;
      body.innerHTML = `<tr><td colspan="4" class="owner-empty">Data transaksi kosong/tidak ditemukan</td></tr>`;
      cards.innerHTML = `<p class="owner-empty">Data transaksi kosong/tidak ditemukan</p>`;
      note.textContent = 'Jika periode belum memiliki transaksi: “Data transaksi kosong/tidak ditemukan”.';
      return;
    }

    meta.textContent = `${periodLabel} · ${rows.length} transaksi`;
    body.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.note}</td>
        <td>${kindBadge(row.kind)}</td>
        <td>${formatRupiah(row.amount)}</td>
      </tr>
    `).join('');
    cards.innerHTML = rows.map((row) => `
      <article class="owner-tx-card">
        <p class="owner-tx-ref">${row.id}</p>
        <p class="owner-tx-desc">${row.note}</p>
        <div class="owner-tx-row">${kindBadge(row.kind)}<span>${formatRupiah(row.amount)}</span></div>
      </article>
    `).join('');
    note.textContent = 'Jika periode belum memiliki transaksi: “Data transaksi kosong/tidak ditemukan”.';
  }

  renderTraffic() {
    const bounds = this.periodBounds(this.trafficRange, this.trafficPeriod);
    const days = TRAFFIC_DAYS.filter((day) => this.inRange(day.date, bounds));
    const orders = days.reduce((sum, day) => sum + day.baru + day.kembali, 0);
    const baru = days.reduce((sum, day) => sum + day.baru, 0);
    const kembali = days.reduce((sum, day) => sum + day.kembali, 0);
    const latest = days[days.length - 1];

    document.getElementById('trafficStats').innerHTML = `
      <article class="owner-stat">
        <p class="owner-stat-label">Pesanan masuk</p>
        <p class="owner-stat-value is-net">${orders}</p>
        <p class="owner-stat-note">${latest ? `${latest.baru + latest.kembali} pesanan pada ${latest.label}` : 'Tidak ada pesanan'}</p>
      </article>
      <article class="owner-stat">
        <p class="owner-stat-label">Pelanggan baru</p>
        <p class="owner-stat-value">${baru}</p>
        <p class="owner-stat-note">Kunjungan pertama</p>
      </article>
      <article class="owner-stat">
        <p class="owner-stat-label">Pelanggan kembali</p>
        <p class="owner-stat-value">${kembali}</p>
        <p class="owner-stat-note">Sudah pernah bertransaksi</p>
      </article>
    `;

    const chart = document.getElementById('trafficChart');
    const busiest = document.getElementById('trafficBusiest');
    if (days.length === 0) {
      chart.innerHTML = `<p class="owner-chart-empty">Tidak ada data trafik pada periode ini.</p>`;
      busiest.innerHTML = `
        <h3 class="owner-insight-title">Hari tersibuk: —</h3>
        <p class="owner-insight-text">Belum ada pesanan pada periode ini.</p>
      `;
      return;
    }

    const max = Math.max(...days.map((day) => Math.max(day.baru, day.kembali, 1)));
    chart.innerHTML = days.map((day) => `
      <div class="owner-bar-col">
        <p class="owner-bar-total">${day.baru + day.kembali}</p>
        <div class="owner-bars">
          <span class="owner-bar is-new" style="height:${Math.round((day.baru / max) * 140)}px" title="Baru: ${day.baru}"></span>
          <span class="owner-bar is-return" style="height:${Math.round((day.kembali / max) * 140)}px" title="Kembali: ${day.kembali}"></span>
        </div>
        <p class="owner-bar-label">${day.label}</p>
      </div>
    `).join('');

    const peak = days.reduce((best, day) => (day.baru + day.kembali > best.baru + best.kembali ? day : best), days[0]);
    busiest.innerHTML = `
      <h3 class="owner-insight-title">Hari tersibuk: ${this.longDay(peak.date)}</h3>
      <p class="owner-insight-text">${peak.baru + peak.kembali} pesanan · ${peak.baru} pelanggan baru dan ${peak.kembali} kembali. Gunakan ringkasan ini untuk merencanakan beban operasional.</p>
    `;
  }

  selectedLabel(which) {
    const range = which === 'cash' ? this.cashRange : this.trafficRange;
    const id = which === 'cash' ? this.cashPeriod : this.trafficPeriod;
    const options = which === 'cash' ? CASH_PERIODS[range] : TRAFFIC_PERIODS[range];
    return options.find((option) => option.id === id)?.label || id;
  }

  shortDate(iso) {
    const date = new Date(`${iso}T00:00:00`);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  longDay(iso) {
    const date = new Date(`${iso}T00:00:00`);
    return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sativaPemilik = new SativaPemilik();
  window.sativaPemilik.init();
});
