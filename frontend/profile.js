document.addEventListener('DOMContentLoaded', async () => {
  const api = window.LoopAPI;
  const identifier = new URLSearchParams(window.location.search).get('id');
  const profileCard = document.getElementById('profile-card');
  const grid = document.getElementById('profile-grid');
  const profileStatus = document.getElementById('profile-status');
  const heading = document.getElementById('posts-heading');
  const filters = document.getElementById('profile-filters');
  let profile = null;
  let listType = 'posts';

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  if (!identifier) {
    profileCard.replaceChildren(element('p', 'form-message is-error', 'No creator was selected.'));
    filters.hidden = true;
    return;
  }

  const renderProfile = () => {
    profileCard.replaceChildren();
    const avatar = element('img', 'profile-avatar');
    avatar.src = api.avatarUrl(profile);
    avatar.alt = `${profile.name}'s profile`;
    const detail = element('div', 'profile-details');
    detail.append(element('p', 'eyebrow', 'CREATOR PROFILE'));
    detail.append(element('h1', '', profile.name));
    detail.append(element('p', 'profile-username', `@${profile.username}`));
    if (profile.bio) detail.append(element('p', 'profile-bio', profile.bio));

    const stats = element('div', 'profile-stats');
    [
      [profile.postsCount, 'posts'],
      [profile.followersCount, 'followers'],
      [profile.followingCount, 'following'],
    ].forEach(([count, label]) => {
      const stat = element('span', 'profile-stat');
      stat.append(element('strong', '', api.formatCount(count)), element('small', '', label));
      stats.append(stat);
    });
    detail.append(stats);

    const actions = element('div', 'profile-actions');
    if (profile.isMe) {
      actions.append(element('span', 'own-profile-label', 'This is your corner of Loop'));
    } else {
      const followButton = element('button', `button ${profile.isFollowing ? 'button-outline' : 'button-primary'}`, profile.isFollowing ? 'Following' : 'Follow');
      followButton.type = 'button';
      followButton.addEventListener('click', async () => {
        if (!api.token) {
          window.location.href = 'login.html';
          return;
        }
        followButton.disabled = true;
        try {
          const result = await api.request(`/api/users/${encodeURIComponent(profile._id)}/follow`, { method: 'POST' });
          profile.isFollowing = result.following;
          profile.followersCount = result.followersCount;
          renderProfile();
          loadList();
        } catch (error) {
          api.showToast(error.message, 'error');
          followButton.disabled = false;
        }
      });
      actions.append(followButton);
    }

    detail.append(actions);
    profileCard.append(avatar, detail);
    document.title = `${profile.name} (@${profile.username}) — Loop`;
  };

  const renderPosts = (posts) => {
    grid.replaceChildren();
    if (!posts.length) {
      profileStatus.textContent = 'No posts here yet. Check back for a new moment.';
      return;
    }
    profileStatus.textContent = '';
    posts.forEach((post) => {
      const link = element('a', 'profile-tile');
      link.href = `index.html#post-${encodeURIComponent(post._id)}`;
      if (post.videoUrl) {
        const video = element('video', 'tile-media');
        video.src = post.videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', post.caption || 'Video post');
        link.append(video);
        link.append(element('span', 'tile-video-badge', '▶'));
      } else if (post.imageUrl) {
        const image = element('img', 'tile-media');
        image.src = post.imageUrl;
        image.alt = post.caption || 'Image post';
        image.loading = 'lazy';
        link.append(image);
      }
      const caption = element('span', 'tile-caption', post.caption || 'A moment shared');
      const stats = element('span', 'tile-stats', `♥ ${api.formatCount(post.likesCount)}　◌ ${api.formatCount(post.commentsCount)}`);
      link.append(caption, stats);
      grid.append(link);
    });
  };

  const renderPeople = (users) => {
    grid.replaceChildren();
    if (!users.length) {
      profileStatus.textContent = listType === 'followers' ? 'No followers yet.' : 'Not following anyone just yet.';
      return;
    }
    profileStatus.textContent = '';
    users.forEach((user) => {
      const link = element('a', 'people-row');
      link.href = api.profileUrl(user);
      const avatar = element('img', 'people-avatar');
      avatar.src = api.avatarUrl(user);
      avatar.alt = '';
      const details = element('span', 'people-details');
      details.append(element('strong', '', user.name), element('small', '', `@${user.username}`));
      link.append(avatar, details, element('span', 'people-arrow', '→'));
      grid.append(link);
    });
  };

  async function loadList() {
    if (!profile) return;
    heading.textContent = listType === 'posts' ? 'Posts' : listType === 'followers' ? 'Followers' : 'Following';
    profileStatus.textContent = listType === 'posts' ? 'Loading posts…' : 'Loading creators…';
    grid.replaceChildren();
    try {
      if (listType === 'posts') {
        const result = await api.request(`/api/users/${encodeURIComponent(identifier)}/posts?page=1&limit=30`);
        renderPosts(result.posts || []);
      } else {
        const users = await api.request(`/api/users/${encodeURIComponent(identifier)}/${listType}`);
        renderPeople(users);
      }
    } catch (error) {
      profileStatus.textContent = error.message;
      profileStatus.classList.add('is-error');
    }
  }

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-list]');
    if (!button) return;
    listType = button.dataset.list;
    filters.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    loadList();
  });

  try {
    profile = await api.request(`/api/users/${encodeURIComponent(identifier)}`);
    renderProfile();
    await loadList();
  } catch (error) {
    profileCard.replaceChildren(element('p', 'form-message is-error', error.message));
    filters.hidden = true;
  }
});
