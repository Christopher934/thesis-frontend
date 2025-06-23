# Sistema de Notificaciones - RSUD Anugerah Hospital Management System

## Descripción General

Sistema integral de notificaciones que soporta notificaciones web en tiempo real y notificaciones vía Telegram Bot. El sistema maneja varios tipos de notificaciones incluyendo recordatorios de turnos, confirmaciones de intercambio de turnos, aprobaciones de licencias, actividades diarias, alertas de tardanza y adición de nuevos turnos.

## Componentes Implementados

### 1. **Base de Datos (Prisma Schema)**

- **Modelo `Notifikasi`**: Almacena todas las notificaciones
- **Enums**: `JenisNotifikasi` y `StatusNotifikasi`
- **Campo `telegramChatId`** agregado al modelo User para integración con Telegram

### 2. **Servicios Backend**

#### a) **NotifikasiService**

- CRUD completo para notificaciones
- Métodos helper para tipos específicos de notificación
- Integración con TelegramService para envío de notificaciones

#### b) **TelegramService**

- Envío de mensajes vía Telegram Bot API
- Formateo de mensajes con emojis
- Envío masivo de notificaciones
- Manejo de rate limiting

#### c) **ScheduledTasksService** (CRON Jobs)

- **Recordatorios de turno** (cada 15 minutos): Notifica turnos que empiezan en 1 hora
- **Verificación de tardanzas** (8:00 AM diario): Detecta asistencias tardías
- **Resumen diario** (6:00 AM diario): Envía resumen de turnos del día

#### d) **NotificationGateway** (WebSocket)

- Notificaciones en tiempo real vía Socket.IO
- Autenticación JWT para conexiones WebSocket
- Manejo de salas de notificaciones por usuario
- Eventos: `newNotification`, `unreadCount`, `markAsRead`

#### e) **NotificationIntegrationService**

- Servicio de integración para conectar el sistema de notificaciones con otros servicios
- Métodos helper para envío simplificado de notificaciones

### 3. **API Endpoints**

```typescript
GET    /notifikasi              // Obtener notificaciones del usuario
GET    /notifikasi/unread-count // Contador de notificaciones no leídas
PUT    /notifikasi/:id/read     // Marcar notificación como leída
PUT    /notifikasi/mark-read    // Marcar múltiples como leídas
POST   /notifikasi             // Crear nueva notificación
DELETE /notifikasi/:id         // Eliminar notificación

// Endpoints de prueba
POST   /notifikasi/test/shift-reminder
POST   /notifikasi/test/new-shift
```

### 4. **WebSocket Events**

```typescript
// Eventos del cliente
'joinNotificationRoom'; // Unirse a sala de notificaciones
'markAsRead'; // Marcar notificación como leída
'getNotifications'; // Obtener notificaciones

// Eventos del servidor
'newNotification'; // Nueva notificación
'unreadCount'; // Contador actualizado
'notifications'; // Lista de notificaciones
'error'; // Errores
```

## Configuración Requerida

### Variables de Entorno (.env)

```bash
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/rsud_anugerah_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:3000"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-telegram-bot-token-here"

# Entorno
NODE_ENV="development"
```

### Dependencias Instaladas

```json
{
  "@nestjs/schedule": "^4.x.x",
  "@nestjs/websockets": "^10.x.x",
  "socket.io": "^4.x.x",
  "axios": "^1.x.x"
}
```

## Uso del Sistema

### 1. **Integración en otros servicios**

```typescript
// En ShiftService, AbsensiService, etc.
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';

constructor(
  private notificationService: NotificationIntegrationService
) {}

// Enviar notificación cuando se crea un nuevo turno
async createShift(createShiftDto) {
  const shift = await this.prisma.shift.create({...});

  // Notificar al usuario
  await this.notificationService.notifyNewShift(shift.userId, {
    id: shift.id,
    tanggal: shift.tanggal,
    jammulai: shift.jammulai,
    jamselesai: shift.jamselesai,
    lokasishift: shift.lokasishift
  });

  return shift;
}
```

### 2. **Conexión WebSocket desde Frontend**

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001/notifications', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

// Escuchar notificaciones nuevas
socket.on('newNotification', (notification) => {
  console.log('Nueva notificación:', notification);
  // Actualizar UI
});

// Escuchar contador de no leídas
socket.on('unreadCount', (count) => {
  console.log('Notificaciones no leídas:', count);
  // Actualizar badge de notificaciones
});

// Unirse a sala de notificaciones
socket.emit('joinNotificationRoom', { userId: currentUser.id });
```

### 3. **Configuración del Bot de Telegram**

1. Crear bot con @BotFather en Telegram
2. Obtener token del bot
3. Configurar webhook (opcional) o usar polling
4. Los usuarios deben obtener su `chatId` y guardarlo en su perfil

```bash
# Para obtener chatId, el usuario envía cualquier mensaje al bot
# El bot responde con: "Tu Chat ID es: 123456789"
# Este ID se guarda en el campo telegramChatId del usuario
```

## Tipos de Notificación

```typescript
enum JenisNotifikasi {
  REMINDER_SHIFT           // Recordatorio de turno (1 hora antes)
  KONFIRMASI_TUKAR_SHIFT   // Confirmación de intercambio de turno
  PERSETUJUAN_CUTI         // Aprobación de licencia
  KEGIATAN_HARIAN          // Resumen de actividades diarias
  PERINGATAN_TERLAMBAT     // Alerta de tardanza
  SHIFT_BARU               // Nuevo turno asignado
  SISTEM_INFO              // Información del sistema
  PENGUMUMAN               // Anuncios generales
}
```

## Tareas Programadas (CRON)

```typescript
// Recordatorios de turno - cada 15 minutos
@Cron('*/15 * * * *')
async sendShiftReminders() { ... }

// Verificación de tardanzas - 8:00 AM diario
@Cron('0 8 * * *')
async checkLateAttendance() { ... }

// Resumen diario - 6:00 AM diario
@Cron('0 6 * * *')
async sendDailyActivitySummary() { ... }
```

## Estado del Sistema

✅ **Completado:**

- Schema de base de datos y migraciones
- Servicios backend completos
- API REST endpoints
- WebSocket gateway para tiempo real
- Integración con Telegram Bot
- Tareas programadas (CRON jobs)
- Servicio de integración
- Documentación completa

🔄 **Pendiente (Frontend):**

- Componente de campana de notificaciones
- Lista de notificaciones en UI
- Integración WebSocket en frontend
- Configuración de perfil para Telegram
- Dashboard de notificaciones

🔧 **Configuración Pendiente:**

- Setup del bot de Telegram en producción
- Configuración de webhooks de Telegram
- Testing end-to-end del sistema completo

## Archivos Principales

```
backend/src/notifikasi/
├── notifikasi.service.ts              # Servicio principal
├── notifikasi.controller.ts           # Controlador REST API
├── notifikasi.module.ts               # Módulo NestJS
├── telegram.service.ts                # Servicio de Telegram
├── scheduled-tasks.service.ts         # Tareas CRON
├── notification.gateway.ts            # WebSocket Gateway
└── notification-integration.service.ts # Servicio de integración
```

## Testing

```bash
# Probar recordatorio de turno
curl -X POST http://localhost:3001/notifikasi/test/shift-reminder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Probar nuevo turno
curl -X POST http://localhost:3001/notifikasi/test/new-shift \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

Este sistema de notificaciones proporciona una base sólida y escalable para el manejo de todas las notificaciones en el sistema de gestión hospitalaria RSUD Anugerah.
