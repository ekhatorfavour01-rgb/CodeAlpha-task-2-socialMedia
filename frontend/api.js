(function () {
  const configuredBase = window.MEDIA_API_URL
    || window.SOCIAL_API_BASE
    || document.querySelector('meta[name="api-base"]')?.content?.trim();
  const apiBase = (configuredBase || window.location.origin).replace(/\/+$/, '');
  const tokenKey = 'loop.token';

  const api = {
    base: apiBase,
    get token() {
      return localStorage.getItem(tokenKey);
    },
    setToken(token) {
      localStorage.setItem(tokenKey, token);
    },
    clearToken() {
      localStorage.removeItem(tokenKey);
    },
    async request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      const token = api.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);

      const isFormData = options.body instanceof FormData;
      if (options.body && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      let response;
      try {
        response = await fetch(`${apiBase}${path}`, { ...options, headers });
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Could not reach Loop. Check your connection and try again.');
      }

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = result && typeof result === 'object' && result.message
          ? result.message
          : `Request failed (${response.status}). Please try again.`;
        throw new Error(message);
      }
      return result;
    },
    async me() {
      return api.request('/api/auth/me');
    },
    async getCurrentUser() {
      if (!api.token) return null;
      try {
        return await api.me();
      } catch (error) {
        if (/login expired|not logged in|no longer exists/i.test(error.message)) api.clearToken();
        throw error;
      }
    },
    showToast(message, kind = 'success') {
      const region = document.getElementById('toast-region');
      if (!region) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${kind}`;
      toast.textContent = message;
      region.append(toast);
      window.setTimeout(() => toast.remove(), 3600);
    },
    avatarUrl(user) {
      return user?.avatar || `https://ui-avatars.com/api/?background=25242b&color=fff&name=${encodeURIComponent(user?.name || 'Loop creator')}`;
    },
    formatCount(count) {
      return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(count || 0);
    },
    profileUrl(user) {
      return `profile.html?id=${encodeURIComponent(user?.username || user?._id || '')}`;
    },
  };

  window.LoopAPI = api;

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('user-search');
    const results = document.getElementById('search-results');
    if (form && input && results) {
      let timer;
      input.addEventListener('input', () => {
        window.clearTimeout(timer);
        const query = input.value.trim();
        if (query.length < 2) {
          results.replaceChildren();
          results.hidden = true;
          return;
        }
        timer = window.setTimeout(async () => {
          try {
            const users = await api.request(`/api/users?q=${encodeURIComponent(query)}`);
            results.replaceChildren();
            if (!users.length) {
              const empty = document.createElement('p');
              empty.className = 'search-empty';
              empty.textContent = 'No creators found yet.';
              results.append(empty);
            } else {
              users.forEach((user) => {
                const link = document.createElement('a');
                link.className = 'search-result';
                link.href = api.profileUrl(user);
                const avatar = document.createElement('img');
                avatar.src = api.avatarUrl(user);
                avatar.alt = '';
                const details = document.createElement('span');
                const name = document.createElement('strong');
                name.textContent = user.name;
                const username = document.createElement('small');
                username.textContent = `@${user.username}`;
                details.append(name, username);
                link.append(avatar, details);
                results.append(link);
              });
            }
            results.hidden = false;
          } catch (error) {
            api.showToast(error.message, 'error');
          }
        }, 220);
      });

      document.addEventListener('click', (event) => {
        if (!form.contains(event.target)) results.hidden = true;
      });
      input.addEventListener('focus', () => {
        if (results.childElementCount) results.hidden = false;
      });
    }

    const authLink = document.getElementById('auth-link');
    const profileLink = document.getElementById('profile-link');
    const avatar = document.getElementById('nav-avatar');
    if (api.token && authLink && profileLink && avatar) {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          authLink.textContent = 'Log out';
          authLink.href = '#logout';
          authLink.addEventListener('click', (event) => {
            event.preventDefault();
            api.clearToken();
            window.location.href = 'index.html';
          });
          profileLink.href = api.profileUrl(user);
          profileLink.hidden = false;
          avatar.src = api.avatarUrl(user);
          avatar.alt = `${user.name}'s profile`;
        }
      } catch (error) {
        api.showToast(error.message, 'error');
      }
    }
  });
})();
