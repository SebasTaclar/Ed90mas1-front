<template>
  <header>
    <nav class="navbar">
      <RouterLink class="link-navbar home" to="/" @click="closeMobileMenu">
        <div class="brand-title">ED90<span class="mas">mas</span>1<span class="domain">.com</span></div>
      </RouterLink>

      <!-- Saludo personalizado -->
      <div v-if="isLoggedIn" class="user-greeting">
        <span>Hola, {{ username }}</span>
      </div>

      <!-- Menu hamburguesa para mobile -->
      <button class="hamburger-menu" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Controles de navegación desktop -->
      <div class="nav-controls desktop-nav">
        <ThemeToggle />
        <RouterLink v-if="isLoggedIn" class="link-navbar admin-link" to="/admin">Administración</RouterLink>
        <RouterLink v-if="!isLoggedIn" class="link-navbar access" to="/login">Acceder</RouterLink>
        <RouterLink v-if="isLoggedIn" @click="logout" class="link-navbar logout-btn" to="/">Cerrar sesión</RouterLink>
      </div>

      <!-- Menu mobile desplegable -->
      <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <!-- Controles mobile -->
          <div class="mobile-controls">
            <ThemeToggle />
            <RouterLink v-if="isLoggedIn" class="mobile-link admin-link" to="/admin" @click="closeMobileMenu">
              Administración
            </RouterLink>
            <RouterLink v-if="!isLoggedIn" class="mobile-link access" to="/login" @click="closeMobileMenu">
              Acceder
            </RouterLink>
            <div v-if="isLoggedIn" class="mobile-user-greeting">
              <span>Hola, {{ username }}</span>
            </div>
            <RouterLink v-if="isLoggedIn" @click="logout; closeMobileMenu()" class="mobile-link logout-btn" to="/">
              Cerrar sesión
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />

  <!-- Botones flotantes de redes sociales -->
  <SocialFloating />

  <!-- Contenedor de notificaciones -->
  <NotificationContainer />
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { authService } from '@/services/api';
import { onMounted, ref, watch } from 'vue';
import router from './router';
import ThemeToggle from '@/components/ThemeToggle.vue';
import SocialFloating from '@/components/SocialFloating.vue';
import NotificationContainer from '@/components/NotificationContainer.vue';

const isLoggedIn = ref(false);
const username = ref('');
const isMobileMenuOpen = ref(false);

// Funciones para el menú hamburguesa
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const checkAuthStatus = () => {
  isLoggedIn.value = authService.isAuthenticated();
  if (isLoggedIn.value) {
    const currentUser = authService.getCurrentUser();
    username.value = currentUser?.name || '';
  } else {
    username.value = '';
  }
};

const logout = () => {
  authService.logout();
  isLoggedIn.value = false;
  username.value = '';
  router.push('/');
};

onMounted(() => {
  checkAuthStatus();
  // Si estamos en home, forzar modo oscuro
  if (route.name === 'home' || route.path === '/') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

const route = useRoute();
watch(route, () => {
  checkAuthStatus();
  // Si navegamos a home, forzar modo oscuro
  if (route.name === 'home' || route.path === '/') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  margin: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 60px;
  padding: 0 20px;
  box-shadow: var(--shadow-heavy);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

.hamburger-menu {
  display: none;
}

.mobile-menu {
  display: none;
}

.link-navbar {
  text-decoration: none;
  padding: 10px 15px;
  font-weight: 500;
  font-size: 1rem;
  color: var(--white);
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-md);
}

.link-navbar:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.home {
  display: flex;
  align-items: center;
  padding: 5px 15px;
}

.navbar-logo {
  height: 45px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  transition: all var(--transition-normal);
  filter: brightness(1.1);
}

.navbar-logo:hover {
  transform: scale(1.05);
  filter: brightness(1.3);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--white);
  letter-spacing: -0.5px;
  transition: all var(--transition-normal);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.brand-title .mas {
  color: var(--white);
  font-weight: 600;
  font-size: 1.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.brand-title .domain {
  color: var(--white);
  font-weight: 600;
  font-size: 1.5rem;
}

.brand-title:hover {
  transform: scale(1.05);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.brand-title:hover .mas {
  color: var(--white);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.brand-title:hover .domain {
  color: var(--white);
}

.user-greeting {
  color: var(--white);
  font-weight: 600;
  font-size: 1rem;
  margin-left: 1.5rem;
  opacity: 0.95;
}

.user-greeting span {
  transition: opacity var(--transition-normal);
}

.user-greeting:hover span {
  opacity: 1;
}

.access {
  margin-left: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.access:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background-color: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.5);
  color: #ff6b6b;
}

.admin-link {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.admin-link:hover {
  background-color: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
  color: #81c784;
}

@media (max-width: 768px) {
  .navbar {
    height: 70px;
    padding: 0 15px;
    justify-content: space-between;
  }

  .desktop-nav {
    display: none;
  }

  .hamburger-menu {
    display: flex;
    flex-direction: column;
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    justify-content: space-around;
    align-items: center;
    z-index: 1001;
  }

  .hamburger-menu span {
    display: block;
    height: 3px;
    width: 100%;
    background-color: var(--white);
    border-radius: 3px;
    transition: all var(--transition-normal);
  }

  .hamburger-menu.active span:nth-child(1) {
    transform: rotate(45deg) translate(8px, 8px);
  }

  .hamburger-menu.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger-menu.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .mobile-menu {
    position: fixed;
    top: 70px;
    left: 0;
    width: 100%;
    height: calc(100vh - 70px);
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    z-index: 999;
    overflow-y: auto;
    display: block !important;
  }

  .mobile-menu.active {
    transform: translateX(0);
  }

  .mobile-menu-content {
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-link {
    color: var(--white);
    text-decoration: none;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: var(--border-radius-md);
    transition: all var(--transition-normal);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
  }

  .mobile-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .mobile-controls {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .mobile-user-greeting {
    color: var(--white);
    text-align: center;
    padding: 1rem;
    margin: 0.5rem 0;
    font-weight: 600;
    font-size: 1.1rem;
    opacity: 0.95;
  }

  .home {
    padding: 5px 10px;
  }

  .brand-title {
    font-size: 1.3rem;
  }

  .brand-title .mas {
    font-size: 1.3rem;
  }

  .brand-title .domain {
    font-size: 1.3rem;
  }

  .access {
    width: 100%;
    text-align: center;
    padding: 1rem;
    font-size: 1.1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
  }

  .access:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .logout-btn {
    width: 100%;
    text-align: center;
    padding: 1rem;
    font-size: 1.1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: var(--white);
    backdrop-filter: blur(10px);
  }

  .logout-btn:hover {
    background-color: rgba(220, 53, 69, 0.2);
    border-color: rgba(220, 53, 69, 0.5);
    color: #ff6b6b;
  }

  .admin-link {
    width: 100%;
    text-align: center;
    padding: 1rem;
    font-size: 1.1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: var(--white);
    backdrop-filter: blur(10px);
  }

  .admin-link:hover {
    background-color: rgba(76, 175, 80, 0.2);
    border-color: rgba(76, 175, 80, 0.5);
    color: #81c784;
  }
}
</style>
