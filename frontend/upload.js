document.addEventListener('DOMContentLoaded', async () => {
  const api = window.LoopAPI;
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('media-file');
  const fileLabel = document.getElementById('file-label');
  const preview = document.getElementById('media-preview');
  const urlInput = document.getElementById('media-url');
  const caption = document.getElementById('caption');
  const captionCount = document.getElementById('caption-count');
  const message = document.getElementById('upload-message');
  const publishButton = document.getElementById('publish-button');
  const hint = document.getElementById('upload-hint');
  let previewUrl = null;

  if (!api.token) {
    window.location.replace('login.html');
    return;
  }

  try {
    await api.getCurrentUser();
  } catch (error) {
    api.showToast(error.message, 'error');
    window.location.replace('login.html');
    return;
  }

  caption.addEventListener('input', () => {
    captionCount.textContent = String(caption.value.length);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    message.textContent = '';
    preview.replaceChildren();
    preview.hidden = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;

    if (!file) {
      fileLabel.textContent = 'Drop your media here, or browse';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      fileInput.value = '';
      fileLabel.textContent = 'Drop your media here, or browse';
      message.textContent = 'That file is over the 50 MB limit.';
      message.className = 'form-message is-error';
      return;
    }
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      fileInput.value = '';
      message.textContent = 'Choose a video or image file.';
      message.className = 'form-message is-error';
      return;
    }
    fileLabel.textContent = file.name;
    urlInput.value = '';
    previewUrl = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'img');
    media.src = previewUrl;
    if (media instanceof HTMLVideoElement) {
      media.muted = true;
      media.controls = true;
      media.playsInline = true;
    } else {
      media.alt = 'Selected media preview';
    }
    preview.append(media);
    preview.hidden = false;
    hint.textContent = 'Your media is ready. Add a caption and share when you’re happy with it.';
  });

  const dropzone = document.getElementById('dropzone');
  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });
  dropzone.addEventListener('dragleave', (event) => {
    if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('is-dragging');
  });
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    const [file] = event.dataTransfer.files;
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.value.trim()) {
      fileInput.value = '';
      fileLabel.textContent = 'Drop your media here, or browse';
      preview.replaceChildren();
      preview.hidden = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      hint.textContent = 'Your link will be shared as the post media.';
    } else if (!fileInput.files.length) {
      hint.textContent = 'Choose a file or add a media URL to continue.';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.className = 'form-message';
    const file = fileInput.files[0];
    const mediaUrl = urlInput.value.trim();
    if (!file && !mediaUrl) {
      message.textContent = 'Choose a video or image, or add a media URL.';
      message.classList.add('is-error');
      return;
    }
    publishButton.disabled = true;
    publishButton.querySelector('span').textContent = 'Sharing…';
    const body = new FormData();
    body.append('caption', caption.value.trim());
    if (file) {
      body.append('video', file);
    } else {
      let isImage = false;
      try {
        const pathname = new URL(mediaUrl).pathname.toLowerCase();
        isImage = /\.(png|jpe?g|gif|webp|avif|bmp)$/.test(pathname);
      } catch (error) {
        message.textContent = 'Enter a valid media URL.';
        message.className = 'form-message is-error';
        publishButton.disabled = false;
        publishButton.querySelector('span').textContent = 'Share post';
        return;
      }
      body.append(isImage ? 'imageUrl' : 'videoUrl', mediaUrl);
    }

    try {
      await api.request('/api/posts', { method: 'POST', body });
      window.location.replace('index.html');
    } catch (error) {
      message.textContent = error.message;
      message.className = 'form-message is-error';
      publishButton.disabled = false;
      publishButton.querySelector('span').textContent = 'Share post';
    }
  });

  window.addEventListener('beforeunload', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
});
