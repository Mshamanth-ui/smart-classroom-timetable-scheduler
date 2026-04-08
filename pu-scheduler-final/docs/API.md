# 🌐 API Documentation — PU Smart Scheduler

Base URL: `http://localhost:8080/api`

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth

### POST /auth/login
```json
Request:  { "username": "admin", "password": "password123" }
Response: { "success": true, "data": { "token": "eyJ...", "id": 1, "username": "admin", "role": "ADMIN", ... }}
```

---

## Slots

### GET /slots
Returns all slots with teacher and room names resolved.

### POST /slots  (ADMIN only)
```json
{ "subject":"Mathematics","cls":"10-A","teacherId":1,"roomId":1,"day":"Mon","timeSlot":"8:00 AM","color":"#3b82f6","recurring":false }
```

### PUT /slots/{id}/move  (ADMIN only)
```
Query params: day=Tue&timeSlot=9:00%20AM
```

### POST /slots/{id}/copy  (ADMIN only)
```
Query params: day=Wed&timeSlot=10:00%20AM
```

---

## Rooms

### POST /rooms  (ADMIN only)
```json
{ "name":"Room 201","capacity":45,"type":"CLASSROOM","status":"ACTIVE","notes":"","equipment":["Projector","AC"] }
```

### Response includes computed fields:
```json
{ "usedSlots": 3, "totalSlots": 45, "utilizationPct": 7 }
```

---

## Teachers

### POST /teachers  (ADMIN only)
```json
{ "name":"Dr. Singh","subject":"Physics","email":"singh@presidency.edu","phone":"9876543217","maxHours":20,
  "availability":{"Mon":true,"Tue":true,"Wed":false,"Thu":true,"Fri":true,"Sat":false} }
```

### Response includes:
```json
{ "assignedHours": 5 }
```

---

## Conflicts

### GET /conflicts
Returns list of all detected scheduling conflicts.
```json
[{ "type":"room","title":"Room Double-Booked: Room 101","description":"...","slotIds":[1,3] }]
```
Conflict types: `room | teacher | class | availability | workload`

---

## Settings

### GET /settings
```json
{ "saturday_enabled": "false", "custom_times": "[\"8:00 AM\",...\"4:00 PM\"]" }
```

### PUT /settings/{key}  (ADMIN only)
```json
{ "value": "true" }
```

---

## Error Responses
All errors follow:
```json
{ "success": false, "message": "Error description", "data": null }
```
HTTP status codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 500 Internal Server Error
