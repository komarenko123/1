import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool, Client } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Static files for production ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) =>
      res.sendFile(path.join(distPath, 'index.html'))
    );
  }
}

// --- CRUD API ---

app.get('/api/tasks', async (req, res) => {
  try {
    const { status, page = 1, advertiser } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    let sql = `
      SELECT
        id,
        channel_name,
        channel_url             AS channel_link,
        admin_username          AS admin_name,
        advertiser_name,
        advertiser_username     AS advertiser_user,
        chat_id,
        advertiser_bot_username AS advertiser_bot_user,
        post_url                AS post_link,
        screenshot_url          AS screenshot_link,
        sent
      FROM ads_tasks_v2
      WHERE 1=1
    `;
    const params = [];
    if (status === 'sent') {
      params.push(true);
      sql += ` AND sent = $${params.length}`;
    } else if (status === 'pending') {
      params.push(false);
      sql += ` AND sent = $${params.length}`;
    }
    if (advertiser) {
      params.push(advertiser);
      sql += ` AND advertiser_username = $${params.length}`;
    }
    sql += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('[GET /api/tasks] error:', error);
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      channel_name, channel_link, admin_name,
      advertiser_name, advertiser_user, chat_id,
      advertiser_bot_user, post_link,
      screenshot_link, sent
    } = req.body;

    const transformChat = raw => {
      if (raw === '' || raw == null) return null;
      const n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    };

    const sql = `
      INSERT INTO ads_tasks_v2 (
        channel_name, channel_url, admin_username,
        advertiser_name, advertiser_username, chat_id,
        advertiser_bot_username, post_url,
        screenshot_url, sent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (channel_url) DO UPDATE
        SET chat_id = EXCLUDED.chat_id,
            advertiser_bot_username = EXCLUDED.advertiser_bot_username,
            sent = EXCLUDED.sent
      RETURNING *;
    `;
    const params = [
      channel_name,
      channel_link,
      admin_name,
      advertiser_name,
      advertiser_user,
      transformChat(chat_id),
      advertiser_bot_user,
      post_link,
      screenshot_link,
      sent === true || sent === 'true'
    ];
    const { rows } = await pool.query(sql, params);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[POST /api/tasks] error:', error);
    res.status(500).json({ error: 'Ошибка при создании задачи' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID задачи' });
    }

    const map = {
      channel_name: 'channel_name',
      channel_link: 'channel_url',
      admin_name: 'admin_username',
      advertiser_name: 'advertiser_name',
      advertiser_user: 'advertiser_username',
      chat_id: 'chat_id',
      advertiser_bot_user: 'advertiser_bot_username',
      post_link: 'post_url',
      screenshot_link: 'screenshot_url',
      sent: 'sent'
    };

    const entries = Object.entries(req.body).filter(([k]) => map[k]);
    if (!entries.length) return res.status(400).json({ error: 'Нет полей для обновления' });

    const sets = [];
    const params = [];
    entries.forEach(([key, raw], i) => {
      let val = raw;
      const col = map[key];
      if (col === 'chat_id') {
        if (raw === '' || raw == null) val = null;
        else {
          const n = parseInt(raw, 10);
          val = isNaN(n) ? null : n;
        }
      }
      if (col === 'sent') val = raw === true || raw === 'true';
      sets.push(`${col} = $${i+1}`);
      params.push(val);
    });
    params.push(id);

    const sql = `
      UPDATE ads_tasks_v2
      SET ${sets.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;
    const { rows } = await pool.query(sql, params);
    res.json(rows[0]);
  } catch (error) {
    console.error('[PUT /api/tasks/:id] error:', error);
    res.status(500).json({
      error: 'Ошибка при обновлении задачи',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ads_tasks_v2 WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.error('[DELETE /api/tasks/:id] error:', error);
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
});

// --- Возвращает только тех, у кого есть неотправленные задачи ---
app.get('/api/advertisers', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT advertiser_username
      FROM ads_tasks_v2
      WHERE sent = false
      ORDER BY advertiser_username
    `);
    res.json(rows.map(r => r.advertiser_username));
  } catch (error) {
    console.error('[GET /api/advertisers] error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка рекламодателей' });
  }
});

// --- WebSocket уведомления (автообновление фронта) ---
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

(async () => {
  try {
    const listener = new Client({ connectionString: process.env.DATABASE_URL });
    await listener.connect();
    await listener.query('LISTEN tasks_channel');
    listener.on('notification', msg => {
      // Просто пересылаем уведомление всем клиентам
      io.emit('task_change', JSON.parse(msg.payload));
    });
    listener.on('error', err => {
      console.error('Database listener error:', err);
    });
  } catch (error) {
    console.error('Failed to setup database listener:', error);
  }
})();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
