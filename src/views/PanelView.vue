<template>
  <div class="container">
    <h1>Админ-панель</h1>
    <div class="controls">
      <select v-model="filter" @change="fetchTasks">
        <option value="">Все</option>
        <option value="pending">Не отправленные</option>
        <option value="sent">Отправленные</option>
      </select>
      <button @click="openForm()">Добавить задачу</button>
      <select v-model="advertiserFilter" @change="changeAdvertiser">
        <option value="">Все рекламодатели</option>
        <option v-for="username in advertisers" :key="username" :value="username">
          {{ username }}
        </option>
      </select>
      <button :disabled="!advertiserFilter" @click="sendToFilteredAdvertiser">
        Отправить выбранному рекламодателю
      </button>
    </div>
    <TaskTable
      :tasks="tasks"
      :page="page"
      @edit="openForm"
      @remove="removeTask"
      @toggle="toggleSent"
      @page-change="changePage"
    />
    <TaskForm
      v-if="showForm"
      :task="current"
      @save="saveTask"
      @close="showForm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';
import api from '../services/api';
import axios from 'axios';
import TaskTable from '../components/TaskTable.vue';
import TaskForm from '../components/TaskForm.vue';

const tasks = ref([]);
const filter = ref('');
const page = ref(1);
const showForm = ref(false);
const current = ref(null);
const advertisers = ref([]);
const advertiserFilter = ref('');

// SOCKET.IO — автообновление
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
socket.on('task_change', () => {
  fetchTasks();
  fetchAdvertisers();
});

// Получаем задачи с учётом фильтра по рекламодателю и статусу
async function fetchTasks() {
  try {
    const res = await api.get('/tasks', {
      params: {
        status: filter.value,
        page: page.value,
        advertiser: advertiserFilter.value || undefined
      }
    });
    tasks.value = res.data;
  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
    alert('Ошибка при загрузке задач');
  }
}

// Список рекламодателей (для фильтра)
async function fetchAdvertisers() {
  try {
    const res = await api.get('/advertisers');
    advertisers.value = res.data;
  } catch (error) {
    console.error('Ошибка загрузки рекламодателей:', error);
  }
}

function changePage(p) {
  page.value = p;
  fetchTasks();
}

function openForm(task = null) {
  current.value = task;
  showForm.value = true;
}

async function saveTask(task) {
  try {
    if (task.id) await api.put(`/tasks/${task.id}`, task);
    else await api.post('/tasks', task);
    showForm.value = false;
    await Promise.all([fetchTasks(), fetchAdvertisers()]);
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Ошибка при сохранении задачи');
  }
}

async function removeTask(id) {
  if (!confirm('Удалить задачу?')) return;
  try {
    await api.delete(`/tasks/${id}`);
    await Promise.all([fetchTasks(), fetchAdvertisers()]);
  } catch (error) {
    console.error('Ошибка удаления:', error);
    alert('Ошибка при удалении задачи');
  }
}

// Не меняет sent! Просто для управления вручную
async function toggleSent(updated) {
  try {
    await api.put(`/tasks/${updated.id}`, { sent: updated.sent });
    await Promise.all([fetchTasks(), fetchAdvertisers()]);
  } catch (error) {
    console.error('Ошибка изменения статуса:', error);
  }
}

function changeAdvertiser() {
  page.value = 1;
  fetchTasks();
}

// ОТПРАВКА выбранному в фильтре рекламодателю через внешний webhook n8n
async function sendToFilteredAdvertiser() {
  try {
    const advertiser = advertiserFilter.value;
    if (!advertiser) return;
    await axios.post(
      'https://primary-production-5e704.up.railway.app/webhook/49fbf593-e181-47f4-a09e-17330defa840',
      { advertiser_username: advertiser }
    );
    alert(`Успешно отправлено для: ${advertiser}`);
    await Promise.all([fetchTasks(), fetchAdvertisers()]);
  } catch (error) {
    console.error('Ошибка рассылки:', error);
    alert('Ошибка при рассылке');
  }
}

onMounted(async () => {
  await Promise.all([fetchTasks(), fetchAdvertisers()]);
});
</script>

<style scoped>
/* Ваши стили без изменений */
.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
select, button {
  font-size: var(--font-size-sm);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid #333;
  background: var(--surface-bg);
  color: var(--text-main);
  transition: border-color var(--transition), background var(--transition);
}
button {
  background: var(--button-gradient);
  box-shadow: var(--shadow-light);
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--header-purple);
}
</style>
