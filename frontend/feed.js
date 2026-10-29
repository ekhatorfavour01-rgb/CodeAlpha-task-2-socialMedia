document.addEventListener('DOMContentLoaded', () => {
  const api = window.LoopAPI;
  const scroller = document.getElementById('feed-scroller');
  const items = document.getElementById('feed-items');
  const status = document.getElementById('feed-status');
  const moreStatus = document.getElementById('feed-more');
  const title = document.getElementById('feed-title');
  const commentDialog = document.getElementById('comments-dialog');
  const commentsList = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');
  const commentMessage = document.getElementById('comment-message');
  let feedType = 'for-you';
  let page = 1;
  let hasMore = true;
  let loading = false;
  let feedRequestId = 0;
  let currentPostId = null;
  let commentCache = [];
  let requestedPost = window.location.hash.match(/^#post-(.+)$/)?.[1] || null;
  let soundOn = false;
  let soundChosen = false;

  function setSound(on) {
    soundOn = on;
    items.querySelectorAll('video').forEach((v) => {
      v.muted = !on;
    });
    items.querySelectorAll('.sound-toogle').forEach((b) => {
      b.textContent = on ? 'Sound on' : 'Muted';
      b.setAttribute('aria-label', on ? 'Mute video' : 'Turn video sound on');
    });
  }

  // The first tap anywhere turns the sound on (browsers require a tap first)
  document.addEventListener('click', (event) => {
    if (soundChosen) return;
    soundChosen = true;
    if (event.target.closest('.sound-toggle')) return;
    setSound(true);
    if (event.target.matches('video')) event.stopPropagation();
  }, { capture: true });

  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const setStatus = (text, visible = true) => {
    status.textContent = text;
    status.hidden = !visible;
  };

  const mediaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
        const playRequest = video.play();
        if (playRequest) playRequest.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { root: scroller, threshold: [0, 0.65, 1] });

  const updateLikeButton = (button, liked, count) => {
    button.classList.toggle('is-liked', liked);
    button.setAttribute('aria-pressed', String(liked));
    button.querySelector('.action-icon').textContent = liked ? '♥' : '♡';
    button.querySelector('.action-count').textContent = api.formatCount(count);
  };

  const createAction = (icon, count, label, className = '') => {
    const button = makeElement('button', `feed-action ${className}`);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    const iconElement = makeElement('span', 'action-icon', icon);
    iconElement.setAttribute('aria-hidden', 'true');
    const countElement = makeElement('span', 'action-count', api.formatCount(count));
    button.append(iconElement, countElement);
    return button;
  };

  const createPostCard = (post) => {
    const card = makeElement('article', 'video-card');
    card.dataset.postId = post._id;
    const stage = makeElement('div', 'media-stage');
    stage.setAttribute('aria-label', 'Post media');
    const mediaUrl = post.videoUrl || post.imageUrl;

    if (post.videoUrl) {
      const video = makeElement('video', 'post-media');
      video.src = post.videoUrl;
      video.playsInline = true;
      video.loop = true;
      video.muted = !soundOn;
      video.preload = 'metadata';
      video.setAttribute('aria-label', post.caption || 'Shared video');
      video.addEventListener('click', () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      });
      mediaObserver.observe(video);
      stage.append(video);
      const soundButton = makeElement('button', 'sound-toggle', soundOn ? 'Sound on' : 'Muted');
      soundButton.type = 'button';
      soundButton.setAttribute('aria-label', 'Turn video sound on');
      soundButton.addEventListener('click', () => {
        video.muted = !video.muted;
        soundButton.textContent = video.muted ? 'Muted' : 'Sound on';
        soundButton.setAttribute('aria-label', video.muted ? 'Turn video sound on' : 'Mute video');
      });
      stage.append(soundButton);
    } else if (post.imageUrl) {
      const image = makeElement('img', 'post-media');
      image.src = post.imageUrl;
      image.alt = post.caption || 'Shared image';
      image.loading = 'lazy';
      stage.append(image);
    } else {
      stage.classList.add('media-empty');
      stage.append(makeElement('span', 'media-placeholder', '✦'));
    }

    const shade = makeElement('div', 'media-shade');
    stage.append(shade);
    const details = makeElement('div', 'post-details');
    const author = post.author || {};
    const authorLink = makeElement('a', 'post-author');
    authorLink.href = api.profileUrl(author);
    const authorAvatar = makeElement('img');
    authorAvatar.src = api.avatarUrl(author);
    authorAvatar.alt = '';
    const authorName = makeElement('span', '', `@${author.username || 'creator'}`);
    authorLink.append(authorAvatar, authorName);
    details.append(authorLink);
    if (post.caption) details.append(makeElement('p', 'post-caption', post.caption));
    const date = new Date(post.createdAt);
    if (!Number.isNaN(date.valueOf())) {
      details.append(makeElement('span', 'post-date', date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })));
    }
    stage.append(details);

    const actions = makeElement('div', 'post-actions');
    const likeButton = createAction(post.liked ? '♥' : '♡', post.likesCount, 'Like this post', post.liked ? 'is-liked' : '');
    likeButton.setAttribute('aria-pressed', String(!!post.liked));
    likeButton.addEventListener('click', async () => {
      if (!api.token) {
        window.location.href = 'login.html';
        return;
      }
      likeButton.disabled = true;
      try {
        const result = await api.request(`/api/posts/${encodeURIComponent(post._id)}/like`, { method: 'POST' });
        updateLikeButton(likeButton, result.liked, result.likesCount);
      } catch (error) {
        api.showToast(error.message, 'error');
      } finally {
        likeButton.disabled = false;
      }
    });

    const commentButton = createAction('◌', post.commentsCount, 'View comments');
    commentButton.addEventListener('click', () => openComments(post._id));
    const shareButton = createAction('↗', '', 'Copy post link');
    shareButton.querySelector('.action-count').remove();
    shareButton.addEventListener('click', async () => {
      const link = `${window.location.origin}${window.location.pathname}#post-${post._id}`;
      try {
        await navigator.clipboard.writeText(link);
        api.showToast('Post link copied.');
      } catch (error) {
        api.showToast('Could not copy the post link on this browser.', 'error');
      }
    });
    actions.append(likeButton, commentButton, shareButton);
    card.append(stage, actions);
    card._commentCount = commentButton.querySelector('.action-count');
    card._commentsCount = post.commentsCount || 0;
    return card;
  };

  async function loadPosts(reset = false) {
    if (loading || (!hasMore && !reset)) return;
    if (reset) {
      feedRequestId += 1;
      loading = false;
      page = 1;
      hasMore = true;
      items.replaceChildren();
      setStatus('Finding good things for you…');
    }
    loading = true;
    const requestId = ++feedRequestId;
    moreStatus.hidden = page === 1;
    const endpoint = feedType === 'following' ? '/api/posts/following' : '/api/posts';
    try {
      const result = requestedPost && page === 1
        ? { posts: [await api.request(`/api/posts/${encodeURIComponent(requestedPost)}`)], hasMore: false }
        : await api.request(`${endpoint}?page=${page}&limit=6`);
      if (requestId !== feedRequestId) return;
      hasMore = result.hasMore;
      if (result.posts.length) {
        result.posts.forEach((post) => items.append(createPostCard(post)));
        page += 1;
        requestedPost = null;
        setStatus('', false);
      } else if (page === 1 && feedType === 'following') {
        setStatus('Your Following feed is ready for its first post. Follow a creator to see what they share.');
      } else if (page === 1) {
        setStatus('No posts yet. Be the first to share a moment.', true);
      } else {
        setStatus('', false);
      }
      if (!hasMore && result.posts.length) moreStatus.textContent = 'You’re all caught up.';
    } catch (error) {
      if (requestId === feedRequestId) {
        if (page === 1) setStatus(error.message);
        else api.showToast(error.message, 'error');
      }
    } finally {
      if (requestId === feedRequestId) {
        loading = false;
        moreStatus.hidden = !hasMore;
        if (hasMore) moreStatus.textContent = 'Scroll for more';
      }
    }
  }

  function setFeed(type) {
    if (type === 'following' && !api.token) {
      window.location.href = 'login.html';
      return;
    }
    feedType = type;
    requestedPost = null;
    title.textContent = type === 'following' ? 'Following' : 'For you';
    document.querySelectorAll('[data-feed]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.feed === type);
    });
    scroller.scrollTop = 0;
    loadPosts(true);
  }

  async function openComments(postId) {
    currentPostId = postId;
    commentsList.replaceChildren(makeElement('p', 'feed-status', 'Loading comments…'));
    commentMessage.textContent = '';
    commentForm.hidden = !api.token;
    commentDialog.showModal();
    try {
      commentCache = await api.request(`/api/posts/${encodeURIComponent(postId)}/comments`);
      renderComments();
    } catch (error) {
      commentsList.replaceChildren(makeElement('p', 'form-message is-error', error.message));
    }
  }

  function renderComments() {
    commentsList.replaceChildren();
    if (!commentCache.length) {
      commentsList.append(makeElement('p', 'empty-comments', 'No comments yet. Start the conversation.'));
      return;
    }
    commentCache.forEach((comment) => {
      const row = makeElement('article', 'comment-item');
      const avatar = makeElement('img', 'comment-avatar');
      avatar.src = api.avatarUrl(comment.author);
      avatar.alt = '';
      const body = makeElement('div', 'comment-body');
      const author = makeElement('a', 'comment-author', `@${comment.author?.username || 'creator'}`);
      author.href = api.profileUrl(comment.author || {});
      const text = makeElement('p', '', comment.text);
      const created = new Date(comment.createdAt);
      const date = makeElement('small', '', Number.isNaN(created.valueOf()) ? '' : created.toLocaleDateString());
      body.append(author, text, date);
      row.append(avatar, body);
      commentsList.append(row);
    });
  }

  document.querySelectorAll('[data-feed]').forEach((button) => {
    button.addEventListener('click', () => setFeed(button.dataset.feed));
  });
  document.getElementById('close-comments').addEventListener('click', () => commentDialog.close());
  commentDialog.addEventListener('click', (event) => {
    if (event.target === commentDialog) commentDialog.close();
  });

  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = commentText.value.trim();
    if (!text || !currentPostId) return;
    const submit = commentForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    commentMessage.textContent = '';
    try {
      const comment = await api.request(`/api/posts/${encodeURIComponent(currentPostId)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      commentCache.unshift(comment);
      renderComments();
      commentText.value = '';
      const card = items.querySelector(`[data-post-id="${CSS.escape(currentPostId)}"]`);
      if (card?._commentCount) {
        card._commentsCount = (card._commentsCount || 0) + 1;
        card._commentCount.textContent = api.formatCount(card._commentsCount);
      }
    } catch (error) {
      commentMessage.textContent = error.message;
      commentMessage.className = 'form-message is-error';
    } finally {
      submit.disabled = false;
    }
  });

  scroller.addEventListener('scroll', () => {
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 600) loadPosts();
  }, { passive: true });

  loadPosts();
});
