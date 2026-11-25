<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import portfolioService from '@/services/portfolioService'
import type { SiteProfile } from '@/types/portfolio'
import { Github, Linkedin, Lock, Menu, X, FileText } from 'lucide-vue-next'

const auth = useAuthStore()
const profile = ref<SiteProfile | null>(null)
const mobileOpen = ref(false)

onMounted(async () => {
  try {
    profile.value = await portfolioService.getProfile()
  } catch {
    // Fallback handled gracefully
  }
})
</script>

<template>
  <div class="public-shell">
    <header class="navbar">
      <div class="container nav-inner">
        <router-link to="/" class="brand">
          <span class="brand-dot"></span>
          <span>Santiago Varela</span>
        </router-link>

        <nav class="nav-links" :class="{ open: mobileOpen }">
          <router-link to="/" @click="mobileOpen = false">Inicio</router-link>
          <router-link to="/proyectos" @click="mobileOpen = false">Proyectos</router-link>
          <router-link to="/blog" @click="mobileOpen = false">Blog</router-link>
          <router-link to="/contacto" @click="mobileOpen = false">Contacto</router-link>
          <a
            v-if="profile?.cv_url"
            :href="profile.cv_url"
            target="_blank"
            rel="noopener"
            class="btn btn-secondary btn-sm"
          >
            <FileText :size="15" /> CV
          </a>
          <router-link
            :to="auth.isAuthenticated ? '/admin' : '/login'"
            class="btn btn-primary btn-sm"
            @click="mobileOpen = false"
          >
            <Lock :size="15" /> {{ auth.isAuthenticated ? 'Panel Admin' : 'Admin' }}
          </router-link>
        </nav>

        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menú">
          <X v-if="mobileOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <strong>{{ profile?.full_name || 'Santiago Varela Daza' }}</strong>
          <p class="footer-sub">{{ profile?.headline || 'Ingeniero en Sistemas y Computación' }}</p>
        </div>
        <div class="footer-links">
          <a
            :href="profile?.github_url || 'https://github.com/sanvarela03'"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <Github :size="18" /> GitHub
          </a>
          <a
            :href="profile?.linkedin_url || 'https://www.linkedin.com/in/santiago-varela-b33917165'"
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
          >
            <Linkedin :size="18" /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.public-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(11, 16, 32, 0.8);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
}
.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.nav-links > a {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.93rem;
}
.nav-links > a.router-link-exact-active,
.nav-links > a:hover {
  color: var(--text);
  text-decoration: none;
}
.mobile-toggle {
  display: none;
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text);
  border-radius: 8px;
  padding: 0.4rem;
  cursor: pointer;
}
.main-content {
  flex: 1;
  padding: 2.5rem 0 4rem;
}
.footer {
  border-top: 1px solid var(--border);
  padding: 2rem 0;
  background: rgba(11, 16, 32, 0.6);
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.footer-sub {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}
.footer-links {
  display: flex;
  gap: 1.25rem;
}
.footer-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
}
.footer-links a:hover {
  color: var(--accent);
}
@media (max-width: 780px) {
  .mobile-toggle {
    display: inline-flex;
  }
  .nav-links {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--bg-elev);
    border-bottom: 1px solid var(--border);
    padding: 1.25rem;
  }
  .nav-links.open {
    display: flex;
  }
}
</style>
