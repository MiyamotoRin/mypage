function getBasePath() {
  return document.body.dataset.basePath || "";
}

function renderSharedHeader() {
  const mountPoint = document.getElementById("site-header");
  if (!mountPoint) {
    return;
  }

  const basePath = getBasePath();
  mountPoint.innerHTML = `
    <header>
      <div class="container">
        <div class="head-nav">
          <ul>
            <li><a href="${basePath}index.html" class="nav-link">Top</a></li>
            <li><a href="${basePath}profile.html" class="nav-link">Profile</a></li>
            <li><a href="${basePath}works.html" class="nav-link">Works</a></li>
          </ul>
        </div>
      </div>
      <div class="clear"></div>
    </header>
  `;
}

function renderSharedFooter() {
  const mountPoint = document.getElementById("site-footer");
  if (!mountPoint) {
    return;
  }

  mountPoint.innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-links">
          <a href="https://github.com/MiyamotoRin/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.19-.02-2.16-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.34.96.1-.75.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.95 10.95 0 0 1 5.79 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.42-2.68 5.39-5.24 5.67.41.36.78 1.08.78 2.19 0 1.58-.01 2.85-.01 3.23 0 .31.21.68.8.56a11.52 11.52 0 0 0 7.84-10.94C23.5 5.66 18.35.5 12 .5Z"></path>
            </svg>
          </a>
          <a href="https://x.com/muhe_____" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.26l-4.9-7.42L5.55 22H2.44l7.24-8.28L1.8 2h6.42l4.43 6.76L18.9 2Zm-1.1 18h1.73L7.28 3.9H5.42L17.8 20Z"></path>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/muheiroiro/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.05-1.85-3.05-1.86 0-2.15 1.45-2.15 2.95v5.68H9.33V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.31 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.09 20.45H3.53V9h3.56v11.45Z"></path>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  `;
}

renderSharedHeader();
renderSharedFooter();
