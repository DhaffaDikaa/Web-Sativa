const AUTH_CONFIG = {
  PEGAWAI: { username: 'testpegawai', password: '123', role: 'pegawai', target: 'pegawai.html' },
  PEMILIK: { username: 'testpemilik', password: '123', role: 'pemilik', target: 'pemilik.html' }
};

class SativaAuth {
  constructor() {
    this.sessionKey = 'sativa_auth_session';
  }

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.sessionKey));
    } catch {
      return null;
    }
  }

  setSession(user) {
    localStorage.setItem(this.sessionKey, JSON.stringify({
      username: user.username,
      role: user.role,
      loggedInAt: new Date().toISOString()
    }));
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.location.href = 'login.html';
  }

  requireAuth(expectedRole = null) {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    if (expectedRole === 'pegawai' && (session.role === 'pegawai' || session.role === 'pemilik')) {
      return session;
    }
    if (expectedRole && session.role !== expectedRole) {
      if (session.role === 'pegawai') {
        window.location.href = 'pegawai.html';
      } else if (session.role === 'pemilik') {
        window.location.href = 'pemilik.html';
      }
      return null;
    }
    return session;
  }

  login(username, password) {
    const u = (username || '').trim();
    const p = (password || '').trim();

    if (u === AUTH_CONFIG.PEGAWAI.username && p === AUTH_CONFIG.PEGAWAI.password) {
      this.setSession(AUTH_CONFIG.PEGAWAI);
      return { success: true, redirect: AUTH_CONFIG.PEGAWAI.target };
    }

    if (u === AUTH_CONFIG.PEMILIK.username && p === AUTH_CONFIG.PEMILIK.password) {
      this.setSession(AUTH_CONFIG.PEMILIK);
      return { success: true, redirect: AUTH_CONFIG.PEMILIK.target };
    }

    return {
      success: false,
      message: 'Pesan Gagal : nama pengguna atau kata sandi tidak sesuai.'
    };
  }
}

window.sativaAuth = new SativaAuth();
