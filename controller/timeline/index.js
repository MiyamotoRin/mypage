const UNKNOWN_COLOR = "rgba(255,255,255,0.25)";

let authors = [];
let propName = "名前",
  propBirth = "生年",
  propDeath = "没年"

function extractText(prop) {
  if (!prop) return "";
  if (prop.type === "title")
    return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text")
    return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select")
    return prop.multi_select.map((s) => s.name).join(", ");
  return "";
}

function extractNumber(prop) {
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}

function parsePages(pages, pName, pBirth, pDeath) {
  return pages
    .map((page) => {
      const props = page.properties;
      const name = extractText(props[pName]) || "(不明)";
      const birth = extractNumber(props[pBirth]);
      const death = extractNumber(props[pDeath]);
      return { name, birth, death, url: page.url, id: page.id };
    })
    .filter((a) => a.birth !== null || a.death !== null);
}

async function fetchAllPages() {
  let results = [],
    cursor = undefined;
  while (true) {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch("/api/notion/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    results = results.concat(data.results);
    if (!data.has_more) break;
    cursor = data.next_cursor;
  }
  return results;
}

function showStatus(html) {
  const s = document.getElementById("status");
  s.innerHTML = html;
  s.classList.add("visible");
}

function hideStatus() {
  const s = document.getElementById("status");
  s.innerHTML = "";
  s.classList.remove("visible");
}

function setupControls() {
  document.getElementById("search-input").addEventListener("input", render);
  document.getElementById("year-from").addEventListener("input", render);
  document.getElementById("year-to").addEventListener("input", render);
  document.getElementById("sort-select").addEventListener("change", render);
}

function getFiltered() {
  const q = document.getElementById("search-input").value.toLowerCase();
  const yFrom = parseInt(document.getElementById("year-from").value) || null;
  const yTo = parseInt(document.getElementById("year-to").value) || null;
  const sort = document.getElementById("sort-select").value;

  let list = authors.filter((a) => {
    if (q && !a.name.toLowerCase().includes(q)) return false;
    if (yFrom && a.death !== null && a.death < yFrom) return false;
    if (yTo && a.birth !== null && a.birth > yTo) return false;
    return true;
  });

  list.sort((a, b) => {
    if (sort === "birth") return (a.birth ?? 9999) - (b.birth ?? 9999);
    if (sort === "death") return (a.death ?? 9999) - (b.death ?? 9999);
    if (sort === "name") return a.name.localeCompare(b.name, "ja");
    if (sort === "span") {
      const sa = (a.death ?? a.birth ?? 0) - (a.birth ?? a.death ?? 0);
      const sb = (b.death ?? b.birth ?? 0) - (b.birth ?? b.death ?? 0);
      return sb - sa;
    }
    return 0;
  });

  return list;
}

function render() {
  const list = getFiltered();
  document.getElementById("author-count").textContent =
    `${list.length} / ${authors.length} 著者`;

  const wrapper = document.getElementById("timeline-wrapper");
  wrapper.innerHTML = "";

  if (list.length === 0) {
    wrapper.innerHTML =
      '<p style="color:var(--text-dim);font-size:0.8rem;padding:2rem 0">該当する著者が見つかりません</p>';
    return;
  }

  const allYears = list.flatMap((a) =>
    [a.birth, a.death].filter((y) => y !== null),
  );
  let minY = Math.min(...allYears);
  let maxY = Math.max(...allYears);
  minY = Math.floor(minY / 100) * 100 - 50;
  maxY = Math.ceil(maxY / 100) * 100 + 50;

  const yFrom = parseInt(document.getElementById("year-from").value);
  const yTo = parseInt(document.getElementById("year-to").value);
  if (!isNaN(yFrom)) minY = yFrom;
  if (!isNaN(yTo)) maxY = yTo;

  function pct(y) {
    return ((y - minY) / (maxY - minY)) * 100;
  }

  // Century labels
  const labelsDiv = document.createElement("div");
  labelsDiv.className = "century-labels";
  const cStart = Math.ceil(minY / 100) * 100;
  const centuries = [];
  for (let c = cStart; c <= maxY; c += 100) centuries.push(c);
  centuries.forEach((c) => {
    const el = document.createElement("div");
    el.className = "century-label";
    el.style.left = pct(c) + "%";
    el.textContent = c > 0 ? `${c}年` : `${Math.abs(c)}年前`;
    labelsDiv.appendChild(el);
  });
  wrapper.appendChild(labelsDiv);

  // Axis
  const axis = document.createElement("div");
  axis.className = "time-axis";
  centuries.forEach((c) => {
    const tick = document.createElement("div");
    tick.className = "axis-tick major";
    tick.style.left = pct(c) + "%";
    axis.appendChild(tick);
  });
  for (let y = Math.ceil(minY / 50) * 50; y <= maxY; y += 50) {
    if (y % 100 !== 0) {
      const tick = document.createElement("div");
      tick.className = "axis-tick";
      tick.style.left = pct(y) + "%";
      axis.appendChild(tick);
    }
  }
  wrapper.appendChild(axis);

  // Author rows
  const rowsContainer = document.createElement("div");
  rowsContainer.className = "author-rows";

  list.forEach((author) => {
    const row = document.createElement("div");
    row.className = "author-row";

    const nameEl = document.createElement("div");
    nameEl.className = "author-name";
    nameEl.textContent = author.name;
    row.appendChild(nameEl);

    const barContainer = document.createElement("div");
    barContainer.className = "author-bar-container";

    const color = UNKNOWN_COLOR;

    if (author.birth !== null && author.death !== null) {
      const bar = document.createElement("div");
      bar.className = "author-bar";
      bar.style.left = pct(author.birth) + "%";
      bar.style.width =
        Math.max(pct(author.death) - pct(author.birth), 0.3) + "%";
      bar.style.background = `linear-gradient(90deg, ${color}88, ${color})`;
      bar.style.border = `1px solid ${color}`;
      barContainer.appendChild(bar);
    } else if (author.birth !== null) {
      const dot = document.createElement("div");
      dot.className = "era-dot";
      dot.style.left = pct(author.birth) + "%";
      dot.style.background = color;
      barContainer.appendChild(dot);
    } else if (author.death !== null) {
      const dot = document.createElement("div");
      dot.className = "era-dot";
      dot.style.left = pct(author.death) + "%";
      dot.style.background = color;
      dot.style.opacity = "0.6";
      barContainer.appendChild(dot);
    }

    row.appendChild(barContainer);

    row.addEventListener("mouseenter", (e) => showTooltip(e, author));
    row.addEventListener("mousemove", (e) => moveTooltip(e));
    row.addEventListener("mouseleave", hideTooltip);
    row.addEventListener("click", () => {
      if (author.url) window.open(author.url, "_blank");
    });
    row.addEventListener(
      "touchstart",
      (e) => {
        showTooltip(e.touches[0], author);
        setTimeout(hideTooltip, 3000);
      },
      { passive: true },
    );

    rowsContainer.appendChild(row);
  });

  wrapper.appendChild(rowsContainer);
}

function showTooltip(e, author) {
  const tt = document.getElementById("tooltip");
  document.getElementById("tt-name").textContent = author.name;
  const yStr = [
    author.birth !== null ? `${author.birth}年生` : null,
    author.death !== null ? `${author.death}年没` : null,
  ]
    .filter(Boolean)
    .join(" — ");
  document.getElementById("tt-years").textContent = yStr || "年代不明";
  let meta = `<span style="color:var(--accent)">クリックでNotionを開く</span>`;
  document.getElementById("tt-meta").innerHTML = meta;
  tt.classList.add("visible");
  moveTooltip(e);
}

function moveTooltip(e) {
  const tt = document.getElementById("tooltip");
  const tw = tt.offsetWidth,
    th = tt.offsetHeight;
  const vw = window.innerWidth,
    vh = window.innerHeight;
  tt.style.left =
    (e.clientX + tw + 16 > vw ? e.clientX - tw - 8 : e.clientX + 16) + "px";
  tt.style.top =
    (e.clientY + th + 16 > vh ? e.clientY - th - 8 : e.clientY + 16) + "px";
}

function hideTooltip() {
  document.getElementById("tooltip").classList.remove("visible");
}

async function init() {
  showStatus('<span class="spinner"></span> Notionからデータを取得中...');
  try {
    const cfg = await fetch("/api/config").then((r) => r.json());
    propName = cfg.propName;
    propBirth = cfg.propBirth;
    propDeath = cfg.propDeath;

    const pages = await fetchAllPages();
    authors = parsePages(pages, propName, propBirth, propDeath);

    if (authors.length === 0) {
      showStatus(
        '<span class="error-msg">データが見つかりませんでした。.env のプロパティ名を確認してください。</span>',
      );
      return;
    }

    hideStatus();
    document.getElementById("controls").classList.add("visible");
    document.getElementById("timeline-container").classList.add("visible");

    setupControls();
    render();
  } catch (e) {
    showStatus(`<span class="error-msg">エラー: ${e.message}</span>`);
  }
}

document.addEventListener("DOMContentLoaded", init);
