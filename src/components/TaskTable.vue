<template>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Название канала</th>
        <th>Ссылка на канал</th>
        <th>Имя администратора</th>
        <th>Имя рекламодателя</th>
        <th>Юзер рекламодателя</th>
        <th>Чат ID</th>
        <th>Юзер бота рекламодателя</th>
        <th>Ссылка на пост</th>
        <th>Скриншот</th>
        <th>Отправлено</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="task in tasks" :key="task.id">
        <td>{{ task.id }}</td>
        <td>{{ task.channel_name }}</td>
        <td>
          <a :href="task.channel_link" target="_blank">{{ task.channel_link }}</a>
        </td>
        <td>{{ task.admin_name }}</td>
        <td>{{ task.advertiser_name }}</td>
        <td>{{ task.advertiser_user }}</td>
        <td>{{ task.chat_id }}</td>
        <td>{{ task.advertiser_bot_user }}</td>
        <td>
          <a :href="task.post_link" target="_blank">{{ task.post_link }}</a>
        </td>
        <td class="screenshot-cell">
          <img
            v-if="task.screenshot_link"
            :src="task.screenshot_link"
            alt="скриншот"
            class="screenshot-thumb"
            @click="previewImage(task.screenshot_link)"
          />
          <span v-else>–</span>
        </td>
        <td>
          <select
            :value="task.sent"
            @change="onStatusChange(task, $event.target.value)"
          >
            <option value="false">Не отправлено</option>
            <option value="true">Отправлено</option>
          </select>
        </td>
        <td class="actions-cell">
          <button @click="edit(task)">✏️</button>
          <button @click="del(task.id)">🗑️</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="pagination">
    <button @click="$emit('page-change', page - 1)" :disabled="page <= 1">‹</button>
    <span>{{ page }}</span>
    <button @click="$emit('page-change', page + 1)">›</button>
  </div>
</template>

<script setup>
const props = defineProps({
  tasks: Array,
  page: Number
});
const emit = defineEmits(['edit','remove','toggle','page-change']);

function edit(task)   { emit('edit', task); }
function del(id)      { emit('remove', id); }
function onStatusChange(task, value) {
  emit('toggle', { ...task, sent: value === 'true' });
}

// Открывает картинку в новой вкладке
function previewImage(url) {
  window.open(url, '_blank');
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-light);
  overflow: hidden;
}
thead th {
  background: var(--header-purple);
  color: var(--text-main);
  padding: 0.75rem;
  font-size: var(--font-size-sm);
  text-transform: uppercase;
}
tbody tr:nth-child(odd)   { background: rgba(255,255,255,0.03); }
tbody tr:hover            { background: rgba(255,255,255,0.1); }
td {
  padding: 0.75rem;
  font-size: var(--font-size-sm);
  text-align: center;
  vertical-align: middle;
}
a {
  color: var(--text-main);
  text-decoration: underline;
  word-break: break-all;
}

/* Ячейка со скриншотом */
.screenshot-cell {
  width: 100px;
}
.screenshot-thumb {
  max-height: 50px;
  cursor: pointer;
  border-radius: var(--radius);
  box-shadow: var(--shadow-light);
  transition: transform var(--transition);
}
.screenshot-thumb:hover {
  transform: scale(1.1);
}

/* Селект статуса */
select {
  font-size: var(--font-size-sm);
  padding: 0.3rem;
  border-radius: var(--radius);
  border: 1px solid #333;
  background: var(--surface-bg);
  color: var(--text-main);
  transition: border-color var(--transition);
}
select:focus {
  outline: none;
  border-color: var(--header-purple);
}

/* Кнопки */
.actions-cell button {
  background: var(--button-gradient);
  border: none;
  border-radius: var(--radius);
  padding: 0.3rem 0.5rem;
  font-size: var(--font-size-sm);
  margin: 0 0.2rem;
  cursor: pointer;
  transition: transform var(--transition);
}
.actions-cell button:hover {
  transform: translateY(-2px);
}

/* Пагинация */
.pagination {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.pagination button {
  background: var(--button-gradient);
  border: none;
  border-radius: var(--radius);
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: transform var(--transition);
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}
.pagination button:hover:not(:disabled) {
  transform: translateY(-2px);
}
</style>
