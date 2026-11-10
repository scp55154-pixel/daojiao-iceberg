/* ==========================================================================
   道教兔子洞冰山图 · 应用逻辑
   纯原生 JS，无构建、无依赖、可 file:// 离线打开。
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.ICEBERG || [];
  var TIERS = window.TIERS || [];
  var CATS = window.CATEGORIES || [];
  var LS_READ = "daojiao-iceberg:read:v1";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 索引 ---------- */
  var byTier = {};
  TIERS.forEach(function (t) { byTier[t.n] = []; });
  DATA.forEach(function (e, i) {
    e._i = i;
    e._key = e.n + ":" + e.name;
    (byTier[e.n] = byTier[e.n] || []).push(e);
  });
  var CATNAME = {};
  CATS.forEach(function (c) { CATNAME[c.id] = c.name; });
  var TIERCOLOR = {};
  TIERS.forEach(function (t) { TIERCOLOR[t.n] = t.color; });

  /* ---------- 状态 ---------- */
  var state = {
    q: "",
    cat: "all",
    read: loadRead()
  };

  function loadRead() {
    try {
      var raw = localStorage.getItem(LS_READ);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.reduce(function (m, k) { m[k] = 1; return m; }, {}) : {};
    } catch (e) { return {}; }
  }
  function saveRead() {
    try { localStorage.setItem(LS_READ, JSON.stringify(Object.keys(state.read))); } catch (e) {}
  }
  function markRead(key, on) {
    if (on) state.read[key] = 1; else delete state.read[key];
    saveRead();
    updateReadCount();
  }
  function updateReadCount() {
    var n = Object.keys(state.read).length;
    var el = $("#statRead");
    if (el) el.textContent = n;
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hl(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  }
  function isRead(e) { return !!state.read[e._key]; }

  /* ---------- 分类筛选 ---------- */
  function buildFilters() {
    var counts = {};
    DATA.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });
    var html = '<button class="chip" data-cat="all" aria-pressed="true">全部<span class="chip__n">' + DATA.length + "</span></button>";
    CATS.forEach(function (c) {
      if (!counts[c.id]) return;
      html += '<button class="chip" data-cat="' + c.id + '" aria-pressed="false">' + c.name +
        '<span class="chip__n">' + counts[c.id] + "</span></button>";
    });
    $("#filters").innerHTML = html;
    $("#filters").addEventListener("click", function (ev) {
      var b = ev.target.closest(".chip");
      if (!b) return;
      state.cat = b.dataset.cat;
      $$(".chip", $("#filters")).forEach(function (c) {
        c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat));
      });
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 剖面图 ---------- */
  function buildProfile() {
    var svg = $("#profileSvg");
    var NS = "http://www.w3.org/2000/svg";
    var W = 320, H = 260;
    // 水面
    var bands = [];
    var total = TIERS.length;
    var topY = 54, bottomY = 252;
    var step = (bottomY - topY) / total;
    TIERS.forEach(function (t, i) {
      bands.push({ t: t, y: bottomY - step * (i + 1), h: step });
    });

    // 冰山轮廓：上窄下宽再收
    function halfWidth(y) {
      var p = (y - 20) / (252 - 20); // 0..1
      // 顶部尖，中段最宽，底部略收
      var w = 26 + 78 * Math.sin(Math.min(Math.max(p, 0), 1) * Math.PI * 0.92);
      return w;
    }
    var pts = [];
    for (var y = 20; y <= 252; y += 4) {
      pts.push([W / 2 - halfWidth(y), y]);
    }
    for (var y2 = 252; y2 >= 20; y2 -= 4) {
      pts.push([W / 2 + halfWidth(y2), y2]);
    }
    var polygon = document.createElementNS(NS, "polygon");
    polygon.setAttribute("points", pts.map(function (p) { return p[0].toFixed(1) + "," + p[1]; }).join(" "));
    polygon.setAttribute("fill", "url(#iceGrad)");
    polygon.setAttribute("stroke", "rgba(150,200,240,0.35)");
    polygon.setAttribute("stroke-width", "1");

    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      '<linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#bfe9ff" stop-opacity="0.28"/>' +
      '<stop offset="14%" stop-color="#7fd6ff" stop-opacity="0.16"/>' +
      '<stop offset="55%" stop-color="#6f7dff" stop-opacity="0.13"/>' +
      '<stop offset="100%" stop-color="#1d1a3a" stop-opacity="0.55"/>' +
      "</linearGradient>";
    svg.appendChild(defs);

    // 分层色带
    bands.forEach(function (b) {
      var rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", 0);
      rect.setAttribute("y", b.y.toFixed(1));
      rect.setAttribute("width", W);
      rect.setAttribute("height", b.h.toFixed(1));
      rect.setAttribute("fill", b.t.color);
      rect.setAttribute("opacity", "0.07");
      svg.appendChild(rect);
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", 0); line.setAttribute("x2", W);
      line.setAttribute("y1", b.y.toFixed(1)); line.setAttribute("y2", b.y.toFixed(1));
      line.setAttribute("stroke", b.t.color);
      line.setAttribute("stroke-opacity", "0.28");
      line.setAttribute("stroke-dasharray", "2 4");
      svg.appendChild(line);
    });

    svg.appendChild(polygon);

    // 水面线
    var water = document.createElementNS(NS, "line");
    water.setAttribute("x1", 4); water.setAttribute("x2", W - 4);
    water.setAttribute("y1", 54); water.setAttribute("y2", 54);
    water.setAttribute("stroke", "#8fd8ff");
    water.setAttribute("stroke-width", "1.2");
    water.setAttribute("stroke-dasharray", "7 5");
    water.setAttribute("opacity", "0.7");
    svg.appendChild(water);

    var wt = document.createElementNS(NS, "text");
    wt.setAttribute("x", 6); wt.setAttribute("y", 49);
    wt.setAttribute("fill", "#8fd8ff");
    wt.setAttribute("font-size", "7");
    wt.setAttribute("letter-spacing", "1.5");
    wt.setAttribute("opacity", "0.7");
    wt.textContent = "SEA LEVEL";
    svg.appendChild(wt);

    // 图例
    var legend = $("#profileLegend");
    legend.innerHTML = TIERS.map(function (t) {
      var c = (byTier[t.n] || []).length;
      return '<li><button data-jump="' + t.id + '"><i style="background:' + t.color + '"></i>' +
        "<span>T" + t.n + " " + t.name + "</span><em>" + c + "</em></button></li>";
    }).join("");
    legend.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-jump]");
      if (!b) return;
      var el = document.getElementById(b.dataset.jump);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- 渲染列表 ---------- */
  function match(e, q) {
    if (!q) return true;
    var ql = q.toLowerCase();
    var hay = [e.name, e.aka || "", e.brief, e.detail, CATNAME[e.cat] || ""].join(" ").toLowerCase();
    if (hay.indexOf(ql) >= 0) return true;
    return (e.ev || []).some(function (x) { return (x.t || "").toLowerCase().indexOf(ql) >= 0; });
  }

  function render() {
    var q = state.q.trim();
    var wrap = $("#tiers");
    var total = 0;
    var html = "";

    TIERS.forEach(function (t) {
      var list = (byTier[t.n] || []).filter(function (e) {
        if (state.cat !== "all" && e.cat !== state.cat) return false;
        return match(e, q);
      });
      if (!list.length) return;
      total += list.length;
      html += '<section class="tier" id="' + t.id + '" data-tier="' + t.n + '" style="--f-tier:' + t.color + '">' +
        '<div class="tier__head">' +
        '<div class="tier__no">Tier ' + t.n + " · " + esc(t.en) + "</div>" +
        '<h2 class="tier__title">' + esc(t.name) + "<span>" + esc(t.tagline) + "</span></h2>" +
        '<p class="tier__desc">' + esc(t.desc) + "</p>" +
        "</div>" +
        '<div class="tier__bar"><i></i></div>' +
        '<div class="tier__rule"></div>' +
        '<div class="cards">' +
        list.map(function (e) { return cardHTML(e, q); }).join("") +
        "</div></section>";
    });

    if (!total) {
      html = '<div class="empty">没有匹配的词条。<br>试试「尸解」「庚申」「鬼律」「劫」。</div>';
    }
    wrap.innerHTML = html;

    updateReadCount();
    observeCards();
  }

  function cardHTML(e, q) {
    var tags = "";
    var kinds = {};
    (e.ev || []).forEach(function (x) { kinds[x.k] = 1; });
    if (kinds.text) tags += '<span class="tag tag--text">原文</span>';
    if (kinds.dict) tags += '<span class="tag tag--dict">辞典</span>';
    if (kinds.ref) tags += '<span class="tag tag--ref">参考</span>';
    if (e.folk) tags += '<span class="tag tag--folk">民间说法</span>';

    return '<button class="card' + (isRead(e) ? " is-read" : "") + '" data-i="' + e._i + '">' +
      '<div class="card__top"><span class="card__name">' + hl(e.name, q) + "</span>" +
      '<span class="card__cat">' + (CATNAME[e.cat] || "") + "</span></div>" +
      '<p class="card__brief">' + hl(e.brief, q) + "</p>" +
      '<div class="card__tags">' + tags + "</div>" +
      "</button>";
  }

  var io = null;
  function observeCards() {
    if (!("IntersectionObserver" in window)) {
      $$(".card").forEach(function (c) { c.classList.add("in"); });
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("reveal", "in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".card").forEach(function (c, i) {
      if (i > 24) c.classList.add("reveal");
      else c.classList.add("reveal", "in");
      if (i > 24) io.observe(c);
    });
  }

  /* ---------- 详情面板 ---------- */
  var current = null;
  var lastFocus = null;

  function openEntry(i, fromHash) {
    var e = DATA[i];
    if (!e) return;
    current = i;
    lastFocus = document.activeElement;
    if (!fromHash) {
      try { history.replaceState(null, "", "#e-" + i); } catch (err) {}
    }

    var tier = TIERS.filter(function (t) { return t.n === e.n; })[0] || { n: e.n, color: "#888" };
    var panel = $(".sheet__panel");
    panel.style.setProperty("--f-tier", tier.color);

    $("#sheetTier").textContent = "T" + e.n;
    $("#sheetCat").textContent = CATNAME[e.cat] || "";
    $("#sheetTitle").textContent = e.name;
    $("#sheetAka").textContent = e.aka ? "又名：" + e.aka : "";
    $("#sheetBrief").textContent = e.brief;
    $("#sheetDetail").innerHTML = (e.detail || "").split("\n").map(function (p) {
      return "<p>" + esc(p) + "</p>";
    }).join("");

    var evHtml = (e.ev || []).map(function (x) {
      return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' +
        '<span>' + esc(x.t) + "<small>" + esc(x.u) + "</small></span>" +
        "<i>" + (x.k === "text" ? "原文" : x.k === "dict" ? "辞典" : "参考") + "</i></a></li>";
    }).join("");
    $("#sheetEv").innerHTML = evHtml;

    var relList = (e.rel && e.rel.length) ? e.rel : relatedNames(e);
    if (relList.length) {
      $("#sheetRelWrap").hidden = false;
      $("#sheetRel").innerHTML = relList.map(function (nm) {
        var found = DATA.filter(function (x) { return x.name === nm || (x.aka || "").indexOf(nm) >= 0; })[0];
        return '<button data-rel="' + (found ? found._i : "") + '">' + esc(nm) + "</button>";
      }).join("");
    } else {
      $("#sheetRelWrap").hidden = true;
    }

    syncReadBtn();

    $("#sheet").hidden = false;
    document.body.style.overflow = "hidden";
    $("#sheetScroll").scrollTop = 0;
    setTimeout(function () { $(".sheet__close").focus(); }, 30);
  }

  function relatedNames(e) {
    // 同层同类的其它条目（最多 4 条），作为「同一片水域」
    return (byTier[e.n] || []).filter(function (x) {
      return x._i !== e._i && x.cat === e.cat;
    }).slice(0, 4).map(function (x) { return x.name; });
  }

  function syncReadBtn() {
    var e = DATA[current];
    if (!e) return;
    var on = isRead(e);
    var btn = $("#readBtn");
    btn.textContent = on ? "已读 ✓（点此取消）" : "标记已读";
    var rm = $("#sheetRead");
    rm.textContent = on ? "已读" : "未读";
    rm.className = "readmark" + (on ? " on" : "");
  }

  function closeSheet() {
    $("#sheet").hidden = true;
    document.body.style.overflow = "";
    try {
      if (/^#e-\d+$/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    } catch (err) {}
    if (current != null) {
      var e = DATA[current];
      var card = $('.card[data-i="' + current + '"]');
      if (card && e) card.classList.toggle("is-read", isRead(e));
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    if (current == null) return;
    var next = current + d;
    if (next < 0) next = DATA.length - 1;
    if (next >= DATA.length) next = 0;
    openEntry(next);
  }

  /* ---------- 搜索 ---------- */
  function initSearch() {
    var input = $("#search");
    var wrap = $("#searchwrap");
    var toggle = $("#searchToggle");
    var timer = null;

    toggle.addEventListener("click", function () {
      var open = wrap.hidden;
      wrap.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      syncTopbarHeight();
      if (open) setTimeout(function () { input.focus(); }, 50);
      else { input.value = ""; state.q = ""; render(); }
    });

    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = input.value;
        render();
      }, 130);
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); input.blur(); }
      if (ev.key === "Escape") { input.value = ""; state.q = ""; render(); wrap.hidden = true; }
    });

    $("#searchClear").addEventListener("click", function () {
      input.value = ""; state.q = ""; render(); input.focus();
    });
  }

  /* ---------- 事件绑定 ---------- */
  function bind() {
    $("#tiers").addEventListener("click", function (ev) {
      var card = ev.target.closest(".card");
      if (!card) return;
      openEntry(Number(card.dataset.i));
    });

    $$("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeSheet);
    });

    $("#sheet").addEventListener("click", function (ev) {
      var rel = ev.target.closest("button[data-rel]");
      if (rel && rel.dataset.rel !== "") {
        openEntry(Number(rel.dataset.rel));
      }
    });

    $("#readBtn").addEventListener("click", function () {
      var e = DATA[current];
      if (!e) return;
      markRead(e._key, !isRead(e));
      syncReadBtn();
      var card = $('.card[data-i="' + current + '"]');
      if (card) card.classList.toggle("is-read", isRead(e));
    });

    $("#prevBtn").addEventListener("click", function () { step(-1); });
    $("#nextBtn").addEventListener("click", function () { step(1); });

    document.addEventListener("keydown", function (ev) {
      if ($("#sheet").hidden) return;
      if (ev.key === "Escape") closeSheet();
      if (ev.key === "ArrowRight") step(1);
      if (ev.key === "ArrowLeft") step(-1);
    });

    $("#diveBtn").addEventListener("click", function () {
      var deep = DATA.filter(function (e) { return e.n >= 6; });
      var pick = deep[Math.floor(Math.random() * deep.length)];
      if (pick) openEntry(pick._i);
    });

    $("#resetBtn").addEventListener("click", function () {
      state.read = {};
      saveRead();
      render();
      updateReadCount();
    });

    // 滚动进度条
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateTierBars();
        updateDepthHud();
        ticking = false;
      });
    }, { passive: true });
  }

  function syncTopbarHeight() {
    var tb = $("#topbar");
    if (tb) document.documentElement.style.setProperty("--topbar-h", tb.offsetHeight + "px");
  }

  function updateDepthHud() {
    var hud = $("#depthHud");
    if (!hud) return;
    var secs = $$(".tier");
    if (!secs.length) { hud.classList.remove("on"); return; }
    var mark = window.innerHeight * 0.42;
    var active = secs[0];
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top <= mark) active = secs[i];
      else break;
    }
    var tn = Number(active.getAttribute("data-tier"));
    var tier = TIERS.filter(function (t) { return t.n === tn; })[0];
    if (!tier) return;
    $("#hudDot").style.background = tier.color;
    $("#hudMeter").textContent = tier.depth === 0 ? "0 m" : "−" + tier.depth.toLocaleString("en-US") + " m";
    $("#hudName").textContent = "T" + tier.n + " " + tier.name;
    var show = window.scrollY > 420;
    hud.classList.toggle("on", show);
  }

  function updateTierBars() {
    $$(".tier").forEach(function (sec) {
      var bar = $(".tier__bar i", sec);
      if (!bar) return;
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.35 - r.top) / Math.max(r.height, 1);
      bar.style.width = Math.max(0, Math.min(1, p)) * 100 + "%";
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    if (!DATA.length) {
      $("#tiers").innerHTML = '<div class="empty">数据未能加载。</div>';
      return;
    }
    $("#statEntries").textContent = DATA.length;
    $("#footCount").textContent = DATA.length;
    buildFilters();
    buildProfile();
    initSearch();
    bind();
    render();
    syncTopbarHeight();
    updateTierBars();
    updateDepthHud();
    window.addEventListener("resize", syncTopbarHeight);
    window.addEventListener("orientationchange", function () {
      setTimeout(syncTopbarHeight, 250);
    });
    function openFromHash() {
      var m = /^#e-(\d+)$/.exec(location.hash);
      if (!m) return;
      var idx = Number(m[1]);
      if (DATA[idx]) openEntry(idx, true);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
