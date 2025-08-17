<template>
 <Teleport to="body">
  <div class="notification-container">
   <TransitionGroup name="notification" tag="div">
    <div v-for="notification in notifications" :key="notification.id"
     :class="['notification', `notification--${notification.type}`]" @click="removeNotification(notification.id)">
     <div class="notification__icon">
      <span v-if="notification.type === 'success'">✅</span>
      <span v-else-if="notification.type === 'error'">❌</span>
      <span v-else-if="notification.type === 'warning'">⚠️</span>
      <span v-else-if="notification.type === 'info'">ℹ️</span>
     </div>
     <div class="notification__content">
      <h4 class="notification__title">{{ notification.title }}</h4>
      <p v-if="notification.message" class="notification__message">
       {{ notification.message }}
      </p>
     </div>
     <button class="notification__close" @click.stop="removeNotification(notification.id)"
      aria-label="Cerrar notificación">
      ×
     </button>
    </div>
   </TransitionGroup>
  </div>
 </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '@/utils/notifications'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
 position: fixed;
 top: 90px;
 right: 20px;
 z-index: 9999;
 display: flex;
 flex-direction: column;
 gap: 12px;
 max-width: 400px;
 pointer-events: none;
}

.notification {
 display: flex;
 align-items: flex-start;
 gap: 12px;
 padding: 16px;
 border-radius: var(--border-radius-md);
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
 cursor: pointer;
 pointer-events: auto;
 border-left: 4px solid;
 backdrop-filter: blur(8px);
 transition: all var(--transition-normal);
}

.notification:hover {
 transform: translateX(-4px);
}

.notification--success {
 background: rgba(212, 237, 218, 0.95);
 border-left-color: #28a745;
 color: #155724;
}

.notification--error {
 background: rgba(248, 215, 218, 0.95);
 border-left-color: #dc3545;
 color: #721c24;
}

.notification--warning {
 background: rgba(255, 243, 205, 0.95);
 border-left-color: #ffc107;
 color: #856404;
}

.notification--info {
 background: rgba(209, 236, 241, 0.95);
 border-left-color: #17a2b8;
 color: #0c5460;
}

/* Dark theme */
:root[data-theme='dark'] .notification--success {
 background: rgba(40, 167, 69, 0.1);
 color: #28a745;
 border-left-color: #28a745;
}

:root[data-theme='dark'] .notification--error {
 background: rgba(220, 53, 69, 0.1);
 color: #dc3545;
 border-left-color: #dc3545;
}

:root[data-theme='dark'] .notification--warning {
 background: rgba(255, 193, 7, 0.1);
 color: #ffc107;
 border-left-color: #ffc107;
}

:root[data-theme='dark'] .notification--info {
 background: rgba(23, 162, 184, 0.1);
 color: #17a2b8;
 border-left-color: #17a2b8;
}

.notification__icon {
 font-size: 1.2rem;
 flex-shrink: 0;
 margin-top: 2px;
}

.notification__content {
 flex: 1;
 min-width: 0;
}

.notification__title {
 font-size: 0.9rem;
 font-weight: 600;
 margin: 0 0 4px 0;
 line-height: 1.3;
}

.notification__message {
 font-size: 0.8rem;
 margin: 0;
 line-height: 1.4;
 opacity: 0.8;
}

.notification__close {
 background: none;
 border: none;
 font-size: 1.2rem;
 cursor: pointer;
 color: inherit;
 opacity: 0.6;
 transition: opacity var(--transition-fast);
 padding: 0;
 width: 20px;
 height: 20px;
 display: flex;
 align-items: center;
 justify-content: center;
 border-radius: 50%;
 flex-shrink: 0;
}

.notification__close:hover {
 opacity: 1;
 background: rgba(0, 0, 0, 0.1);
}

/* Animations */
.notification-enter-active {
 transition: all 0.3s ease-out;
}

.notification-leave-active {
 transition: all 0.3s ease-in;
}

.notification-enter-from {
 transform: translateX(100%);
 opacity: 0;
}

.notification-leave-to {
 transform: translateX(100%);
 opacity: 0;
}

.notification-move {
 transition: transform 0.3s ease;
}

/* Mobile responsive */
@media (max-width: 768px) {
 .notification-container {
  top: 70px;
  left: 16px;
  right: 16px;
  max-width: none;
 }

 .notification {
  padding: 12px;
 }

 .notification__title {
  font-size: 0.85rem;
 }

 .notification__message {
  font-size: 0.75rem;
 }
}
</style>
