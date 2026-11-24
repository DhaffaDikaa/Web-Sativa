function formatRupiah(number) {
  return 'Rp' + Number(number).toLocaleString('id-ID');
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

    if (order.customerName.toLowerCase().includes('rani') && order.id === 'STL-261114-021') {
      this.activeOrderInScan = order;
      this.switchTab('scan-qr');
    } else {
      this.showOrderDetailModal(order);
    }
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
    if (custInput && !custInput.value) {
      custInput.value = 'Rani';
    }
    this.updateNewOrderCustomerPreview(custInput?.value || 'Rani');
    this.calculateNewOrderSummary();
  }

  updateNewOrderCustomerPreview(customerName = 'Rani') {
    const previewEl = document.getElementById('newOrderCustomerPreview');
    if (!previewEl) return;

    const customer = window.sativaStore.getCustomerByName(customerName) || {
      name: customerName,
      phone: '0812-0000-0021',
      address: 'Jl. Sigura-Gura, Malang'
    };

    previewEl.innerHTML = `${customer.name} · ${customer.phone} (contoh)<br>${customer.address}`;
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
    const customer = window.sativaStore.getCustomerByName(custInput?.value || 'Rani');
    const weight = parseFloat(document.getElementById('newOrderWeight')?.value) || 3;
    const rate = 7000;
    const total = weight * rate;
    const serviceType = document.getElementById('newOrderService')?.value || 'Cuci + setrika reguler';
    const items = document.getElementById('newOrderItems')?.value || 'Pakaian campur';
    const notes = document.getElementById('newOrderNotes')?.value || 'Pisahkan pakaian putih';
    const paymentMethod = document.getElementById('newOrderPaymentMethod')?.value || 'Tunai';

    const randNum = String(Math.floor(Math.random() * 900) + 100);
    const newId = `STL-261116-${randNum}`;

    const newOrder = {
      id: newId,
      customerName: customer ? customer.name : (custInput?.value || 'Pelanggan Baru'),
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
      orderDate: '14 Nov 2026 · 09.00',
      estimateDate: '16 Nov 2026 · 17.00 WIB',
      notes: notes,
      shelf: '',
      history: [
        { time: '14 Nov · 09.00', status: 'Diterima' }
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

    if (btnActivateCamera) {
      btnActivateCamera.addEventListener('click', () => {
        const dialogQRDesc = document.getElementById('dialogQRDesc');
        const activeOrder = this.activeOrderInScan || window.sativaStore.getOrderById('STL-261114-021') || window.sativaStore.getOrders()[0];
        if (dialogQRDesc && activeOrder) {
          dialogQRDesc.textContent = `Simulasi pemindaian: ${activeOrder.id} · ${activeOrder.customerName}. Lanjutkan ke hasil pemindaian di halaman ini untuk memperbarui status.`;
        }
        this.openModal('modalQRDikenali');
      });
    }

    if (btnSearchScanCode) {
      btnSearchScanCode.addEventListener('click', () => {
        const code = inputScanCode?.value || '';
        const order = window.sativaStore.getOrderById(code);
        if (order) {
          this.activeOrderInScan = order;
          this.renderScanQR();
        } else {
          alert('Kode pesanan tidak ditemukan. Periksa kembali nota atau nomor pesanan.');
        }
      });
    }

    if (btnConfirmStatus) {
      btnConfirmStatus.addEventListener('click', () => {
        this.confirmStatusUpdate();
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

  renderScanQR() {
    const order = this.activeOrderInScan || window.sativaStore.getOrderById('STL-261114-021') || window.sativaStore.getOrders()[0];
    if (!order) return;

    this.activeOrderInScan = order;

    const inputCode = document.getElementById('inputScanCode');
    if (inputCode) inputCode.value = order.id;

    const scanOrderHeader = document.getElementById('scanOrderHeader');
    const scanOrderDetails = document.getElementById('scanOrderDetails');
    const statusTransitionSelect = document.getElementById('scanStatusTransitionSelect');
    const shelfSelect = document.getElementById('scanShelfSelect');
    const scanHistoryContainer = document.getElementById('scanHistoryContainer');

    if (scanOrderHeader) {
      scanOrderHeader.textContent = `${order.id} · ${order.customerName}`;
    }
    if (scanOrderDetails) {
      scanOrderDetails.textContent = `${order.service} · ${order.weight} kg · Lunas ${formatRupiah(order.total)}`;
    }

    if (statusTransitionSelect) {
      if (order.status === 'Disetrika') {
        statusTransitionSelect.innerHTML = `<option value="Selesai" selected>Disetrika → Selesai</option>`;
      } else if (order.status === 'Diterima') {
        statusTransitionSelect.innerHTML = `<option value="Dicuci" selected>Diterima → Dicuci</option>`;
      } else if (order.status === 'Dicuci') {
        statusTransitionSelect.innerHTML = `<option value="Disetrika" selected>Dicuci → Disetrika</option>`;
      } else if (order.status === 'Selesai') {
        statusTransitionSelect.innerHTML = `<option value="Diambil" selected>Selesai → Diambil</option>`;
      } else {
        statusTransitionSelect.innerHTML = `<option value="${order.status}" selected>${order.status}</option>`;
      }
    }

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
    const shelf = shelfSelect?.value || '01';

    const updated = window.sativaStore.updateOrderStatus(order.id, targetStatus, shelf);
    if (updated) {
      this.activeOrderInScan = updated;
      alert(`Status pesanan ${updated.id} berhasil diperbarui menjadi "${targetStatus}".`);
      this.renderScanQR();
      this.renderDashboard();
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
    this.filterAndRenderCustomers();
    const rani = window.sativaStore.getCustomerByName('Rani');
    if (rani) {
      this.populateEditCustomerForm(rani);
    }
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
    if (!this.selectedCustomer) return;

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
    const todayData = window.sativaStore.getTodayExpensesTotal();

    const totalEl = document.getElementById('expenseTotalAmount');
    const countEl = document.getElementById('expenseTotalCount');
    const listBody = document.getElementById('expenseListBody');

    if (totalEl) totalEl.textContent = formatRupiah(todayData.total);
    if (countEl) countEl.textContent = `${todayData.count} catatan · 16 November 2026`;

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
    const date = document.getElementById('expenseDate')?.value || '16 November 2026';

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
    document.getElementById('expenseDate').value = '16 November 2026';
    document.getElementById('expenseAmount').value = 'Rp30.000';

    this.openModal('modalPengeluaranTersimpan');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sativaApp = new SativaApp();
  window.sativaApp.init();
});
