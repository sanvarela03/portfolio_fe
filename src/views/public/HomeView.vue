<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { SiteProfile, Project, Skill, Experience, BlogPost } from '@/types/portfolio'
import { ArrowRight, ExternalLink, FileText, Github, Linkedin, Mail, MapPin, Briefcase, GraduationCap } from 'lucide-vue-next'

const profile = ref<SiteProfile | null>(null)
const projects = ref<Project[]>([])
const skills = ref<Skill[]>([])
const experiences = ref<Experience[]>([])
const posts = ref<BlogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const groupedSkills = computed(() => {
  const map: Record<string, Skill[]> = {}
  for (const s of skills.value) {
    const key = s.category_display || s.category
    if (!map[key]) map[key] = []
    map[key].push(s)
  }
  return map
})

onMounted(async () => {
  try {
    const [p, projs, sk, exp, bl] = await Promise.all([
      portfolioService.getProfile(),
      portfolioService.getProjects(),
      portfolioService.getSkills(),
      portfolioService.getExperiences(),
      portfolioService.getPosts(),
    ])
    profile.value = p
    projects.value = projs
    skills.value = sk
    experiences.value = exp
    posts.value = bl.slice(0, 3)
  } catch (e: any) {
    error.value = e.message || 'Error cargando el portafolio'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-text">
        <span v-if="profile?.available_for_work" class="badge badge-success">Disponible para proyectos</span>
        <h1>{{ profile?.full_name || 'Santiago Varela Daza' }}</h1>
        <p class="hero-headline">{{ profile?.headline || 'Ingeniero en Sistemas y Computación' }}</p>
        <p class="hero-sub">{{ profile?.subheadline }}</p>
        <p class="hero-bio">{{ profile?.bio }}</p>
        <div class="hero-meta" v-if="profile?.location">
          <span><MapPin :size="15" /> {{ profile.location }}</span>
          <span v-if="profile?.email"><Mail :size="15" /> {{ profile.email }}</span>
        </div>
        <div class="hero-actions">
          <router-link to="/proyectos" class="btn btn-primary">
            Ver Proyectos <ArrowRight :size="16" />
          </router-link>
          <router-link to="/contacto" class="btn btn-secondary">
            <Mail :size="16" /> Contactar
          </router-link>
          <a v-if="profile?.cv_url" :href="profile.cv_url" target="_blank" rel="noopener" class="btn btn-secondary">
            <FileText :size="16" /> Mi CV
          </a>
          <a v-if="profile?.github_url" :href="profile.github_url" target="_blank" rel="noopener" class="btn btn-secondary">
            <Github :size="16" />
          </a>
          <a v-if="profile?.linkedin_url" :href="profile.linkedin_url" target="_blank" rel="noopener" class="btn btn-secondary">
            <Linkedin :size="16" />
          </a>
        </div>
      </div>

      <div class="hero-avatar-wrap" v-if="profile?.avatar_url">
        <img :src="profile.avatar_url" :alt="profile.full_name" class="hero-avatar" />
      </div>
    </section>

    <!-- PROJECTS -->
    <section class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Proyectos Destacados</h2>
          <p class="section-subtitle">Sistemas reales desarrollados en web, móvil y arquitectura cloud.</p>
        </div>
        <router-link to="/proyectos" class="btn btn-secondary btn-sm">Ver todos</router-link>
      </div>

      <div v-if="loading" class="card">Cargando proyectos...</div>
      <div v-else class="grid-2">
        <article v-for="proj in projects.slice(0, 4)" :key="proj.id" class="card project-card">
          <img v-if="proj.cover_image" :src="proj.cover_image" :alt="proj.title" class="project-cover" />
          <div class="project-body">
            <div class="project-meta">
              <span class="badge">{{ proj.category }}</span>
              <span v-if="proj.is_featured" class="badge badge-success">Destacado</span>
            </div>
            <h3>{{ proj.title }}</h3>
            <p class="muted">{{ proj.summary }}</p>
            <div class="tags">
              <span v-for="tech in proj.tech_stack" :key="tech" class="badge badge-muted">{{ tech }}</span>
            </div>
            <div class="project-links">
              <router-link :to="`/proyectos/${proj.slug}`" class="btn btn-primary btn-sm">Ver detalle</router-link>
              <a v-if="proj.demo_url" :href="proj.demo_url" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
                Demo <ExternalLink :size="14" />
              </a>
              <a v-if="proj.docs_url" :href="proj.docs_url" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
                Monografía <ExternalLink :size="14" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- SKILLS -->
    <section class="section">
      <h2 class="section-title">Habilidades & Stack Tecnológico</h2>
      <p class="section-subtitle">Tecnologías que utilizo en producción y proyectos de ingeniería.</p>
      <div class="grid-3">
        <div v-for="(items, category) in groupedSkills" :key="category" class="card">
          <h3 class="cat-title">{{ category }}</h3>
          <div v-for="sk in items" :key="sk.id" class="skill-row">
            <div class="skill-label">
              <span>{{ sk.name }}</span>
              <span class="muted">{{ sk.level }}%</span>
            </div>
            <div class="skill-bar">
              <div class="skill-fill" :style="{ width: `${sk.level}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EXPERIENCE & EDUCATION -->
    <section class="section">
      <h2 class="section-title">Experiencia & Formación</h2>
      <p class="section-subtitle">Trayectoria profesional y formación académica.</p>
      <div class="timeline">
        <div v-for="exp in experiences" :key="exp.id" class="card timeline-card">
          <div class="timeline-head">
            <div class="timeline-title">
              <Briefcase v-if="exp.entry_type === 'WORK'" :size="18" class="accent-icon" />
              <GraduationCap v-else :size="18" class="accent-icon" />
              <div>
                <h3>{{ exp.role }}</h3>
                <p class="muted">{{ exp.company }} <span v-if="exp.location">• {{ exp.location }}</span></p>
              </div>
            </div>
            <span class="badge badge-muted">
              {{ exp.start_date }} — {{ exp.is_current ? 'Actualidad' : exp.end_date }}
            </span>
          </div>
          <p v-if="exp.description">{{ exp.description }}</p>
          <ul v-if="exp.highlights?.length" class="highlights">
            <li v-for="(h, i) in exp.highlights" :key="i">{{ h }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- LATEST BLOG POSTS -->
    <section class="section" v-if="posts.length">
      <div class="section-head">
        <div>
          <h2 class="section-title">Blog Técnico</h2>
          <p class="section-subtitle">Notas sobre arquitectura, Django, Docker, cloud y desarrollo web.</p>
        </div>
        <router-link to="/blog" class="btn btn-secondary btn-sm">Ver blog</router-link>
      </div>
      <div class="grid-3">
        <article v-for="post in posts" :key="post.id" class="card">
          <div class="tags" style="margin-bottom: 0.6rem">
            <span v-for="tag in post.tags" :key="tag" class="badge">{{ tag }}</span>
          </div>
          <h3>{{ post.title }}</h3>
          <p class="muted">{{ post.excerpt }}</p>
          <router-link :to="`/blog/${post.slug}`" class="btn btn-secondary btn-sm">Leer artículo</router-link>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.7fr);
  gap: 2.5rem;
  align-items: center;
  padding: 2rem 0 3rem;
}
.hero h1 {
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0.75rem 0 0.5rem;
  letter-spacing: -0.03em;
}
.hero-headline {
  font-size: 1.2rem;
  color: var(--accent);
  font-weight: 600;
  margin: 0 0 0.35rem;
}
.hero-sub {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0 0 1rem;
}
.hero-bio {
  margin: 0 0 1.25rem;
  color: var(--text);
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1.5rem;
}
.hero-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.hero-avatar-wrap {
  display: flex;
  justify-content: center;
}
.hero-avatar {
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 24px;
  border: 2px solid var(--border-strong);
  box-shadow: 0 24px 60px rgba(56, 189, 248, 0.18);
}
.section {
  margin-top: 3.5rem;
}
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.project-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.project-cover {
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-bottom: 1px solid var(--border);
}
.project-body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}
.project-body h3 {
  margin: 0;
}
.project-meta,
.tags,
.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.muted {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.92rem;
}
.cat-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: var(--accent);
}
.skill-row {
  margin-bottom: 0.85rem;
}
.skill-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  margin-bottom: 0.3rem;
}
.skill-bar {
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  overflow: hidden;
}
.skill-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
}
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.timeline-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.timeline-title {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.timeline-title h3 {
  margin: 0;
}
.accent-icon {
  color: var(--accent);
  margin-top: 0.25rem;
}
.highlights {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  color: var(--text-muted);
}
@media (max-width: 820px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-avatar-wrap {
    order: -1;
  }
}
</style>
