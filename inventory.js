const PRODUCTS_KEY = "negozioProducts";
const CART_KEY = "negozioCart";
const SALES_KEY = "negozioSales";

function saveProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // localStorage might be disabled
  }
}

function getStoredProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // localStorage might be disabled
  }
}

function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSales(sales) {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch {
    // localStorage might be disabled
  }
}

function getStoredSales() {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function addOrder(order) {
  const sales = getStoredSales();
  sales.unshift(order);
  saveSales(sales);
  return sales;
}

async function loadProducts() {
  const stored = getStoredProducts();
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  try {
    const response = await fetch("products.txt");
    const raw = await response.text();

    const products = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, category, price, stock, image, description] = line.split("|");
        return {
          id: name?.trim() ?? "",
          name: name?.trim() ?? "",
          category: category?.trim() ?? "",
          price: Number(price) || 0,
          stock: Number(stock) || 0,
          image: image?.trim() ?? "",
          description: description?.trim() ?? "",
        };
      });

    saveProducts(products);
    return products;
  } catch {
    return stored || [];
  }
}

function formatCurrency(value) {
  return `₱${value.toFixed(2)}`;
}

let currentShopFilter = null;

function renderShop(products, filter = null) {
  currentShopFilter = filter;
  const container = document.getElementById("shopCards");
  if (!container) return;

  container.innerHTML = "";

  const visibleProducts = Array.isArray(products)
    ? products.filter((product) => {
        if (!filter) return true;
        return String(product.category || "").toLowerCase().includes(
          String(filter).toLowerCase()
        );
      })
    : [];

  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img class="card__image" src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="card__body">
        <h3 class="card__title">${product.name}</h3>
        <p class="card__price">${formatCurrency(product.price)}</p>
        <p class="card__meta">${product.category.toUpperCase()}</p>
        <div class="card__actions">
          <button class="btn btn--secondary" data-action="view" data-id="${product.id}">View</button>
          <button class="btn btn--primary" data-action="add" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderAdmin(products) {
  const tbody = document.getElementById("productTableBody");
  const statsProducts = document.querySelector(".stat__value[data-stat='products']");
  const statsLowStock = document.querySelector(".stat__value[data-stat='low-stock']");

  if (statsProducts) {
    statsProducts.textContent = String(products.length);
  }

  if (statsLowStock) {
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    statsLowStock.textContent = String(lowStockCount);
  }

  if (!tbody) return;
  tbody.innerHTML = "";

  products.forEach((product, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="product-info">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <strong>${product.name}</strong>
          <span>${product.description}</span>
        </div>
      </td>
      <td>${product.category}</td>
      <td>${formatCurrency(product.price)}</td>
      <td class="${product.stock <= 5 ? "text-danger" : "text-success"}">${product.stock}</td>
      <td class="actions">
        <button class="btn btn--secondary" data-action="sell" data-index="${index}">Sell</button>
        <button class="btn btn--secondary" data-action="edit" data-index="${index}">✎</button>
        <button class="btn btn--secondary" data-action="delete" data-index="${index}">🗑️</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function getCart() {
  return getStoredCart();
}

function setCart(cart) {
  saveCart(cart);
  renderCart(cart);
  updateCartBadge(cart);
}

function findProduct(products, id) {
  return products.find((p) => p.id === id);
}

function addToCart(products, id, quantity = 1) {
  const product = findProduct(products, id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty = Math.min(product.stock, existing.qty + quantity);
  } else {
    cart.push({
      id,
      qty: Math.min(product.stock, quantity),
    });
  }

  setCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  setCart(cart);
}

function updateCartQuantity(id, qty, products) {
  const product = findProduct(products, id);
  if (!product) return;

  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty = Math.max(1, Math.min(product.stock, qty));
  setCart(cart);
}

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 10;

function calculateCartTotals(cart, products) {
  const subtotal = cart.reduce((sum, item) => {
    const product = findProduct(products, item.id);
    if (!product) return sum;
    return sum + product.price * item.qty;
  }, 0);

  const shipping = cart.length > 0 ? SHIPPING_FEE : 0;
  const freeShippingDelta = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = subtotal + shipping;

  return { subtotal, shipping, total, freeShippingDelta };
}

function updateCartBadge(cart) {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = String(totalItems);
}

function calculateSalesStats(sales) {
  const revenue = sales.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = sales.length;
  return { revenue, totalOrders };
}

function renderSales(sales) {
  const salesTable = document.getElementById("salesTableBody");
  if (!salesTable) return;

  const renderData = Array.isArray(sales) ? sales : getStoredSales();
  salesTable.innerHTML = "";

  renderData.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(order.date).toLocaleString()}</td>
      <td>${order.items.length}</td>
      <td>${formatCurrency(order.subtotal)}</td>
      <td>${formatCurrency(order.shipping)}</td>
      <td>${formatCurrency(order.total)}</td>
      <td class="sales__actions">
        <button class="btn btn--secondary" data-action="download-receipt" data-order-id="${order.id}">
          Download
        </button>
        <button class="btn btn--danger" data-action="delete-sale" data-order-id="${order.id}">
          Delete
        </button>
      </td>
    `;
    salesTable.appendChild(row);
  });
}

function updateSalesStats() {
  const sales = getStoredSales();
  const statsRevenue = document.querySelector(".stat__value[data-stat='revenue']");
  const statsOrders = document.querySelector(".stat__value[data-stat='orders']");
  const salesStats = calculateSalesStats(sales);

  if (statsRevenue) {
    statsRevenue.textContent = formatCurrency(salesStats.revenue);
  }

  if (statsOrders) {
    statsOrders.textContent = String(salesStats.totalOrders);
  }

  renderSales(sales);
}

function setupSalesActions() {
  const salesTable = document.getElementById("salesTableBody");
  if (!salesTable) return;

  salesTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const orderId = button.dataset.orderId;
    const sales = getStoredSales();
    const order = sales.find((o) => o.id === orderId);

    if (!order) return;

    if (action === "download-receipt") {
      const pdf = createReceiptPdf(order);
      if (!pdf) {
        alert("Unable to generate receipt. Try again later.");
        return;
      }

      pdf.save(`receipt-${order.id}.pdf`);
      return;
    }

    if (action === "delete-sale") {
      const confirmed = confirm(
        "Delete this sale record? This cannot be undone."
      );
      if (!confirmed) return;

      const updatedSales = sales.filter((o) => o.id !== orderId);
      saveSales(updatedSales);
      updateSalesStats();
      return;
    }
  });
}

function renderCart(cart) {
  const products = getStoredProducts() || [];
  const itemsContainer = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const shippingEl = document.getElementById("cartShipping");
  const totalEl = document.getElementById("cartTotal");
  const freeShippingEl = document.getElementById("cartFreeShippingNotice");

  if (!itemsContainer || !subtotalEl || !shippingEl || !totalEl || !freeShippingEl) return;

  itemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const product = findProduct(products, item.id);
    if (!product) return;

    const element = document.createElement("div");
    element.className = "cart__item";

    element.innerHTML = `
      <div class="cart__item-media">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="cart__item-body">
        <div class="cart__item-header">
          <div>
            <p class="cart__item-title">${product.name}</p>
            <p class="cart__item-meta">${product.description}</p>
            <p class="cart__item-meta">Stock: ${product.stock} items available</p>
          </div>
          <p class="cart__item-price">${formatCurrency(product.price)}</p>
        </div>

        <div class="cart__item-controls">
          <div class="cart__quantity-controls">
            <button type="button" data-cart-action="decrease" data-id="${item.id}">-</button>
            <input type="number" min="1" value="${item.qty}" data-cart-input="${item.id}" />
            <button type="button" data-cart-action="increase" data-id="${item.id}">+</button>
          </div>
          <button class="cart__item-remove" type="button" data-cart-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;

    itemsContainer.appendChild(element);
  });

  const totals = calculateCartTotals(cart, products);
  subtotalEl.textContent = formatCurrency(totals.subtotal);
  shippingEl.textContent = formatCurrency(totals.shipping);
  totalEl.textContent = formatCurrency(totals.total);

  if (totals.freeShippingDelta > 0) {
    freeShippingEl.textContent = `Add ${formatCurrency(totals.freeShippingDelta)} more for free shipping`;
    freeShippingEl.style.display = "block";
  } else {
    freeShippingEl.textContent = "You qualify for free shipping!";
    freeShippingEl.style.display = "block";
  }
}

function openCart() {
  const cartPanel = document.getElementById("cartPanel");
  if (!cartPanel) return;
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  const cartPanel = document.getElementById("cartPanel");
  if (!cartPanel) return;
  cartPanel.setAttribute("aria-hidden", "true");
}

function openOrderPlacedModal() {
  const modal = document.getElementById("orderPlacedModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
}

function closeOrderPlacedModal() {
  const modal = document.getElementById("orderPlacedModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
}

function createReceiptPdf(order) {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return null;

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const padding = 40;
    const lineHeight = 18;
    let cursorY = padding;

    doc.setFontSize(18);
    doc.text("N E G O Z I O  D E  F U M M O", padding, cursorY);
    cursorY += lineHeight * 1.5;

    doc.setFontSize(12);
    doc.text(`Order Date: ${new Date(order.date).toLocaleString()}`, padding, cursorY);
    cursorY += lineHeight;
    doc.text(`Order ID: ${order.id || "-"}`, padding, cursorY);
    cursorY += lineHeight * 1.5;

    doc.setFontSize(14);
    doc.text("Items:", padding, cursorY);
    cursorY += lineHeight;

    order.items.forEach((item) => {
      doc.setFontSize(12);
      doc.text(`${item.qty} x ${item.name} @ ${formatCurrency(item.price)}`, padding, cursorY);
      const lineTotal = formatCurrency(item.price * item.qty);
      doc.text(lineTotal, 440, cursorY, { align: "right" });
      cursorY += lineHeight;
    });

    cursorY += lineHeight;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, padding, cursorY);
    cursorY += lineHeight;
    doc.text(`Shipping: ${formatCurrency(order.shipping)}`, padding, cursorY);
    cursorY += lineHeight;
    doc.text(`Total: ${formatCurrency(order.total)}`, padding, cursorY);

    return doc;
  } catch (error) {
    // If jsPDF isn't available or fails, ignore
    return null;
  }
}

function openProductModal(product) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  modal.setAttribute("aria-hidden", "false");

  const name = document.getElementById("productModalName");
  const category = document.getElementById("productModalCategory");
  const price = document.getElementById("productModalPrice");
  const description = document.getElementById("productModalDescription");
  const stock = document.getElementById("productModalStock");
  const image = document.getElementById("productModalImage");
  const qtyInput = document.getElementById("productModalQty");

  if (name) name.textContent = product.name;
  if (category) category.textContent = product.category;
  if (price) price.textContent = formatCurrency(product.price);
  if (description) description.textContent = product.description;
  if (stock) stock.textContent = `Stock: ${product.stock} items available`;
  if (image) {
    image.src = product.image;
    image.alt = product.name;
  }

  if (qtyInput) {
    qtyInput.value = "1";
    qtyInput.max = String(product.stock);
  }

  const addToCartBtn = document.getElementById("productModalAddToCart");
  if (addToCartBtn) {
    addToCartBtn.dataset.productId = product.id;
  }

  const buyNowBtn = document.getElementById("productModalBuyNow");
  if (buyNowBtn) {
    buyNowBtn.dataset.productId = product.id;
  }

  const specsList = document.getElementById("productModalSpecsList");
  if (specsList) {
    specsList.innerHTML = "";
    const specs = product.name === "Wenax Q2" ? [
      { label: "Pod Capacity", value: "3mL/2mL (TPD)" },
      { label: "Output Power", value: "30W Max" },
      { label: "Battery Capacity", value: "1250mAh" },
      { label: "Charging", value: "5V/2A" },
      { label: "Pod Resistance", value: "0.4/0.6/0.8/1.2Ω" },
    ] : [];

    specs.forEach((spec) => {
      const li = document.createElement("li");
      li.textContent = `${spec.label}: ${spec.value}`;
      specsList.appendChild(li);
    });
  }
}


