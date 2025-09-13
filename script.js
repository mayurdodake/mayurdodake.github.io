// === CONFIG ===
// Add all GitHub usernames you want to show here:
const GITHUB_USERS = ['mayurdodake', 'another-github-account'];

// How many top repos to show (combined)
const MAX_PROJECTS = 12;

// === DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING ===
const projectsGrid = document.getElementById('projects-grid');
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

function escapeHtml(s = '') {
  return s.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
}

async function fetchReposForUser(user) {
  const url = `https://api.github.com/users/${user}/repos?per_page=100&type=owner&sort=updated`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('GitHub API returned', resp.status, resp.statusText);
      return [];
    }
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Fetch error', err);
    return [];
  }
}

async function loadProjects() {
  projectsGrid.innerHTML = `<div class="loader">Loading projects…</div>`;
  const allReposArr = await Promise.all(GITHUB_USERS.map(fetchReposForUser));
  // flatten, exclude forks
  const repos = allReposArr.flat().filter(r => !r.fork && r.stargazers_count !== undefined);
  if (!repos.length) {
    projectsGrid.innerHTML = `<div class="loader">No projects found — check usernames in script.js</div>`;
    return;
  }
  // sort by stars, then recently updated
  repos.sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)));
  const selected = repos.slice(0, MAX_PROJECTS);
  projectsGrid.innerHTML = selected.map(renderCard).join('');
}

function renderCard(r) {
  const name = escapeHtml(r.name);
  const description = escapeHtml(r.description || '');
  const stars = r.stargazers_count || 0;
  const lang = r.language ? `<span class="lang">${escapeHtml(r.language)}</span>` : '';
  const repoUrl = r.html_url;
  return `
    <article class="project-card">
      <h3><a href="${repoUrl}" target="_blank" rel="noopener noreferrer">${name}</a></h3>
      <p>${description}</p>
      <div class="meta">
        ${lang}
        <span class="stars">★ ${stars}</span>
      </div>
    </article>
  `;
}

// Start
document.addEventListener('DOMContentLoaded', loadProjects);
