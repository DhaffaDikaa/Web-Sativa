
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trackingForm");
    const orderCodeInput = document.getElementById("orderCode");
    const errorMessage = document.getElementById("errorMessage");
    const orderSummary = document.getElementById("orderSummary");
    const detailSection = document.getElementById("detailSection");
    const backButton = document.getElementById("backButton");
    const notFoundButton = document.getElementById("notFoundButton");
    const scanButton = document.getElementById("scanButton");

    const statusSteps = [
        "Diterima",
        "Dicuci",
        "Disetrika",
        "Selesai",
        "Diambil"
    ];

    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(value || 0);
    }

    function getStatusIndex(status) {
        return statusSteps.indexOf(status);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
        orderSummary.style.display = "none";
        detailSection.style.display = "none";
    }

    function hideError() {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    function showOrder(order) {
        hideError();

        orderSummary.style.display = "block";
        detailSection.style.display = "none";

        document.getElementById("statusText").textContent =
            `Pesanan ${order.status.toLowerCase()}`;

        document.getElementById("weightText").textContent =
            `${order.weight} kg`;

        const progress = getStatusIndex(order.status);

        document.getElementById("progressFill").style.width =
            `${((progress + 1) / statusSteps.length) * 100}%`;

        document.getElementById("orderInfo").textContent =
            `Pesanan ${order.id} atas nama ${order.customerName}`;

        renderDetails(order);
    }

    function renderDetails(order) {
        document.getElementById("detailOrderCode").textContent = order.id;
        document.getElementById("detailStatusBadge").textContent = order.status;
        document.getElementById("detailStatusText").textContent = order.status;
        document.getElementById("detailTitle").textContent =
            `Pesanan ${order.customerName}`;

        document.getElementById("detailEstimated").textContent =
            order.estimateDate || "-";

        document.getElementById("detailDescription").textContent =
            order.serviceType || order.service || "-";

        document.getElementById("detailItems").textContent =
            order.items || "-";

        document.getElementById("detailPrice").textContent =
            formatRupiah(order.total);

        renderTimeline(order);
    }

    function renderTimeline(order) {
        const history = order.history || [];

        const timelineItems = [
            { status: "Diterima", timeId: "timeReceived" },
            { status: "Dicuci", timeId: "timeWashed" },
            { status: "Disetrika", timeId: "timeIroned" },
            { status: "Selesai", timeId: "timeFinished" },
            { status: "Diambil", timeId: "timePickedUp" }
        ];

        timelineItems.forEach(item => {
            const timeElement = document.getElementById(item.timeId);
            if (timeElement) {
                timeElement.textContent = "-";
            }
        });

        timelineItems.forEach(item => {
            const matchingHistory = history.find(
                entry => entry.status === item.status
            );

            const timeElement = document.getElementById(item.timeId);

            if (matchingHistory && timeElement) {
                timeElement.textContent = matchingHistory.time;
            }
        });
    }

    function showDetails() {
        orderSummary.style.display = "none";
        detailSection.style.display = "block";
    }

    function searchOrder(code) {
        const order = window.sativaStore.getOrderById(code);

        if (!order) {
            showError("Pesanan tidak ditemukan. Periksa kembali kode pesanan Anda.");
            return;
        }

        showOrder(order);
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const code = orderCodeInput.value.trim();

        if (!code) {
            showError("Silakan masukkan kode pesanan terlebih dahulu.");
            return;
        }

        searchOrder(code);
    });

    backButton.addEventListener("click", () => {
        detailSection.style.display = "none";
        orderSummary.style.display = "block";
    });

    scanButton.addEventListener("click", () => {
        alert("Fitur pemindaian QR belum tersedia.");
    });

    const detailButton = document.querySelector(
        "#orderSummary button"
    );

    if (detailButton) {
        detailButton.addEventListener("click", showDetails);
    }

    orderSummary.style.display = "none";
    detailSection.style.display = "none";
    errorMessage.style.display = "none";

    console.log("Halaman pelacakan pelanggan siap.");
});