function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
}

function setupShopInteractions(products) {
  const shop = document.getElementById("shopCards");
  const cartButton = document.getElementById("cartButton");
  const cartPanel = document.getElementById("cartPanel");
  const productModal = document.getElementById("productModal");
  const qtyInput = document.getElementById("productModalQty");
  const qtyIncrease = document.getElementById("productModalQtyIncrease");
  const qtyDecrease = document.getElementById("productModalQtyDecrease");
  const addToCartBtn = document.getElementById("productModalAddToCart");
  const cartContinue = document.getElementById("cartContinue");
  const cartCheckout = document.getElementById("cartCheckout");

  if (shop) {
    shop.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;

      const action = btn.dataset.action;
      const productId = btn.dataset.id;

      if (action === "view") {
        const product = findProduct(products, productId);
        if (product) openProductModal(product);
      }

      if (action === "add") {
        addToCart(products, productId, 1);
        openCart();
      }
    });
  }

  if (cartButton) {
    cartButton.addEventListener("click", (event) => {
      event.preventDefault();
      openCart();
    });
  }

  if (cartPanel) {
    cartPanel.addEventListener("click", (event) => {
      const close = event.target.closest("[data-cart-close]");
      if (close) {
        closeCart();
      }

      const action = event.target.closest("[data-cart-action]");
      if (!action) return;

      const id = action.dataset.id;
      const cart = getCart();

      if (action.dataset.cartAction === "remove") {
        removeFromCart(id);
        return;
      }

      if (action.dataset.cartAction === "increase") {
        const item = cart.find((item) => item.id === id);
        if (item) {
          updateCartQuantity(id, item.qty + 1, products);
        }
        return;
      }

      if (action.dataset.cartAction === "decrease") {
        const item = cart.find((item) => item.id === id);
        if (item) {
          updateCartQuantity(id, item.qty - 1, products);
        }
        return;
      }
    });

    cartPanel.addEventListener("input", (event) => {
      const input = event.target.closest("[data-cart-input]");
      if (!input) return;

      const id = input.dataset.cartInput;
      const value = Number(input.value || "1");
      updateCartQuantity(id, value, products);
    });
  }

  if (cartContinue) {
    cartContinue.addEventListener("click", () => {
      closeCart();
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }

      const products = getStoredProducts();
      const totals = calculateCartTotals(cart, products);

      const order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart.map((item) => {
          const product = findProduct(products, item.id);
          return {
            id: item.id,
            name: product?.name ?? "Unknown",
            price: product?.price ?? 0,
            qty: item.qty,
          };
        }),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
      };

      addOrder(order);
      updateSalesStats();

      // Deduct sold quantities from inventory
      cart.forEach((item) => {
        const product = findProduct(products, item.id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.qty);
        }
      });
      updateAll(products);

      setCart([]);
      closeCart();
      openOrderPlacedModal();
    });
  }

  // Category filtering tabs
  const shopTabs = document.querySelectorAll(".shop__tab");
  if (shopTabs.length) {
    shopTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        shopTabs.forEach((t) => t.classList.remove("shop__tab--active"));
        tab.classList.add("shop__tab--active");

        const label = tab.textContent.trim();
        const filter = label === "All" ? null : label.toLowerCase();
        renderShop(products, filter);
      });
    });
  }

  if (productModal) {
    productModal.addEventListener("click", (event) => {
      const close = event.target.closest("[data-modal-close]");
      if (close) {
        closeProductModal();
      }
    });
  }

  const orderPlacedModal = document.getElementById("orderPlacedModal");
  if (orderPlacedModal) {
    orderPlacedModal.addEventListener("click", (event) => {
      const close = event.target.closest("[data-modal-close]");
      if (close) {
        closeOrderPlacedModal();
      }
    });
  }

  if (qtyIncrease) {
    qtyIncrease.addEventListener("click", () => {
      if (!qtyInput) return;
      const current = Number(qtyInput.value || "1");
      qtyInput.value = String(current + 1);
    });
  }

  if (qtyDecrease) {
    qtyDecrease.addEventListener("click", () => {
      if (!qtyInput) return;
      const current = Number(qtyInput.value || "1");
      qtyInput.value = String(Math.max(1, current - 1));
    });
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const productId = addToCartBtn.dataset.productId;
      const quantity = Number(document.getElementById("productModalQty")?.value || "1");
      addToCart(products, productId, quantity);
      closeProductModal();
      openCart();
    });
  }

  const buyNowBtn = document.getElementById("productModalBuyNow");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const productId = buyNowBtn.dataset.productId;
      const quantity = Number(document.getElementById("productModalQty")?.value || "1");
      addToCart(products, productId, quantity);
      openCart();
    });
  }

  const cart = getCart();
  renderCart(cart);
  updateCartBadge(cart);
}

