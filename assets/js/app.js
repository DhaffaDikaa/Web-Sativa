function formatRupiah(number) {
  return 'Rp' + Number(number).toLocaleString('id-ID');
}

function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatIndonesianDate(isoDate, shortMonth = true) {
  if (!isoDate || !isoDate.includes('-')) return isoDate || '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fullMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = (shortMonth ? shortMonths : fullMonths)[m - 1] || '';
  return `${d} ${monthName} ${y}`;
}

class SativaApp {
  constructor() {
    this.currentTab = 'pesanan';
    this.selectedCustomer = null;
    this.activeOrderInScan = null;
    this.currentReceiptOrder = null;
  }

  init() {
    this.bindNavigation();
    this.bindDashboard();
    this.bindNewOrder();
    this.bindScanQR();
    this.bindCustomers();
    this.bindExpenses();
    this.bindModals();
    this.bindComboboxOutsideClick();
    this.bindDateTimePickers();
    this.bindTimePicker();

    const hash = window.location.hash.replace('#', '') || 'pesanan';
    this.switchTab(hash);

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '') || 'pesanan';
      this.switchTab(newHash, false);
    });
  }

  bindNavigation() {
    const navLinks = document.querySelectorAll('[data-nav-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav-target');
        this.switchTab(target);
      });
    });

    const userPill = document.getElementById('userPillBtn');
    if (userPill) {
      userPill.addEventListener('click', () => {
        if (confirm('Keluar dari sesi Pegawai?')) {
          window.sativaAuth.logout();
        }
      });
    }
  }

  switchTab(tabName, updateHash = true) {
    if (this.currentTab === 'scan-qr' && tabName !== 'scan-qr' && this.stopCamera) {
      this.stopCamera();
    }

    this.currentTab = tabName;
    if (updateHash) {
      window.location.hash = tabName;
    }

    document.querySelectorAll('.sidebar-link, .mobile-nav-link').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === tabName || (tabName === 'pesanan-baru' && target === 'pesanan') || (tabName === 'nota-qr' && target === 'pesanan')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) {
      targetView.style.display = 'block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabName === 'pesanan') {
      this.renderDashboard();
    } else if (tabName === 'pesanan-baru') {
      this.initNewOrderForm();
    } else if (tabName === 'nota-qr') {
      this.renderReceipt();
    } else if (tabName === 'scan-qr') {
      this.renderScanQR();
    } else if (tabName === 'pelanggan') {
      this.renderCustomers();
    } else if (tabName === 'pengeluaran') {
      this.renderExpenses();
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  bindModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  bindDateTimePickers() {
    ['newOrderEstimateDate', 'expenseDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (typeof el.showPicker === 'function') {
            try { el.showPicker(); } catch (_) {}
          }
        });
      }
    });
  }

  bindTimePicker() {
    const timeInput = document.getElementById('newOrderEstimateTime');
    const hourBox = document.getElementById('tpHourBox');
    const minuteBox = document.getElementById('tpMinuteBox');
    const amBtn = document.getElementById('tpAmBtn');
    const pmBtn = document.getElementById('tpPmBtn');
    const clockFace = document.getElementById('tpClockFace');
    const cancelBtn = document.getElementById('tpCancelBtn');
    const okBtn = document.getElementById('tpOkBtn');

    if (!timeInput || !clockFace) return;

    this.tpState = { hour: 5, minute: 0, period: 'PM', mode: 'hour' };

    const openPicker = () => {
      const val = (timeInput.value || '17:00').trim();
      const parts = val.split(':');
      let h24 = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      if (isNaN(h24)) h24 = 17;
      if (isNaN(m)) m = 0;

      const period = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;

      this.tpState = { hour: h12, minute: m, period, mode: 'hour' };
      this.renderTimePicker();
      this.openModal('modalTimePicker');
    };

    timeInput.addEventListener('click', openPicker);

    if (hourBox) {
      hourBox.addEventListener('click', () => {
        this.tpState.mode = 'hour';
        this.renderTimePicker();
      });
    }

    if (minuteBox) {
      minuteBox.addEventListener('click', () => {
        this.tpState.mode = 'minute';
        this.renderTimePicker();
      });
    }

    if (amBtn) {
      amBtn.addEventListener('click', () => {
        this.tpState.period = 'AM';
        this.renderTimePicker();
      });
    }

    if (pmBtn) {
      pmBtn.addEventListener('click', () => {
        this.tpState.period = 'PM';
        this.renderTimePicker();
      });
    }

    let isDragging = false;

    const handleDialPoint = (clientX, clientY) => {
      const rect = clockFace.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      if (this.tpState.mode === 'hour') {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        this.tpState.hour = h;
      } else {
        let m = Math.round(angle / 6) % 60;
        this.tpState.minute = m;
      }
      this.renderTimePicker();
    };

    clockFace.addEventListener('pointerdown', (e) => {
      isDragging = true;
      clockFace.setPointerCapture(e.pointerId);
      handleDialPoint(e.clientX, e.clientY);
    });

    clockFace.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      handleDialPoint(e.clientX, e.clientY);
    });

    clockFace.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (this.tpState.mode === 'hour') {
        this.tpState.mode = 'minute';
        this.renderTimePicker();
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeModal('modalTimePicker');
      });
    }

    if (okBtn) {
      okBtn.addEventListener('click', () => {
        let h24 = this.tpState.hour % 12;
        if (this.tpState.period === 'PM') h24 += 12;
        const hh = String(h24).padStart(2, '0');
        const mm = String(this.tpState.minute).padStart(2, '0');
        timeInput.value = `${hh}:${mm}`;
        this.closeModal('modalTimePicker');
      });
    }
  }

  renderTimePicker() {
    const hourBox = document.getElementById('tpHourBox');
    const minuteBox = document.getElementById('tpMinuteBox');
    const amBtn = document.getElementById('tpAmBtn');
    const pmBtn = document.getElementById('tpPmBtn');
    const clockHand = document.getElementById('tpClockHand');
    const clockNumbers = document.getElementById('tpClockNumbers');

    if (!this.tpState || !clockNumbers) return;

    const { hour, minute, period, mode } = this.tpState;

    if (hourBox) {
      hourBox.textContent = String(hour).padStart(2, '0');
      hourBox.classList.toggle('active', mode === 'hour');
    }
    if (minuteBox) {
      minuteBox.textContent = String(minute).padStart(2, '0');
      minuteBox.classList.toggle('active', mode === 'minute');
    }
    if (amBtn) amBtn.classList.toggle('active', period === 'AM');
    if (pmBtn) pmBtn.classList.toggle('active', period === 'PM');

    const deg = mode === 'hour' ? (hour % 12) * 30 : minute * 6;
    if (clockHand) {
      clockHand.style.transform = `translateX(-50%) rotate(${deg}deg)`;
    }

    const radius = 88;
    const center = 118;
    const items = mode === 'hour'
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    clockNumbers.innerHTML = items.map((val, idx) => {
      const angleRad = ((idx * 30) - 90) * (Math.PI / 180);
      const x = center + radius * Math.cos(angleRad);
      const y = center + radius * Math.sin(angleRad);
      const label = mode === 'hour' ? String(val) : String(val).padStart(2, '0');
      const isActive = mode === 'hour' ? val === hour : val === minute;
      return `<div class="tp-clock-num ${isActive ? 'active' : ''}" style="left: ${x}px; top: ${y}px;">${label}</div>`;
    }).join('');
  }

  bindComboboxOutsideClick() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.combobox-container')) {
        document.querySelectorAll('.combobox-dropdown').forEach(d => {
          d.classList.remove('active');
        });
      }
    });
  }

  bindDashboard() {
    const searchInput = document.getElementById('searchOrderInput');
    const statusSelect = document.getElementById('filterStatusSelect');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterAndRenderOrders());
    }
    if (statusSelect) {
      statusSelect.addEventListener('change', () => this.filterAndRenderOrders());
    }

    const btnNewOrder = document.getElementById('btnGoNewOrder');
    if (btnNewOrder) {
      btnNewOrder.addEventListener('click', () => this.switchTab('pesanan-baru'));
    }

    const btnScanOrder = document.getElementById('btnGoScanOrder');
    if (btnScanOrder) {
      btnScanOrder.addEventListener('click', () => this.switchTab('scan-qr'));
    }
  }

  renderDashboard() {
    const stats = window.sativaStore.getDashboardStats();
    const statActiveEl = document.getElementById('statActiveCount');
    const statReadyEl = document.getElementById('statReadyCount');
    const statCapEl = document.getElementById('statCapacity');
    const statCapDescEl = document.getElementById('statCapacityDesc');

    if (statActiveEl) statActiveEl.textContent = `${stats.activeCount} pesanan`;
    if (statReadyEl) statReadyEl.textContent = `${stats.readyCount} pesanan`;
    if (statCapEl) statCapEl.textContent = `${stats.activeWeight} / ${stats.maxCapacity} kg`;
    if (statCapDescEl) {
      statCapDescEl.textContent = stats.isFull ? 'Penuh · Kapasitas tercapai' : `Normal · tersisa ${stats.remaining} kg`;
    }

    this.filterAndRenderOrders();
  }

  filterAndRenderOrders() {
    const searchVal = (document.getElementById('searchOrderInput')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('filterStatusSelect')?.value || 'Semua status';

    let orders = window.sativaStore.getOrders();

    if (searchVal) {
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(searchVal) || 
        o.customerName.toLowerCase().includes(searchVal)
      );
    }

    if (statusVal !== 'Semua status') {
      orders = orders.filter(o => o.status === statusVal);
    }

    const tableBody = document.getElementById('ordersTableBody');
    const mobileCardsContainer = document.getElementById('mobileOrdersList');
    const countNote = document.getElementById('ordersCountNote');

    if (countNote) {
      countNote.textContent = `${orders.length} pesanan ditampilkan · Beban aktif tidak termasuk pesanan selesai atau diambil.`;
    }

    if (!tableBody || !mobileCardsContainer) return;

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--slate-500);">Tidak ada pesanan yang sesuai filter.</td></tr>`;
      mobileCardsContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--slate-500);">Tidak ada pesanan yang sesuai filter.</div>`;
      return;
    }

    tableBody.innerHTML = orders.map(order => {
      const badgeClass = this.getStatusBadgeClass(order.status);
      return `
        <tr>
          <td>
            <strong>${order.id}</strong> · ${order.customerName}
          </td>
          <td>${order.service}</td>
          <td>${order.weight} kg</td>
          <td>
            <span class="badge-status ${badgeClass}">
              ${this.getStatusIcon(order.status)} ${order.status}
            </span>
          </td>
          <td>
            <a href="#" class="link-action" data-order-action="${order.id}">Lihat detail</a>
          </td>
        </tr>
      `;
    }).join('');

    mobileCardsContainer.innerHTML = orders.map(order => {
      const badgeClass = this.getStatusBadgeClass(order.status);
      return `
        <div class="order-mobile-card">
          <div class="order-mobile-code">${order.id} · ${order.customerName}</div>
          <div class="order-mobile-info">${order.service}</div>
          <div class="order-mobile-info">${order.weight} kg</div>
          <div style="margin: 0.25rem 0;">
            <span class="badge-status ${badgeClass}">
              ${this.getStatusIcon(order.status)} ${order.status}
            </span>
          </div>
          <button type="button" class="btn btn-blue btn-block" data-order-action="${order.id}" style="margin-top: 0.5rem;">
            Lihat detail
          </button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('[data-order-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const orderId = btn.getAttribute('data-order-action');
        this.handleOrderDetailClick(orderId);
      });
    });
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Diterima': return 'badge-diterima';
      case 'Dicuci': return 'badge-dicuci';
      case 'Disetrika': return 'badge-disetrika';
      case 'Selesai': return 'badge-selesai';
      case 'Diambil': return 'badge-diambil';
      default: return 'badge-diterima';
    }
  }

  getStatusIcon(status) {
    if (status === 'Diterima') return '↓';
    if (status === 'Dicuci' || status === 'Disetrika') return '⏱';
    if (status === 'Selesai') return '✓';
    return '•';
  }

  handleOrderDetailClick(orderId) {
    const order = window.sativaStore.getOrderById(orderId);
    if (!order) return;
    this.showOrderDetailModal(order);
  }

  showOrderDetailModal(order) {
    const modalCode = document.getElementById('modalDetailCode');
    const modalName = document.getElementById('modalDetailName');
    const modalService = document.getElementById('modalDetailService');
    const modalStatus = document.getElementById('modalDetailStatus');

    if (modalCode) modalCode.textContent = order.id;
    if (modalName) modalName.textContent = order.customerName;
    if (modalService) modalService.textContent = `${order.service} · ${order.weight} kg`;
    if (modalStatus) {
      modalStatus.innerHTML = `Status: <span style="color: ${order.status === 'Selesai' ? 'var(--green-700)' : 'var(--amber-700)'};">${order.status}</span>`;
    }

    this.openModal('modalDetailPesanan');
  }

  bindNewOrder() {
    const custInput = document.getElementById('newOrderCustomerInput');
    const custDropdown = document.getElementById('newOrderCustomerDropdown');
    const weightInput = document.getElementById('newOrderWeight');
    const rateInput = document.getElementById('newOrderRate');
    const serviceSelect = document.getElementById('newOrderService');
    const btnCancel = document.getElementById('btnCancelNewOrder');
    const formNewOrder = document.getElementById('formNewOrder');
    const btnOpenAddCustomer = document.getElementById('btnOpenAddCustomerModal');

    if (custInput && custDropdown) {
      const showSuggestions = () => {
        const q = custInput.value.toLowerCase().trim();
        const customers = window.sativaStore.getCustomers();
        const filtered = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)) : customers;

        if (filtered.length === 0) {
          custDropdown.innerHTML = `<div style="padding: 0.75rem 1rem; color: var(--slate-500); font-size: 0.85rem;">Pelanggan tidak ditemukan</div>`;
        } else {
          custDropdown.innerHTML = filtered.map(c => `
            <div class="combobox-item" data-cust-name="${c.name}">
              <div>
                <div class="combobox-item-name">${c.name}</div>
                <div class="combobox-item-desc">${c.phone}</div>
              </div>
              <span style="font-size: 0.75rem; color: var(--sky-700);">Pilih</span>
            </div>
          `).join('');
        }

        custDropdown.classList.add('active');

        custDropdown.querySelectorAll('.combobox-item').forEach(item => {
          item.addEventListener('click', () => {
            const chosenName = item.getAttribute('data-cust-name');
            custInput.value = chosenName;
            custDropdown.classList.remove('active');
            this.updateNewOrderCustomerPreview(chosenName);
          });
        });
      };

      custInput.addEventListener('focus', showSuggestions);
      custInput.addEventListener('input', showSuggestions);
    }

    [weightInput, rateInput, serviceSelect].forEach(elem => {
      if (elem) {
        elem.addEventListener('input', () => this.calculateNewOrderSummary());
      }
    });

    if (btnCancel) {
      btnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('pesanan');
      });
    }

    if (btnOpenAddCustomer) {
      btnOpenAddCustomer.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal('modalTambahPelanggan');
      });
    }

    if (formNewOrder) {
      formNewOrder.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitNewOrder();
      });
    }
  }

  initNewOrderForm() {
    const custInput = document.getElementById('newOrderCustomerInput');
    if (custInput) {
      custInput.value = '';
    }
    const estDateInput = document.getElementById('newOrderEstimateDate');
    const estTimeInput = document.getElementById('newOrderEstimateTime');
    if (estDateInput) estDateInput.value = getTodayISO();
    if (estTimeInput && !estTimeInput.value) estTimeInput.value = '17:00';

    this.updateNewOrderCustomerPreview('');
    this.calculateNewOrderSummary();
  }

  updateNewOrderCustomerPreview(customerName = '') {
    const previewEl = document.getElementById('newOrderCustomerPreview');
    if (!previewEl) return;

    const trimmed = (customerName || '').trim();
    if (!trimmed) {
      previewEl.innerHTML = 'Belum ada pelanggan dipilih. Ketik nama untuk mencari atau daftarkan pelanggan baru.';
      return;
    }

    const customer = window.sativaStore.getCustomerByName(trimmed);
    if (customer) {
      previewEl.innerHTML = `${customer.name} · ${customer.phone}<br>${customer.address}`;
    } else {
      previewEl.innerHTML = `${trimmed} · Pelanggan baru / tidak terdaftar`;
    }
  }

  calculateNewOrderSummary() {
    const weightInput = document.getElementById('newOrderWeight');
    const rateInput = document.getElementById('newOrderRate');
    const serviceSelect = document.getElementById('newOrderService');

    const weight = parseFloat(weightInput?.value) || 3;
    const rate = parseInt((rateInput?.value || '').replace(/\D/g, '')) || 7000;
    const total = weight * rate;

    const summaryServiceEl = document.getElementById('summaryServiceLine');
    const summaryTotalEl = document.getElementById('summaryTotalAmount');
    const summaryPaymentNoteEl = document.getElementById('summaryPaymentNote');

    const serviceName = serviceSelect?.value || 'Cuci + setrika reguler';

    if (summaryServiceEl) {
      summaryServiceEl.innerHTML = `${serviceName}<br>${weight} kg × ${formatRupiah(rate)}`;
    }
    if (summaryTotalEl) {
      summaryTotalEl.textContent = `Total ${formatRupiah(total)}`;
    }
    if (summaryPaymentNoteEl) {
      summaryPaymentNoteEl.textContent = `Pembayaran ${formatRupiah(total)} diterima`;
    }
  }

  submitNewOrder() {
    const custInput = document.getElementById('newOrderCustomerInput');
    const rawCustName = (custInput?.value || '').trim();
    if (!rawCustName) {
      alert('Pilih atau masukkan nama pelanggan terlebih dahulu!');
      custInput?.focus();
      return;
    }

    const customer = window.sativaStore.getCustomerByName(rawCustName);
    const weight = parseFloat(document.getElementById('newOrderWeight')?.value) || 3;
    const rate = 7000;
    const total = weight * rate;
    const serviceType = document.getElementById('newOrderService')?.value || 'Cuci + setrika reguler';
    const items = document.getElementById('newOrderItems')?.value || 'Pakaian campur';
    const notes = document.getElementById('newOrderNotes')?.value || 'Pisahkan pakaian putih';
    const paymentMethod = document.getElementById('newOrderPaymentMethod')?.value || 'Tunai';

    const estDateVal = document.getElementById('newOrderEstimateDate')?.value || getTodayISO();
    const estTimeVal = document.getElementById('newOrderEstimateTime')?.value || '17:00';
    const estDateFormatted = `${formatIndonesianDate(estDateVal, true)} · ${estTimeVal.replace(':', '.')} WIB`;

    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
    const todayShort = formatIndonesianDate(getTodayISO(), true);

    const randNum = String(Math.floor(Math.random() * 900) + 100);
    const newId = `STL-261116-${randNum}`;

    const newOrder = {
      id: newId,
      customerName: customer ? customer.name : rawCustName,
      customerPhone: customer ? customer.phone : '0812-0000-0000',
      customerAddress: customer ? customer.address : 'Malang',
      service: 'Cuci + setrika',
      serviceType: serviceType,
      weight: weight,
      rate: rate,
      items: items,
      total: total,
      status: 'Diterima',
      paymentStatus: 'LUNAS',
      paymentMethod: paymentMethod,
      orderDate: `${todayShort} · ${nowTime}`,
      estimateDate: estDateFormatted,
      notes: notes,
      shelf: '',
      history: [
        { time: `${now.getDate()} ${formatIndonesianDate(getTodayISO(), true).split(' ')[1]} · ${nowTime}`, status: 'Diterima' }
      ]
    };

    window.sativaStore.saveOrder(newOrder);
    this.currentReceiptOrder = newOrder;

    this.switchTab('nota-qr');
  }

  renderReceipt() {
    const order = this.currentReceiptOrder || window.sativaStore.getOrderById('STL-261114-021') || window.sativaStore.getOrders()[0];
    if (!order) return;

    const receiptSubtitleEl = document.getElementById('receiptPageSubtitle');
    const receiptOrderCodeEl = document.getElementById('receiptOrderCode');
    const receiptCustomerInfoEl = document.getElementById('receiptCustomerInfo');
    const receiptItemsLineEl = document.getElementById('receiptItemsLine');
    const receiptTotalLineEl = document.getElementById('receiptTotalLine');
    const receiptEstimateEl = document.getElementById('receiptEstimate');
    const receiptQRImg = document.getElementById('receiptQRImg');
    const receiptQRLabel = document.getElementById('receiptQRLabel');
    const whatsappDestinationEl = document.getElementById('whatsappDestination');

    if (receiptSubtitleEl) {
      receiptSubtitleEl.textContent = `${order.id} · ${order.orderDate || '14 November 2026, 09.00 WIB'}`;
    }
    if (receiptOrderCodeEl) {
      receiptOrderCodeEl.textContent = order.id;
    }
    if (receiptCustomerInfoEl) {
      receiptCustomerInfoEl.innerHTML = `
        ${order.orderDate || '14 Nov 2026 · 09.00'}<br>
        ${order.customerName} · ${order.customerPhone}<br>
        ${order.customerAddress}
      `;
    }
    if (receiptItemsLineEl) {
      receiptItemsLineEl.innerHTML = `
        ${order.serviceType || 'Cuci + setrika reguler'}<br>
        ${order.items || 'Pakaian campur'}<br>
        ${order.weight} kg × ${formatRupiah(order.rate || 7000)}
      `;
    }
    if (receiptTotalLineEl) {
      receiptTotalLineEl.innerHTML = `
        <strong>TOTAL ${formatRupiah(order.total)}</strong><br>
        ${order.paymentStatus || 'LUNAS'} · ${order.paymentMethod || 'Tunai'}
      `;
    }
    if (receiptEstimateEl) {
      receiptEstimateEl.textContent = `Estimasi: ${order.estimateDate || '16 Nov 2026 · 17.00'}`;
    }
    if (receiptQRImg) {
      receiptQRImg.src = 'assets/img/qrContoh.png';
      receiptQRImg.alt = `QR Pesanan ${order.id}`;
    }
    if (receiptQRLabel) {
      receiptQRLabel.textContent = `QR Pesanan · ${order.id}`;
    }
    if (whatsappDestinationEl) {
      whatsappDestinationEl.innerHTML = `Tujuan: ${order.customerPhone}<br>${order.orderDate || '14 Nov 2026 · 09.00 WIB'}`;
    }

    const btnReprint = document.getElementById('btnReprintReceipt');
    if (btnReprint) {
      btnReprint.onclick = () => {
        const dialogDesc = document.getElementById('dialogNotaDesc');
        if (dialogDesc) {
          dialogDesc.textContent = `Nota dan label QR ${order.id} dicetak ulang. Tempelkan label pada keranjang laundry.`;
        }
        this.openModal('modalNotaDicetak');
      };
    }

    const btnCheckWA = document.getElementById('btnCheckWA');
    if (btnCheckWA) {
      btnCheckWA.onclick = () => {
        alert(`Tautan pelacakan WhatsApp untuk ${order.customerName} (${order.id}):\nhttps://sativa-laundry.test/lacak?kode=${order.id}`);
      };
    }

    const btnBackToDashboard = document.getElementById('btnBackToDashboard');
    if (btnBackToDashboard) {
      btnBackToDashboard.onclick = () => {
        this.switchTab('pesanan');
      };
    }
  }

  bindScanQR() {
    const btnActivateCamera = document.getElementById('btnActivateCamera');
    const btnSearchScanCode = document.getElementById('btnSearchScanCode');
    const inputScanCode = document.getElementById('inputScanCode');
    const btnConfirmStatus = document.getElementById('btnConfirmStatus');
    const btnRetryWA = document.getElementById('btnRetryWA');

    this.cameraStream = null;
    this.barcodeInterval = null;

    const scanOrderDropdown = document.getElementById('scanOrderDropdown');

    if (btnActivateCamera) {
      btnActivateCamera.addEventListener('click', () => {
        this.toggleCamera();
      });
    }

    if (btnSearchScanCode) {
      btnSearchScanCode.addEventListener('click', () => {
        if (scanOrderDropdown) scanOrderDropdown.classList.remove('active');
        this.searchOrderByScanInput();
      });
    }

    if (inputScanCode) {
      const showScanSuggestions = () => {
        if (!scanOrderDropdown) return;
        const q = inputScanCode.value.toLowerCase().trim();
        const orders = window.sativaStore.getOrders();
        const filtered = q
          ? orders.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
          : orders.slice(0, 6);

        if (filtered.length === 0) {
          scanOrderDropdown.innerHTML = `<div style="padding: 0.75rem 1rem; color: var(--slate-500); font-size: 0.85rem;">Pesanan tidak ditemukan</div>`;
        } else {
          scanOrderDropdown.innerHTML = filtered.map(o => `
            <div class="combobox-item" data-scan-order-id="${o.id}">
              <div>
                <div class="combobox-item-name">${o.id} · ${o.customerName}</div>
                <div class="combobox-item-desc">${o.service} · ${o.weight} kg · ${o.status}</div>
              </div>
              <span style="font-size: 0.75rem; color: var(--sky-700);">Pilih</span>
            </div>
          `).join('');
        }

        scanOrderDropdown.classList.add('active');

        scanOrderDropdown.querySelectorAll('.combobox-item').forEach(item => {
          item.addEventListener('click', () => {
            const orderId = item.getAttribute('data-scan-order-id');
            const chosenOrder = window.sativaStore.getOrderById(orderId);
            if (chosenOrder) {
              inputScanCode.value = chosenOrder.id;
              scanOrderDropdown.classList.remove('active');
              this.activeOrderInScan = chosenOrder;
              this.renderScanOrderDetail();
            }
          });
        });
      };

      inputScanCode.addEventListener('focus', showScanSuggestions);
      inputScanCode.addEventListener('input', showScanSuggestions);
      inputScanCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (scanOrderDropdown) scanOrderDropdown.classList.remove('active');
          this.searchOrderByScanInput();
        }
      });
    }

    if (btnConfirmStatus) {
      btnConfirmStatus.addEventListener('click', () => {
        this.confirmStatusUpdate();
      });
    }

    const statusTransitionSelect = document.getElementById('scanStatusTransitionSelect');
    if (statusTransitionSelect) {
      statusTransitionSelect.addEventListener('change', () => {
        this.updateScanTransitionUI(statusTransitionSelect.value);
      });
    }

    if (btnRetryWA) {
      btnRetryWA.addEventListener('click', () => {
        const order = this.activeOrderInScan || window.sativaStore.getOrderById('STL-261114-021');
        const banner = document.getElementById('scanWABanner');
        const bannerTitle = document.getElementById('scanWABannerTitle');
        const bannerDesc = document.getElementById('scanWABannerDesc');

        if (banner) {
          banner.classList.remove('alert-danger-banner');
          banner.classList.add('alert-success-banner');
        }

        if (bannerTitle) {
          bannerTitle.innerHTML = `<span style="color: var(--green-700); font-weight: 700;">Notifikasi WhatsApp terkirim</span>`;
        }

        if (bannerDesc && order) {
          bannerDesc.textContent = `Pelanggan telah menerima informasi terbaru untuk pesanan ${order.id}.`;
        }

        const dialogWADesc = document.getElementById('dialogNotifikasiDesc');
        if (dialogWADesc && order) {
          dialogWADesc.textContent = `WhatsApp untuk pesanan ${order.id} berhasil dikirim ulang ke ${order.customerPhone}.`;
        }
        this.openModal('modalNotifikasiTerkirim');
      });
    }
  }

  toggleCamera() {
    const viewport = document.getElementById('scannerViewport');
    const video = document.getElementById('cameraStream');
    const btn = document.getElementById('btnActivateCamera');

    if (!viewport || !video) return;

    if (this.cameraStream) {
      this.stopCamera();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Browser tidak mendukung akses kamera. Gunakan input kode sebagai alternatif.');
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    })
    .then(stream => {
      this.cameraStream = stream;
      video.srcObject = stream;
      viewport.classList.add('camera-active');
      if (btn) btn.textContent = 'Matikan kamera';

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        this.barcodeInterval = setInterval(async () => {
          if (!this.cameraStream || video.readyState < 2) return;
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              const scannedValue = barcodes[0].rawValue.trim();
              const order = window.sativaStore.getOrderById(scannedValue);
              if (order) {
                this.stopCamera();
                const inputEl = document.getElementById('inputScanCode');
                if (inputEl) inputEl.value = order.id;
                this.activeOrderInScan = order;
                this.renderScanOrderDetail();
                const dialogQRDesc = document.getElementById('dialogQRDesc');
                if (dialogQRDesc) {
                  dialogQRDesc.textContent = `QR berhasil dipindai: ${order.id} · ${order.customerName}. Lanjutkan untuk memperbarui status.`;
                }
                this.openModal('modalQRDikenali');
              }
            }
          } catch (_) {}
        }, 500);
      }
    })
    .catch(() => {
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan pada browser, atau gunakan input kode manual.');
    });
  }

  stopCamera() {
    if (this.barcodeInterval) {
      clearInterval(this.barcodeInterval);
      this.barcodeInterval = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    const viewport = document.getElementById('scannerViewport');
    const video = document.getElementById('cameraStream');
    const btn = document.getElementById('btnActivateCamera');
    if (viewport) viewport.classList.remove('camera-active');
    if (video) video.srcObject = null;
    if (btn) btn.textContent = 'Aktifkan kamera';
  }

  searchOrderByScanInput() {
    const inputScanCode = document.getElementById('inputScanCode');
    const query = (inputScanCode?.value || '').trim();

    if (!query) {
      alert('Masukkan kode pesanan atau nama pelanggan terlebih dahulu.');
      return;
    }

    const exactOrder = window.sativaStore.getOrderById(query);
    if (exactOrder) {
      this.activeOrderInScan = exactOrder;
      if (inputScanCode) inputScanCode.value = exactOrder.id;
      this.renderScanOrderDetail();
      return;
    }

    const matchedOrders = window.sativaStore.searchOrders(query);

    if (matchedOrders.length === 1) {
      this.activeOrderInScan = matchedOrders[0];
      if (inputScanCode) inputScanCode.value = matchedOrders[0].id;
      this.renderScanOrderDetail();
    } else if (matchedOrders.length > 1) {
      this.showScanSearchResults(matchedOrders, query);
    } else {
      alert('Pesanan tidak ditemukan. Periksa kembali kode atau nama pelanggan.');
    }
  }

  showScanSearchResults(orders, query) {
    const scanOrderHeader = document.getElementById('scanOrderHeader');
    const scanOrderDetails = document.getElementById('scanOrderDetails');
    const scanHistoryContainer = document.getElementById('scanHistoryContainer');
    const scanNextStepNote = document.getElementById('scanNextStepNote');
    const statusGroup = document.getElementById('scanStatusTransitionSelect')?.closest('.form-group');
    const shelfGroup = document.getElementById('scanShelfGroup');
    const btnConfirm = document.getElementById('btnConfirmStatus');
    const scanConfirmNote = document.getElementById('scanConfirmNote');
    const waBanner = document.getElementById('scanWABanner');

    if (scanOrderHeader) {
      scanOrderHeader.textContent = `${orders.length} pesanan ditemukan`;
    }
    if (scanOrderDetails) {
      scanOrderDetails.textContent = `Hasil pencarian untuk "${query}". Pilih pesanan di bawah:`;
    }
    if (statusGroup) statusGroup.style.display = 'none';
    if (shelfGroup) shelfGroup.style.display = 'none';
    if (scanNextStepNote) scanNextStepNote.style.display = 'none';
    if (btnConfirm) btnConfirm.style.display = 'none';
    if (scanConfirmNote) scanConfirmNote.style.display = 'none';

    if (scanHistoryContainer) {
      scanHistoryContainer.innerHTML = orders.map(o => `
        <div class="scan-search-result-item" data-pick-order="${o.id}" style="padding: 0.75rem; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); margin-bottom: 0.5rem; cursor: pointer; transition: background 0.15s;">
          <div style="font-weight: 700; color: var(--slate-900); margin-bottom: 0.25rem;">${o.id} · ${o.customerName}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary);">${o.service} · ${o.weight} kg · ${o.status}</div>
        </div>
      `).join('');

      scanHistoryContainer.querySelectorAll('[data-pick-order]').forEach(item => {
        item.addEventListener('click', () => {
          const orderId = item.getAttribute('data-pick-order');
          const order = window.sativaStore.getOrderById(orderId);
          if (order) {
            this.activeOrderInScan = order;
            const inputEl = document.getElementById('inputScanCode');
            if (inputEl) inputEl.value = order.id;
            this.renderScanOrderDetail();
          }
        });

        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#F8FAFC';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = '';
        });
      });
    }

    if (waBanner) waBanner.style.display = 'none';
  }

  renderScanQR() {
    const order = this.activeOrderInScan;
    if (order) {
      this.renderScanOrderDetail();
    } else {
      this.resetScanPanel();
    }
  }

  resetScanPanel() {
    const scanOrderHeader = document.getElementById('scanOrderHeader');
    const scanOrderDetails = document.getElementById('scanOrderDetails');
    const currentStatusText = document.getElementById('scanCurrentStatusText');
    const statusSelect = document.getElementById('scanStatusTransitionSelect');
    const statusGroup = statusSelect?.closest('.form-group');
    const shelfGroup = document.getElementById('scanShelfGroup');
    const scanNextStepNote = document.getElementById('scanNextStepNote');
    const btnConfirm = document.getElementById('btnConfirmStatus');
    const scanConfirmNote = document.getElementById('scanConfirmNote');
    const scanHistoryContainer = document.getElementById('scanHistoryContainer');
    const waBanner = document.getElementById('scanWABanner');

    if (scanOrderHeader) scanOrderHeader.textContent = 'Belum ada pesanan';
    if (scanOrderDetails) scanOrderDetails.textContent = 'Pindai QR atau masukkan kode/nama pelanggan untuk mencari pesanan.';
    if (statusGroup) statusGroup.style.display = '';
    if (currentStatusText) currentStatusText.textContent = '–';
    if (statusSelect) {
      statusSelect.value = 'Diterima';
      statusSelect.disabled = true;
    }
    if (shelfGroup) shelfGroup.style.display = 'none';
    if (scanNextStepNote) {
      scanNextStepNote.style.display = '';
      scanNextStepNote.textContent = 'Pilih pesanan terlebih dahulu untuk memperbarui tahap pengerjaan.';
    }
    if (btnConfirm) {
      btnConfirm.style.display = '';
      btnConfirm.disabled = true;
    }
    if (scanConfirmNote) {
      scanConfirmNote.style.display = '';
      scanConfirmNote.textContent = 'Pilih pesanan terlebih dahulu untuk memperbarui status.';
    }
    if (scanHistoryContainer) scanHistoryContainer.innerHTML = '<div style="color: var(--slate-500); font-size: 0.85rem;">Belum ada riwayat.</div>';
    if (waBanner) waBanner.style.display = 'none';
  }

  updateScanTransitionUI(targetStatus) {
    const shelfGroup = document.getElementById('scanShelfGroup');
    const scanNextStepNote = document.getElementById('scanNextStepNote');
    const scanConfirmNote = document.getElementById('scanConfirmNote');

    if (shelfGroup) {
      shelfGroup.style.display = targetStatus === 'Selesai' ? 'flex' : 'none';
    }

    const noteMap = {
      'Diterima': {
        next: 'Status akan diubah ke Diterima. Waktu perubahan tercatat otomatis.',
        confirm: 'Setelah berhasil: status pesanan diperbarui menjadi Diterima.'
      },
      'Dicuci': {
        next: 'Tahap berikutnya: pakaian masuk proses pencucian. Waktu perubahan tercatat otomatis.',
        confirm: 'Setelah berhasil: status pesanan diperbarui menjadi Dicuci.'
      },
      'Disetrika': {
        next: 'Tahap berikutnya: pakaian masuk proses penyetrikaan. Waktu perubahan tercatat otomatis.',
        confirm: 'Setelah berhasil: status pesanan diperbarui menjadi Disetrika.'
      },
      'Selesai': {
        next: 'Tahap berikutnya: selesai dan siap diambil. Waktu perubahan tercatat otomatis.',
        confirm: 'Setelah berhasil: status menjadi Selesai dan notifikasi WhatsApp dikirim otomatis.'
      },
      'Diambil': {
        next: 'Tahap berikutnya: konfirmasi pengambilan oleh pelanggan. Waktu perubahan tercatat otomatis.',
        confirm: 'Setelah berhasil: status pesanan diperbarui menjadi Diambil.'
      }
    };

    const info = noteMap[targetStatus] || {
      next: 'Waktu perubahan tercatat otomatis.',
      confirm: `Setelah berhasil: status pesanan diperbarui menjadi ${targetStatus}.`
    };

    if (scanNextStepNote) scanNextStepNote.textContent = info.next;
    if (scanConfirmNote) scanConfirmNote.textContent = info.confirm;
  }

  renderScanOrderDetail(preserveWABanner = false) {
    const order = this.activeOrderInScan;
    if (!order) return;

    const inputCode = document.getElementById('inputScanCode');
    if (inputCode && !inputCode.value) inputCode.value = order.id;

    const scanOrderHeader = document.getElementById('scanOrderHeader');
    const scanOrderDetails = document.getElementById('scanOrderDetails');
    const currentStatusText = document.getElementById('scanCurrentStatusText');
    const statusTransitionSelect = document.getElementById('scanStatusTransitionSelect');
    const statusGroup = statusTransitionSelect?.closest('.form-group');
    const shelfSelect = document.getElementById('scanShelfSelect');
    const scanNextStepNote = document.getElementById('scanNextStepNote');
    const btnConfirm = document.getElementById('btnConfirmStatus');
    const scanConfirmNote = document.getElementById('scanConfirmNote');
    const scanHistoryContainer = document.getElementById('scanHistoryContainer');
    const waBanner = document.getElementById('scanWABanner');

    if (statusGroup) statusGroup.style.display = '';
    if (scanNextStepNote) scanNextStepNote.style.display = '';
    if (btnConfirm) {
      btnConfirm.style.display = '';
      btnConfirm.disabled = false;
    }
    if (scanConfirmNote) scanConfirmNote.style.display = '';

    if (waBanner && (!preserveWABanner || order.status !== 'Selesai')) {
      waBanner.style.display = 'none';
    }

    if (scanOrderHeader) {
      scanOrderHeader.textContent = `${order.id} · ${order.customerName}`;
    }
    if (scanOrderDetails) {
      scanOrderDetails.textContent = `${order.service} · ${order.weight} kg · Lunas ${formatRupiah(order.total)}`;
    }
    if (currentStatusText) {
      currentStatusText.textContent = order.status;
    }

    const nextRecommendedMap = {
      'Diterima': 'Dicuci',
      'Dicuci': 'Disetrika',
      'Disetrika': 'Selesai',
      'Selesai': 'Diambil',
      'Diambil': 'Diambil'
    };
    const recommendedNext = nextRecommendedMap[order.status] || 'Dicuci';

    if (statusTransitionSelect) {
      statusTransitionSelect.disabled = false;
      statusTransitionSelect.innerHTML = `
        <option value="Diterima">Diterima</option>
        <option value="Dicuci">Dicuci</option>
        <option value="Disetrika">Disetrika</option>
        <option value="Selesai">Selesai</option>
        <option value="Diambil">Diambil</option>
      `;
      statusTransitionSelect.value = recommendedNext;
    }

    this.updateScanTransitionUI(recommendedNext);

    if (shelfSelect) {
      shelfSelect.value = order.shelf || '01';
    }

    if (scanHistoryContainer && order.history) {
      scanHistoryContainer.innerHTML = order.history.map(h => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
          <span style="color: var(--color-text-secondary);">${h.time}</span>
          <strong style="color: var(--slate-900);">${h.status}</strong>
        </div>
      `).join('');
    }
  }

  confirmStatusUpdate() {
    const order = this.activeOrderInScan;
    if (!order) return;

    const nextStatusSelect = document.getElementById('scanStatusTransitionSelect');
    const shelfSelect = document.getElementById('scanShelfSelect');
    const targetStatus = nextStatusSelect?.value || 'Selesai';
    const shelf = targetStatus === 'Selesai' ? (shelfSelect?.value || '01') : '';

    const updated = window.sativaStore.updateOrderStatus(order.id, targetStatus, shelf);
    if (updated) {
      this.activeOrderInScan = updated;

      const waBanner = document.getElementById('scanWABanner');
      const bannerTitle = document.getElementById('scanWABannerTitle');
      const bannerDesc = document.getElementById('scanWABannerDesc');

      if (targetStatus === 'Selesai' && waBanner) {
        waBanner.style.display = '';
        waBanner.classList.remove('alert-success-banner');
        waBanner.classList.add('alert-danger-banner');
        if (bannerTitle) {
          bannerTitle.innerHTML = '<span>⚠</span> Status tersimpan · WhatsApp gagal';
        }
        if (bannerDesc) {
          bannerDesc.textContent = 'Gangguan gateway tidak membatalkan perubahan status. Petugas dapat melihat kegagalan pengiriman.';
        }
      } else if (waBanner) {
        waBanner.style.display = 'none';
      }

      this.renderScanOrderDetail(targetStatus === 'Selesai');
      this.renderDashboard();

      const dialogStatusDesc = document.getElementById('dialogStatusDiubahDesc');
      if (dialogStatusDesc) {
        dialogStatusDesc.textContent = `Status pesanan ${updated.id} · ${updated.customerName} berhasil dirubah menjadi "${targetStatus}".`;
      }
      this.openModal('modalStatusDiubah');
    }
  }

  bindCustomers() {
    const searchInput = document.getElementById('searchCustomerInput');
    const searchDropdown = document.getElementById('searchCustomerDropdown');
    const btnOpenAddCustomer = document.getElementById('btnOpenAddCustomerInPage');
    const formEditCustomer = document.getElementById('formEditCustomer');
    const btnCancelEditCustomer = document.getElementById('btnCancelEditCustomer');

    if (searchInput && searchDropdown) {
      const showCustomerSuggestions = () => {
        const q = searchInput.value.toLowerCase().trim();
        const customers = window.sativaStore.getCustomers();
        const filtered = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)) : customers;

        if (filtered.length === 0) {
          searchDropdown.innerHTML = `<div style="padding: 0.75rem 1rem; color: var(--slate-500); font-size: 0.85rem;">Pelanggan tidak ditemukan</div>`;
        } else {
          searchDropdown.innerHTML = filtered.map(c => `
            <div class="combobox-item" data-cust-id="${c.id}">
              <div>
                <div class="combobox-item-name">${c.name}</div>
                <div class="combobox-item-desc">${c.phone} · ${c.address}</div>
              </div>
              <span style="font-size: 0.75rem; color: var(--sky-700);">Pilih</span>
            </div>
          `).join('');
        }

        searchDropdown.classList.add('active');

        searchDropdown.querySelectorAll('.combobox-item').forEach(item => {
          item.addEventListener('click', () => {
            const custId = item.getAttribute('data-cust-id');
            const customer = window.sativaStore.getCustomers().find(c => c.id === custId);
            if (customer) {
              searchInput.value = customer.name;
              searchDropdown.classList.remove('active');
              this.selectedCustomer = customer;
              this.populateEditCustomerForm(customer);
              this.filterAndRenderCustomers();
            }
          });
        });
      };

      searchInput.addEventListener('focus', showCustomerSuggestions);
      searchInput.addEventListener('input', () => {
        showCustomerSuggestions();
        this.filterAndRenderCustomers();
      });
    }

    if (btnOpenAddCustomer) {
      btnOpenAddCustomer.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal('modalTambahPelanggan');
      });
    }

    if (btnCancelEditCustomer) {
      btnCancelEditCustomer.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('pesanan');
      });
    }

    if (formEditCustomer) {
      formEditCustomer.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCustomerChanges();
      });
    }

    const formAddCustomer = document.getElementById('formAddCustomer');
    if (formAddCustomer) {
      formAddCustomer.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitNewCustomerModal();
      });
    }
  }

  renderCustomers() {
    this.selectedCustomer = null;
    const searchInput = document.getElementById('searchCustomerInput');
    if (searchInput) searchInput.value = '';
    this.clearEditCustomerForm();
    this.filterAndRenderCustomers();
  }

  clearEditCustomerForm() {
    const nameInput = document.getElementById('editCustomerName');
    const phoneInput = document.getElementById('editCustomerPhone');
    const addressInput = document.getElementById('editCustomerAddress');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (addressInput) addressInput.value = '';
  }

  filterAndRenderCustomers() {
    const searchVal = document.getElementById('searchCustomerInput')?.value || '';
    const customers = window.sativaStore.searchCustomers(searchVal);
    const tableBody = document.getElementById('customersTableBody');
    const countNote = document.getElementById('customersCountNote');

    if (countNote) {
      countNote.textContent = `${customers.length} hasil ditemukan · Nomor dan alamat merupakan data contoh.`;
    }

    if (!tableBody) return;

    if (customers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--slate-500);">Pelanggan tidak ditemukan.</td></tr>`;
      return;
    }

    tableBody.innerHTML = customers.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.phone}</td>
        <td>
          <button type="button" class="btn btn-white" data-select-customer="${c.id}" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;">
            ${this.selectedCustomer?.id === c.id ? 'Dipilih' : 'Pilih'}
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('[data-select-customer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const custId = btn.getAttribute('data-select-customer');
        const customer = window.sativaStore.getCustomers().find(c => c.id === custId);
        if (customer) {
          this.selectedCustomer = customer;
          this.populateEditCustomerForm(customer);
          this.filterAndRenderCustomers();
        }
      });
    });
  }

  populateEditCustomerForm(customer) {
    this.selectedCustomer = customer;
    const nameInput = document.getElementById('editCustomerName');
    const phoneInput = document.getElementById('editCustomerPhone');
    const addressInput = document.getElementById('editCustomerAddress');

    if (nameInput) nameInput.value = customer.name;
    if (phoneInput) phoneInput.value = customer.phone;
    if (addressInput) addressInput.value = customer.address;
  }

  saveCustomerChanges() {
    if (!this.selectedCustomer) {
      alert('Pilih pelanggan dari tabel atau pencarian terlebih dahulu!');
      return;
    }

    const name = document.getElementById('editCustomerName')?.value || '';
    const phone = document.getElementById('editCustomerPhone')?.value || '';
    const address = document.getElementById('editCustomerAddress')?.value || '';

    if (!name || !phone || !address) {
      alert('Nama lengkap, nomor WhatsApp, dan alamat wajib diisi!');
      return;
    }

    const updated = {
      ...this.selectedCustomer,
      name,
      phone,
      address
    };

    window.sativaStore.saveCustomer(updated);
    this.selectedCustomer = updated;
    this.filterAndRenderCustomers();
    this.openModal('modalDataPelangganTersimpan');
  }

  submitNewCustomerModal() {
    const name = document.getElementById('addCustomerName')?.value || '';
    const phone = document.getElementById('addCustomerPhone')?.value || '';
    const address = document.getElementById('addCustomerAddress')?.value || '';

    if (!name || !phone || !address) {
      alert('Semua field wajib diisi!');
      return;
    }

    const newCust = window.sativaStore.saveCustomer({ name, phone, address });
    this.closeModal('modalTambahPelanggan');

    document.getElementById('formAddCustomer')?.reset();

    this.openModal('modalPelangganBaruTerdaftar');

    if (this.currentTab === 'pelanggan') {
      this.selectedCustomer = newCust;
      this.renderCustomers();
    } else if (this.currentTab === 'pesanan-baru') {
      const custInput = document.getElementById('newOrderCustomerInput');
      if (custInput) custInput.value = newCust.name;
      this.updateNewOrderCustomerPreview(newCust.name);
    }
  }

  bindExpenses() {
    const formExpense = document.getElementById('formExpense');
    const btnCancel = document.getElementById('btnCancelExpense');

    if (btnCancel) {
      btnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('pesanan');
      });
    }

    if (formExpense) {
      formExpense.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitExpense();
      });
    }
  }

  renderExpenses() {
    const expenseDateInput = document.getElementById('expenseDate');
    if (expenseDateInput && !expenseDateInput.value) {
      expenseDateInput.value = getTodayISO();
    }

    const todayData = window.sativaStore.getTodayExpensesTotal();

    const totalEl = document.getElementById('expenseTotalAmount');
    const countEl = document.getElementById('expenseTotalCount');
    const listBody = document.getElementById('expenseListBody');

    const displayDate = formatIndonesianDate(expenseDateInput?.value || getTodayISO(), false);
    if (totalEl) totalEl.textContent = formatRupiah(todayData.total);
    if (countEl) countEl.textContent = `${todayData.count} catatan · ${displayDate}`;

    if (!listBody) return;

    listBody.innerHTML = todayData.items.map(item => `
      <tr>
        <td><strong>${item.description}</strong></td>
        <td>${item.time}</td>
        <td>${formatRupiah(item.amount)}</td>
      </tr>
    `).join('');
  }

  submitExpense() {
    const desc = document.getElementById('expenseDescription')?.value || '';
    const category = document.getElementById('expenseCategory')?.value || 'Bahan laundry';
    const amountStr = document.getElementById('expenseAmount')?.value || '0';
    const amount = parseInt(amountStr.replace(/\D/g, '')) || 0;
    const rawDate = document.getElementById('expenseDate')?.value || getTodayISO();
    const date = formatIndonesianDate(rawDate, false);

    if (!desc || amount <= 0) {
      alert('Keterangan dan nominal (> Rp0) wajib diisi!');
      return;
    }

    const newExp = window.sativaStore.saveExpense({
      category,
      description: desc,
      amount,
      date
    });

    const dialogDesc = document.getElementById('dialogPengeluaranDesc');
    const todayData = window.sativaStore.getTodayExpensesTotal();
    if (dialogDesc) {
      dialogDesc.textContent = `${newExp.description} ${formatRupiah(newExp.amount)} tercatat. Total hari ini ${formatRupiah(todayData.total)} dari ${todayData.count} catatan. Laporan pemilik diperbarui.`;
    }

    this.renderExpenses();
    document.getElementById('formExpense')?.reset();
    const expDateEl = document.getElementById('expenseDate');
    if (expDateEl) expDateEl.value = getTodayISO();
    document.getElementById('expenseAmount').value = 'Rp30.000';

    this.openModal('modalPengeluaranTersimpan');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sativaApp = new SativaApp();
  window.sativaApp.init();
});
