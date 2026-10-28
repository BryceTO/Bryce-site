(function () {
  "use strict";

  var REPOS_URL = "https://api.github.com/users/BryceTO/repos?sort=updated&per_page=12";

  // Repositories to leave out of #repos. Add more names here (matched case-insensitively).
  var HIDDEN_REPOS = [
    "project_shoku",
    "ICT2216-SSD-2401073-PracTest"
  ];

  document.getElementById("year").textContent = new Date().getFullYear();

  var themeToggle = document.getElementById("theme-toggle");

  function syncThemeToggle() {
    var dark = document.body.classList.contains("dark");
    themeToggle.textContent = dark ? "Light mode" : "Dark mode";
  }

  themeToggle.addEventListener("click", function () {
    var dark = document.body.classList.toggle("dark");
    try { sessionStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    syncThemeToggle();
  });

  syncThemeToggle();

  var backToTop = document.getElementById("back-to-top");
  var hero = document.getElementById("hero");

  // Show the button only once the hero has scrolled fully above the viewport.
  new IntersectionObserver(function (entries) {
    var entry = entries[0];
    backToTop.hidden = entry.isIntersecting || entry.boundingClientRect.bottom > 0;
  }).observe(hero);

  backToTop.addEventListener("click", function () {
    // Scroll behaviour (smooth, or instant with reduced motion) comes from the CSS on <html>.
    window.scrollTo({ top: 0 });
    document.querySelector(".nav-brand").focus({ preventScroll: true });
  });

  var list = document.getElementById("repo-list");

  function showMessage(text) {
    list.replaceChildren();
    var p = document.createElement("p");
    p.className = "status-message";
    p.textContent = text;
    list.appendChild(p);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function repoCard(repo) {
    var card = el("article", "card repo-card");

    var title = el("h3");
    var titleLink = el("a", null, repo.name);
    titleLink.href = repo.html_url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener";
    title.appendChild(titleLink);
    card.appendChild(title);

    card.appendChild(el("p", null, repo.description || "No description provided."));

    var meta = el("div", "repo-meta");
    if (repo.language) meta.appendChild(el("span", "repo-lang", repo.language));
    var stars = repo.stargazers_count;
    meta.appendChild(el("span", null, "★ " + stars + (stars === 1 ? " star" : " stars")));
    card.appendChild(meta);

    return card;
  }

  fetch(REPOS_URL, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API responded " + res.status);
      return res.json();
    })
    .then(function (repos) {
      var hidden = HIDDEN_REPOS.map(function (name) { return name.toLowerCase(); });
      repos = repos.filter(function (r) { return hidden.indexOf(r.name.toLowerCase()) === -1; });
      var visible = repos.filter(function (r) { return !r.fork; });
      if (!visible.length) visible = repos;
      if (!visible.length) {
        showMessage("No public repositories to show yet.");
        return;
      }
      list.replaceChildren.apply(list, visible.map(repoCard));
    })
    .catch(function () {
      showMessage("Couldn't load repositories right now. See them on GitHub: github.com/BryceTO");
    });
})();
