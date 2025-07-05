<template>
  <div class="modal">
    <div class="modal-content">
      <h2>{{ task?.id ? 'Редактировать' : 'Добавить' }}</h2>
      <form @submit.prevent="onSubmit">
        <div class="form-row" v-for="field in fields" :key="field.model">
          <label :for="field.model">{{ field.label }}:</label>
          <input
            :id="field.model"
            v-model="form[field.model]"
            :type="field.type || 'text'"
          />
        </div>

        <div class="form-row">
          <label for="sent">Статус отправки:</label>
          <select id="sent" v-model="form.sent">
            <option :value="false">Не отправлено</option>
            <option :value="true">Отправлено</option>
          </select>
        </div>

        <div class="actions">
          <button type="submit" @click.prevent="onSubmit">Сохранить</button>
          <button type="button" @click="$emit('close')">Отмена</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({ task: Object });
const emit  = defineEmits(['save','close']);

const form = reactive({
  id: props.task?.id || null,
  channel_name: props.task?.channel_name || '',
  channel_link: props.task?.channel_link || '',
  admin_name: props.task?.admin_name || '',
  advertiser_name: props.task?.advertiser_name || '',
  advertiser_user: props.task?.advertiser_user || '',
  chat_id: props.task?.chat_id || '',
  advertiser_bot_user: props.task?.advertiser_bot_user || '',
  post_link: props.task?.post_link || '',
  screenshot_link: props.task?.screenshot_link || '',
  sent: props.task?.sent || false
});

const fields = [
  { model: 'channel_name', label: 'Название канала' },
  { model: 'channel_link', label: 'Ссылка на канал', type: 'url' },
  { model: 'admin_name', label: 'Имя администратора' },
  { model: 'advertiser_name', label: 'Имя рекламодателя' },
  { model: 'advertiser_user', label: 'Юзер рекламодателя' },
  { model: 'chat_id', label: 'Чат ID' },
  { model: 'advertiser_bot_user', label: 'Юзер бота рекламодателя' },
  { model: 'post_link', label: 'Ссылка на пост', type: 'url' },
  { model: 'screenshot_link', label: 'Ссылка на скриншот', type: 'url' }
];

function onSubmit() {
  emit('save', { ...form });
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}
.modal-content {
  background: var(--card-bg);
  padding: 1.5rem 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-light);
  width: 90%;
  max-width: 700px;
}
.form-row {
  display: grid;
  /* первая колонка авто по содержимому, вторая — гибкая */
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
  row-gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}
.form-row label {
  justify-self: start;   /* метки слева */
  text-align: left;      /* текст метки слева */
  font-weight: 500;
}
.form-row input,
.form-row select {
  width: 100%;
  font-size: var(--font-size-sm);
  padding: 0.4rem;
  border-radius: var(--radius);
  border: 1px solid #333;
  background: var(--surface-bg);
  color: var(--text-main);
  transition: border-color var(--transition);
}
.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: var(--header-purple);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.actions button {
  background: var(--button-gradient);
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: background var(--transition), transform var(--transition);
}
.actions button:hover {
  transform: translateY(-2px);
  background: var(--header-purple);
}
</style>
