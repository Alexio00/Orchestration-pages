const toast = document.querySelector('.toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 1500);
}

document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const content = document.getElementById(button.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(content);
      button.textContent = 'Скопировано';
      button.classList.add('copied');
      showToast('Скопировано в буфер обмена');
      window.setTimeout(() => {
        button.textContent = 'Копировать';
        button.classList.remove('copied');
      }, 1500);
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

    document.getElementById('general-version').textContent = manifest.generalVersion;
    document.getElementById('bootstrap-version').textContent = manifest.bootstrapVersion;
    document.getElementById('adapter-version').textContent = manifest.cloudAdapterVersion;
    document.getElementById('source-revision').textContent = `Источник: ${manifest.sourceRevision.slice(0, 7)}`;
    document.getElementById('release-link').href = manifest.releaseUrl;
    document.getElementById('snapshot-link').href = `content/releases/${manifest.snapshotId}/manifest.json`;

    await Promise.all([
      loadText('content/latest/chat-prompt.txt', 'chat-content'),
      loadText('content/latest/project-instructions.md', 'project-content'),
      loadText('content/latest/claude-code-setup.sh', 'cloud-content')
    ]);
  } catch (error) {
    document.querySelectorAll('.code-block code').forEach((node) => {
      node.textContent = 'Не удалось загрузить инструкцию. Обновите страницу.';
    });
    showToast(error.message);
  }
}

loadSite();
