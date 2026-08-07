/* Teacher Netza — sincroniza el tema (claro/oscuro) de los labs embebidos
   con la app anfitriona. Escucha postMessage y ?theme= en la URL. */
(function () {
  function apply(theme) {
    var dark = theme === "dark";
    document.documentElement.classList.toggle("tn-dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("theme");
  if (!initial) {
    try {
      var stored = localStorage.getItem("tn-theme");
      initial =
        stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch (e) {
      initial = "light";
    }
  }
  apply(initial);

  window.addEventListener("message", function (e) {
    var d = e && e.data;
    if (d && d.type === "tn-theme" && (d.theme === "dark" || d.theme === "light")) {
      apply(d.theme);
    }
  });
})();
