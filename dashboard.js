const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortKey = null;
let sortDir = 1;

// getall: fetch all products and initialize UI
async function getAll() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Fetch failed");
    products = await res.json();
    filtered = products.slice();
    initControls();
    render();
  } catch (err) {
    console.error(err);
    document.getElementById("productsBody").innerHTML =
      '<tr><td colspan="4">Lỗi tải dữ liệu</td></tr>';
  }
}

function initControls() {
  const search = document.getElementById("search");
  const pageSizeSel = document.getElementById("pageSize");

  // update on input (live) and on change to satisfy "onChange" requirement
  const applySearch = () => {
    const q = search.value.trim().toLowerCase();
    filtered = products.filter((p) => p.title.toLowerCase().includes(q));
    currentPage = 1;
    render();
  };
  search.addEventListener("input", applySearch);
  search.addEventListener("change", applySearch);

  pageSizeSel.addEventListener("change", () => {
    pageSize = Number(pageSizeSel.value);
    currentPage = 1;
    render();
  });

  // sort buttons
  document.querySelectorAll(".sort").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.key;
      const dir = Number(e.currentTarget.dataset.dir);
      if (sortKey === key && sortDir === dir) {
        // toggle off
        sortKey = null;
        sortDir = 1;
      } else {
        sortKey = key;
        sortDir = dir;
      }
      render();
    });
  });
}

function applySort(arr) {
  if (!sortKey) return arr;
  return arr.slice().sort((a, b) => {
    let va = a[sortKey];
    let vb = b[sortKey];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va > vb) return sortDir;
    if (va < vb) return -sortDir;
    return 0;
  });
}

function render() {
  const body = document.getElementById("productsBody");
  const pag = document.getElementById("pagination");

  let list = applySort(filtered);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  body.innerHTML = "";
  if (pageItems.length === 0) {
    body.innerHTML = '<tr><td colspan="4">Không có dữ liệu</td></tr>';
  }

  pageItems.forEach((p) => {
    const tr = document.createElement("tr");
    tr.className = "product-row";

    const imgTd = document.createElement("td");
    imgTd.className = "thumb";
    const img = document.createElement("img");
    img.src = p.images && p.images[0] ? p.images[0] : "";
    img.alt = p.title;
    imgTd.appendChild(img);

    const titleTd = document.createElement("td");
    titleTd.innerText = p.title;

    const descTd = document.createElement("td");
    descTd.className = "desc";
    descTd.innerText = p.description;

    const priceTd = document.createElement("td");
    priceTd.innerText = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p.price);

    tr.appendChild(imgTd);
    tr.appendChild(titleTd);
    tr.appendChild(descTd);
    tr.appendChild(priceTd);

    body.appendChild(tr);
  });

  // pagination controls
  pag.innerHTML = "";
  const prev = document.createElement("button");
  prev.className = "page-btn";
  prev.innerText = "Prev";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => {
    currentPage--;
    render();
  });
  pag.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement("button");
    b.className = "page-btn" + (i === currentPage ? " active" : "");
    b.innerText = i;
    b.addEventListener("click", () => {
      currentPage = i;
      render();
    });
    pag.appendChild(b);
  }

  const next = document.createElement("button");
  next.className = "page-btn";
  next.innerText = "Next";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => {
    currentPage++;
    render();
  });
  pag.appendChild(next);
}

// run on load
window.addEventListener("DOMContentLoaded", () => {
  getAll();
});

// expose getAll in case user wants to call from console
window.getAll = getAll;
