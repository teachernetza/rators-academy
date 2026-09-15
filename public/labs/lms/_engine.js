/* Teacher Netza — motor de Labs del LMS.
   Lee el JSON #lab-data, renderiza el lab completo (scroll continuo),
   califica los ejercicios y envía el resultado al LMS por postMessage. */
(function () {
  var raw = document.getElementById("lab-data");
  if (!raw) return;
  var LAB = JSON.parse(raw.textContent);

  var norm = function (s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  var state = {}; // exId -> {correct:bool, done:bool, section:string}
  var totalEx = 0;
  LAB.sections.forEach(function (s) {
    totalEx += (s.exercises || []).length;
  });

  var root = document.getElementById("lab-root");

  // Barra de progreso
  var bar = el("div", "lab-progress");
  bar.innerHTML =
    '<div class="inner"><div class="lab-bar"><i id="lab-bar-i"></i></div>' +
    '<b id="lab-bar-t">0 / ' + totalEx + "</b></div>";
  document.body.insertBefore(bar, document.body.firstChild);

  function refresh() {
    var done = 0, ok = 0;
    Object.keys(state).forEach(function (k) {
      if (state[k].done) done++;
      if (state[k].correct) ok++;
    });
    document.getElementById("lab-bar-i").style.width = (totalEx ? (done / totalEx) * 100 : 0) + "%";
    document.getElementById("lab-bar-t").textContent = done + " / " + totalEx;
    var btn = document.getElementById("lab-finish");
    if (btn) btn.disabled = done < totalEx;
    return { done: done, ok: ok };
  }

  var wrap = el("div", "lab-wrap");
  root.appendChild(wrap);

  // Hero
  var hero = el("div", "lab-hero");
  hero.innerHTML =
    '<span class="lab-badge">' + LAB.level.toUpperCase() + " · Lab del LMS</span>" +
    "<h1>" + LAB.title + "</h1>" +
    "<p>" + LAB.topic + "</p>";
  wrap.appendChild(hero);

  // Objetivos
  var obj = el("div", "lab-card");
  obj.innerHTML =
    '<span class="lab-kicker">Objetivos</span><h2>Al terminar este lab podrás:</h2>' +
    '<ul class="lab-objectives">' +
    LAB.objectives.map(function (o) { return "<li>" + o + "</li>"; }).join("") +
    "</ul>";
  wrap.appendChild(obj);

  var exIndex = 0;

  function renderExercise(card, ex, sectionTitle) {
    exIndex++;
    var id = "ex" + exIndex;
    state[id] = { done: false, correct: false, section: sectionTitle };

    var box = el("div", "lab-ex");
    box.appendChild(el("div", "lab-q", '<span class="n">' + exIndex + "</span>" + ex.q));

    var getAnswer = function () { return null; };
    var markUI = function () {};

    if (ex.type === "mc") {
      var opts = el("div", "lab-opts");
      var chosen = null;
      ex.options.forEach(function (o, i) {
        var lab = el("label", "lab-opt");
        lab.innerHTML = '<input type="radio" name="' + id + '"><span>' + o + "</span>";
        lab.querySelector("input").addEventListener("change", function () {
          chosen = i;
          Array.prototype.forEach.call(opts.children, function (c) { c.classList.remove("sel"); });
          lab.classList.add("sel");
        });
        opts.appendChild(lab);
      });
      box.appendChild(opts);
      getAnswer = function () { return chosen === ex.answer; };
      markUI = function () {
        Array.prototype.forEach.call(opts.children, function (c, i) {
          c.classList.remove("sel");
          if (i === ex.answer) c.classList.add("ok");
          else if (i === chosen) c.classList.add("bad");
          c.style.pointerEvents = "none";
        });
      };
    } else if (ex.type === "fill") {
      var input = el("input", "lab-input");
      input.setAttribute("placeholder", ex.placeholder || "Escribe tu respuesta…");
      box.appendChild(input);
      getAnswer = function () {
        var v = norm(input.value);
        return (ex.answers || [ex.answer]).some(function (a) { return norm(a) === v; });
      };
      markUI = function () { input.disabled = true; };
    } else if (ex.type === "order") {
      var picked = [];
      var line = el("div", "lab-input");
      line.textContent = "…";
      var pool = el("div", "lab-words");
      var shuffled = ex.words.slice().sort(function () { return Math.random() - 0.5; });
      shuffled.forEach(function (w) {
        var b = el("button", "lab-word", w);
        b.type = "button";
        b.addEventListener("click", function () {
          picked.push(w);
          b.classList.add("used");
          line.textContent = picked.join(" ");
        });
        pool.appendChild(b);
      });
      var reset = el("button", "lab-btn ghost", "Borrar");
      reset.type = "button";
      reset.addEventListener("click", function () {
        picked = [];
        line.textContent = "…";
        Array.prototype.forEach.call(pool.children, function (c) { c.classList.remove("used"); });
      });
      box.appendChild(pool);
      box.appendChild(line);
      var resetRow = el("div", "lab-actions");
      resetRow.appendChild(reset);
      box.appendChild(resetRow);
      getAnswer = function () { return norm(picked.join(" ")) === norm(ex.answer); };
      markUI = function () {
        pool.style.pointerEvents = "none";
        reset.style.display = "none";
      };
    } else if (ex.type === "match") {
      var grid = el("div", "lab-match");
      var rights = ex.pairs.map(function (p) { return p[1]; }).slice().sort();
      var selects = [];
      ex.pairs.forEach(function (p) {
        var row = el("div", "row");
        row.appendChild(el("div", "term", p[0]));
        var sel = document.createElement("select");
        sel.innerHTML =
          '<option value="">Elige…</option>' +
          rights.map(function (r) { return '<option value="' + r + '">' + r + "</option>"; }).join("");
        row.appendChild(sel);
        selects.push({ sel: sel, row: row, right: p[1] });
        grid.appendChild(row);
      });
      box.appendChild(grid);
      getAnswer = function () {
        return selects.every(function (s) { return s.sel.value === s.right; });
      };
      markUI = function () {
        selects.forEach(function (s) {
          s.row.classList.add(s.sel.value === s.right ? "ok" : "bad");
          s.sel.disabled = true;
        });
      };
    }

    var fb = el("div", "lab-fb");
    var actions = el("div", "lab-actions");
    var check = el("button", "lab-btn", "Revisar");
    check.type = "button";
    check.addEventListener("click", function () {
      if (state[id].done) return;
      var ok = !!getAnswer();
      state[id].done = true;
      state[id].correct = ok;
      markUI();
      check.disabled = true;
      fb.className = "lab-fb show " + (ok ? "ok" : "bad");
      fb.innerHTML =
        (ok ? "<b>¡Correcto!</b> " : "<b>Respuesta correcta</b>: <b>" + (ex.solution || ex.answers?.[0] || ex.answer || (ex.options && ex.options[ex.answer]) || "") + "</b>. ") +
        (ex.explain || "");
      refresh();
    });
    actions.appendChild(check);
    box.appendChild(actions);
    box.appendChild(fb);
    card.appendChild(box);
  }

  LAB.sections.forEach(function (s) {
    var card = el("div", "lab-card");
    card.appendChild(el("span", "lab-kicker", s.kicker || "Sección"));
    card.appendChild(el("h2", null, s.title));
    if (s.intro) card.appendChild(el("p", "lab-note", s.intro));
    if (s.content) card.appendChild(el("div", null, s.content));
    if (s.vocab) {
      var v = el("div", "lab-vocab");
      s.vocab.forEach(function (w) {
        v.appendChild(el("div", null, "<b>" + w.en + "</b><span>" + w.es + "</span>"));
      });
      card.appendChild(v);
    }
    (s.exercises || []).forEach(function (ex) { renderExercise(card, ex, s.title); });
    wrap.appendChild(card);
  });

  // Resultado
  var result = el("div", "lab-card lab-result");
  result.innerHTML =
    '<span class="lab-kicker">Resultado</span><h2 style="justify-content:center">Tu puntaje</h2>' +
    '<p class="lab-note">Responde todos los ejercicios y pulsa el botón para guardar tu puntaje.</p>' +
    '<div class="lab-actions" style="justify-content:center"><button id="lab-finish" class="lab-btn" disabled>Terminar y guardar puntaje</button></div>' +
    '<div id="lab-final"></div>';
  wrap.appendChild(result);

  document.getElementById("lab-finish").addEventListener("click", function () {
    var r = refresh();
    var bySection = {};
    Object.keys(state).forEach(function (k) {
      var s = state[k].section;
      if (!bySection[s]) bySection[s] = { title: s, score: 0, max: 0 };
      bySection[s].max++;
      if (state[k].correct) bySection[s].score++;
    });
    var sections = Object.keys(bySection).map(function (k) { return bySection[k]; });
    var pct = totalEx ? Math.round((r.ok / totalEx) * 100) : 0;

    document.getElementById("lab-finish").disabled = true;
    document.getElementById("lab-final").innerHTML =
      '<div class="lab-score">' + pct + "%</div>" +
      "<p><b>" + r.ok + " de " + totalEx + "</b> ejercicios correctos</p>" +
      '<div class="lab-breakdown">' +
      sections.map(function (s) {
        return '<div class="b"><span>' + s.title + "</span><b>" + s.score + " / " + s.max + "</b></div>";
      }).join("") +
      "</div>" +
      '<p class="lab-saved">Resultado enviado a tu profe.</p>';

    try {
      window.parent.postMessage(
        {
          type: "tn-lab-result",
          level: LAB.level,
          slug: LAB.slug,
          score: r.ok,
          max: totalEx,
          sections: sections,
        },
        "*",
      );
    } catch (e) {}
    document.getElementById("lab-final").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  refresh();
})();
