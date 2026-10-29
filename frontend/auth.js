document.addEventListener('DOMContentLoaded', async () => {
  const api = window.LoopAPI;
  const message = document.getElementById('auth-message');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const showMessage = (text, kind = 'error') => {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message is-${kind}`;
  };

  const finishLogin = (user) => {
    if (!user?.token) throw new Error('The server did not return a login token. Please try again.');
    api.setToken(user.token);
    window.location.replace('index.html');
  };

  const hash = new URLSearchParams(window.location.hash.slice(1));
  const googleToken = hash.get('token');
  if (googleToken) {
    api.setToken(googleToken);
    window.location.replace('index.html');
    return;
  }
  if (new URLSearchParams(window.location.search).has('error')) {
    showMessage('Google sign-in could not be completed. Please try again or use your email.');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = loginForm.querySelector('button[type="submit"]');
      button.disabled = true;
      showMessage('');
      const formData = new FormData(loginForm);
      try {
        const user = await api.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.get('email').trim(),
            password: formData.get('password'),
          }),
        });
        finishLogin(user);
      } catch (error) {
        showMessage(error.message);
        button.disabled = false;
      }
    });

    const googleButton = document.getElementById('google-login');
    if (googleButton) {
      try {
        const providers = await api.request('/api/auth/providers');
        if (providers.google) {
          googleButton.href = `${api.base}/api/auth/google`;
          googleButton.hidden = false;
        }
      } catch (error) {
        showMessage(error.message);
      }
    }
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = registerForm.querySelector('button[type="submit"]');
      button.disabled = true;
      showMessage('');
      const formData = new FormData(registerForm);
      try {
        const user = await api.request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.get('name').trim(),
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
          }),
        });
        finishLogin(user);
      } catch (error) {
        showMessage(error.message);
        button.disabled = false;
      }
    });
  }
});
