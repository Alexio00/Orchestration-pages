const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const toast = document.querySelector('.toast');

function activateTab(tab) {
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  panels.forEach((panel) => {
    const active = panel.dataset.panel === tab.dataset.panel;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const delta = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    activateTab(next);
    next.focus();
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 1800);
}

document.querySelectorAll('.copy').forEach((button) => {
  button.addEventListener('click', async () => {
    const content = document.getElementById(button.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(content);
      button.textContent = 'Скопировано';
      showToast('Скопировано в буфер обмена');
      window.setTimeout(() => { button.textContent = 'Копировать'; }, 1800);
    } catch {
      showToast('Не удалось скопировать автоматически');
    }
  });
});

async function loadText(path, targetId) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
  document.getElementById(targetId).textContent = await response.text();
}

async function loadSite() {
  try {
    const manifestResponse = await fetch('content/latest/manifest.json', { cache: 'no-cache' });
    if (!manifestResponse.ok) throw new Error('Не удалось загрузить manifest');
    const manifest = await manifestResponse.json();
    document.getElementById('header-version').textContent = manifest.generalVersion;
    document.getElementById('general-version').textContent = manifest.generalVersion;
    document.getElementById('bootstrap-version').textContent = manifest.bootstrapVersion;
    document.getElementById('adapter-version').textContent = manifest.cloudAdapterVersion;
    document.getElementById('source-revision').textContent = `Источник: ${manifest.sourceRevision.slice(0, 7)}`;
    document.getElementById('release-link').href = manifest.releaseUrl;
    await Promise.all([
      loadText('content/latest/chat-prompt.txt', 'chat-content'),
      loadText('content/latest/project-instructions.md', 'project-content'),
      loadText('content/latest/claude-code-setup.sh', 'cloud-content')
    ]);
  } catch (error) {
    document.querySelectorAll('.code-card code').forEach((node) => {
      node.textContent = 'Не удалось загрузить инструкцию. Обновите страницу.';
    });
    showToast(error.message);
  }
}

loadSite();
