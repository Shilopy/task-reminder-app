# 🚀 Деплой SmartTasks Pro на GitHub Pages

## Шаг 1 — Создай репозиторий

1. Зайди на https://github.com/new
2. **Repository name:** `task-reminder-app` ← ВАЖНО: именно так, иначе пути сломаются
3. Visibility: **Public**
4. Нажми **Create repository**

## Шаг 2 — Загрузи файлы

Способ А — через браузер (проще):
1. Открой репозиторий → нажми **Add file → Upload files**
2. Загрузи все эти файлы:
   - `index.html`
   - `sw.js`
   - `manifest.json`
   - `widget.html`
   - `.nojekyll` (пустой файл, нужен чтобы GitHub не ломал пути)
3. Нажми **Commit changes**

Способ Б — через git:
```bash
git clone https://github.com/ТВО_ИМЯ/task-reminder-app
cd task-reminder-app
# скопируй все файлы сюда
git add .
git commit -m "Initial deploy"
git push
```

## Шаг 3 — Включи GitHub Pages

1. Открой репозиторий → вкладка **Settings**
2. Слева найди **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / root
5. Нажми **Save**

Через 1-2 минуты сайт будет доступен по адресу:
```
https://ТВО_ИМЯ.github.io/task-reminder-app/
```

## Шаг 4 — Открой на Android и установи как PWA

1. Открой ссылку в **Chrome на Android**
2. Нажми меню (⋮) → **«Добавить на главный экран»**
3. Приложение установится как PWA
4. При первом открытии — **разреши уведомления** в диалоге

## ✅ Что работает после деплоя

| Функция | Статус |
|---|---|
| Уведомления когда вкладка открыта | ✅ |
| Уведомления когда вкладка свёрнута | ✅ (через SW) |
| Уведомления когда браузер свёрнут | ✅ (через SW + PWA) |
| Уведомления когда приложение закрыто | ⚠️ Только если установлено как PWA |
| Работа офлайн | ✅ (кэш) |

## ⚠️ Важно: имя репозитория

Если хочешь другое имя репозитория (не `task-reminder-app`),
нужно поменять пути в `index.html`, `sw.js` и `manifest.json`:
найди все вхождения `/task-reminder-app/` и замени на `/НОВОЕ_ИМЯ/`.
