const express = require('express');
const path = require('path');
const app = express();

// Обслуживаем статические файлы
app.use(express.static(path.join(__dirname, 'dist')));

// Для всех остальных маршрутов отдаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});