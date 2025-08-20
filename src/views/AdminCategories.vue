<template>
  <main class="admin-main">
    <div class="admin-container">
      <!-- Header de Administración -->
      <div class="admin-header">
        <h1>Administración de Categorías</h1>
        <p>Gestiona las categorías disponibles para clasificar equipos</p>
      </div>

      <!-- Sección de gestión de categorías -->
      <div class="create-section">
        <div class="section-header">
          <h2>Gestionar Categorías</h2>
          <div class="section-icon">🏷️</div>
        </div>

        <!-- Filtros y acciones -->
        <div class="filters-actions">
          <div class="search-container">
            <i class="fas fa-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Buscar categorías..." class="search-input" />
          </div>
          <button @click="openCreateModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            Nueva Categoría
          </button>
        </div>

        <!-- Tabla de categorías -->
        <div class="categories-table-container">
          <table class="categories-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Equipos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in filteredCategories" :key="category.id" class="table-row">
                <td class="category-name">
                  <div class="name-container">
                    <i class="fas fa-tag category-icon"></i>
                    <span class="name-text">{{ category.name }}</span>
                  </div>
                </td>
                <td class="category-description">
                  <span v-if="category.description" class="description-text">
                    {{ category.description }}
                  </span>
                  <span v-else class="no-description">
                    Sin descripción
                  </span>
                </td>
                <td class="teams-count">
                  <div class="count-badge">
                    <i class="fas fa-users"></i>
                    {{ getTeamsCount(category.id) }}
                  </div>
                </td>
                <td class="actions">
                  <button @click="editCategory(category)" class="btn-action edit" title="Editar categoría">
                    Editar
                  </button>
                  <button @click="confirmDelete(category)" class="btn-action delete"
                    :disabled="isCategoryInUse(category.id)"
                    :title="isCategoryInUse(category.id) ? 'No se puede eliminar una categoría en uso' : 'Eliminar categoría'">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div v-if="filteredCategories.length === 0" class="no-categories">
            <div class="no-categories-icon">🏷️</div>
            <p>
              <span v-if="searchQuery">No se encontraron categorías que coincidan con tu búsqueda</span>
              <span v-else>No hay categorías registradas</span>
            </p>
            <button v-if="!searchQuery" @click="openCreateModal" class="btn-primary">
              <i class="fas fa-plus"></i>
              Crear Primera Categoría
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar categoría -->
    <UpsertCategoryPopup v-if="showModal" :category="selectedCategory" @close="closeModal" @save="handleSave" />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteModal" :title="'Eliminar Categoría'"
      :message="`¿Estás seguro de que deseas eliminar la categoría '${categoryToDelete?.name}'?`"
      :confirmText="'Eliminar'" :cancelText="'Cancelar'" @confirm="handleDelete" @cancel="closeDeleteModal" />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import { useTeams } from '@/composables/useTeams';
import type { Category } from '@/types/CategoryType';
import UpsertCategoryPopup from '@/components/UpsertCategoryPopup.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

// Usar el composable de categorías y teams
const {
  categories,
  loadCategories,
  deleteCategory,
  clearError
} = useCategories();

const { teams, loadTeams } = useTeams();

// Estados reactivos locales
const searchQuery = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedCategory = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

// Computed para filtrar categorías
const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return categories.value;
  }

  const query = searchQuery.value.toLowerCase();
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(query) ||
    category.description?.toLowerCase().includes(query)
  );
});

// Funciones para gestionar modales
const openCreateModal = () => {
  selectedCategory.value = null;
  showModal.value = true;
};

const editCategory = (category: Category) => {
  selectedCategory.value = category;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCategory.value = null;
};

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
};

// Funciones de datos
const getTeamsCount = (categoryId: number): number => {
  // TODO: Cuando la API de teams incluya categorías, filtrar por categoryId
  // Por ahora retornar el total de equipos como placeholder
  return teams.value.length;
};

const isCategoryInUse = (categoryId: number): boolean => {
  return getTeamsCount(categoryId) > 0;
};

// Handlers para acciones
const handleSave = async () => {
  await loadCategories();
  closeModal();
};

const handleDelete = async () => {
  if (categoryToDelete.value) {
    const result = await deleteCategory(categoryToDelete.value.id);
    if (!result.success)
      alert('Error al eliminar la categoría: ' + result.message);
  }
  closeDeleteModal();
};

// Inicialización
onMounted(async () => {
  clearError();
  const [categoriesResult, teamsResult] = await Promise.all([
    loadCategories(),
    loadTeams()
  ]);

  if (!categoriesResult.success) {
    console.error('Error al cargar categorías:', categoriesResult.message);
  }

  if (!teamsResult.success) {
    console.error('Error al cargar equipos:', teamsResult.message);
  }
});
</script>

<style scoped>
.admin-main {
  padding-top: 80px;
  min-height: 100vh;
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
}

.admin-header p {
  font-size: 1.1rem;
  color: var(--app-text-secondary);
}

.create-section {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--app-border-color);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.section-icon {
  font-size: 1.5rem;
  background: var(--secondary-blue);
  color: var(--white);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.filters-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-container {
  position: relative;
  max-width: 400px;
  flex: 1;
}

.search-container i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--app-text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  transition: all var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.categories-table-container {
  overflow-x: auto;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.categories-table th,
.categories-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--app-border-color);
  color: var(--app-text-primary);
}

.categories-table th {
  background: var(--app-table-header-bg);
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  transition: background-color var(--transition-normal);
}

.table-row:hover {
  background: var(--app-hover-bg);
}

.category-name {
  min-width: 200px;
}

.name-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  color: var(--primary-blue);
  font-size: 1.1rem;
}

.name-text {
  font-weight: 600;
  color: var(--app-text-primary);
}

.category-description {
  min-width: 250px;
  max-width: 350px;
}

.description-text {
  color: var(--app-text-secondary);
  line-height: 1.4;
}

.no-description {
  color: var(--app-text-secondary);
  font-style: italic;
}

.teams-count {
  min-width: 100px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--app-input-bg);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-xl);
  font-weight: 600;
  color: var(--app-text-primary);
  border: 1px solid var(--app-border-color);
}

.count-badge i {
  color: var(--primary-blue);
}

.actions {
  min-width: 150px;
}

.btn-action {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-right: 0.5rem;
}

.btn-action.edit {
  background: var(--secondary-blue);
  color: var(--white);
}

.btn-action.edit:hover {
  background: var(--primary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.btn-action.delete {
  background: var(--danger);
  color: var(--white);
}

.btn-action.delete:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.btn-action.delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--app-text-secondary);
  background: var(--app-input-bg);
  border: 1px solid var(--app-border-color);
}

.no-categories {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--app-text-secondary);
}

.no-categories-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.no-categories p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .filters-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .categories-table {
    font-size: 0.9rem;
  }

  .categories-table th,
  .categories-table td {
    padding: 0.75rem 0.5rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .btn-action {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .search-input {
    font-size: 0.9rem;
  }
}
</style>