function updateAll(products) {
  saveProducts(products);
  renderAdmin(products);
  renderShop(products, currentShopFilter);

  // Remove any cart items for products that no longer exist
  const productIds = new Set(products.map((p) => p.id));
  const filteredCart = getCart().filter((item) => productIds.has(item.id));
  setCart(filteredCart);
}
function setupAdminActions(products) {
  const table = document.querySelector("table");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    const product = products[index];

    if (!product) return;

    if (action === "sell") {
      product.stock = Math.max(0, product.stock - 1);
      updateAll(products);
    }

    if (action === "edit") {
      const newStock = prompt("Enter new stock quantity:", String(product.stock));
      const parsed = Number(newStock);
      if (!Number.isNaN(parsed)) {
        product.stock = parsed;
        updateAll(products);
      }
    }

    if (action === "delete") {
      products.splice(index, 1);
      updateAll(products);
    }
  });
}

function openAddProductModal() {
  const modal = document.getElementById("addProductModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
  const nameInput = document.getElementById("addProductName");
  nameInput?.focus();
}

function closeAddProductModal() {
  const modal = document.getElementById("addProductModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
}

function resetAddProductForm() {
  const form = document.getElementById("addProductForm");
  form?.reset();
}

function setupAddProductModal(products) {
  const openButton = document.getElementById("addProductButton");
  const modal = document.getElementById("addProductModal");
  const form = document.getElementById("addProductForm");

  if (!openButton || !modal || !form) return;

  openButton.addEventListener("click", () => {
    openAddProductModal();
  });

  modal.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-modal-close]");
    if (closeTarget) {
      closeAddProductModal();
      resetAddProductForm();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("addProductName")?.value.trim() || "";
    const description = document.getElementById("addProductDescription")?.value.trim() || "";
    const price = Number(document.getElementById("addProductPrice")?.value || "0");
    const stock = Number(document.getElementById("addProductStock")?.value || "0");
    const category = document.getElementById("addProductCategory")?.value.trim() || "";
    const imageInput = document.getElementById("addProductImage");
    const file = imageInput?.files?.[0];

    if (!name || !category || !file) {
      alert("Please fill in all required fields.");
      return;
    }

    const readFileAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    let image = "";
    try {
      image = await readFileAsDataUrl(file);
    } catch {
      image = "images/placeholder.svg";
    }

    products.push({
      id: name,
      name,
      description,
      price,
      stock,
      category,
      image,
    });

    updateAll(products);
    closeAddProductModal();
    resetAddProductForm();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const products = await loadProducts();
  renderShop(products);
  renderAdmin(products);
  setupAdminActions(products);
  setupAddProductModal(products);
  setupShopInteractions(products);
  setupSalesActions();
});
