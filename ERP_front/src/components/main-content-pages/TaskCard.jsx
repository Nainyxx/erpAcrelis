import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaskById } from '../../services/api/api'; // ТОЛЬКО ИМПОРТ
import './TaskCard.css';

const TaskCard = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const chatContainerRef = useRef(null);
  
  // ДОБАВЛЕНО: Получение данных задачи
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [comment, setComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [commentsList, setCommentsList] = useState([
    {
      id: 1,
      userId: '123',
      userName: 'Иван Петров',
      userInitials: 'ИП',
      userColor: '#FF6B6B',
      text: 'Вчера согласовали API с заказчиком, можно приступать к реализации.',
      date: '15.12.2023',
      time: '14:30',
      replies: [
        {
          id: 101,
          userId: '456',
          userName: 'Алексей Иванов',
          userInitials: 'АИ',
          userColor: '#4ECDC4',
          text: 'Спасибо, приступаю.',
          date: '15.12.2023',
          time: '14:45'
        }
      ]
    },
    {
      id: 2,
      userId: '456',
      userName: 'Алексей Иванов',
      userInitials: 'АИ',
      userColor: '#4ECDC4',
      text: 'Сделал основную логику, осталось добавить валидацию.',
      date: '16.12.2023',
      time: '09:15'
    },
    {
      id: 3,
      userId: '789',
      userName: 'Елена Кузнецова',
      userInitials: 'ЕК',
      userColor: '#FFD166',
      text: 'Дизайн1макеты готовы, отправляю на согласование.',
      date: '16.12.2023',
      time: '11:45'
    },
    {
      id: 4,
      userId: '456',
      userName: 'Алексей Иванов',
      userInitials: 'АИ',
      userColor: '#4ECDC4',
      text: 'Добавил валидацию полей, нужно протестировать.',
      date: '17.12.2023',
      time: '10:20'
    },
    {
      id: 5,
      userId: '123',
      userName: 'Иван Петров',
      userInitials: 'ИП',
      userColor: '#FF6B6B',
      text: 'Замечания по дизайну исправлены, жду фидбэк.',
      date: '18.12.2023',
      time: '16:10'
    }
  ]);
  
  const [files, setFiles] = useState([
    { id: 1, name: 'ТЗ_задача3_финал.docx', size: '2.4 МБ' },
    { id: 2, name: 'Дизайн_макеты.pdf', size: '5.7 МБ' },
    { id: 3, name: 'API_documentation.zip', size: '1.2 МБ' },
    { id: 4, name: 'Тестовые_данные.xlsx', size: '0.8 МБ' }
  ]);
  
  const [startDate, setStartDate] = useState('15.12.2023');
  const [deadline, setDeadline] = useState('25.12.2023');
  const [status, setStatus] = useState('В работе');
  const [progress, setProgress] = useState(60);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [assignee, setAssignee] = useState({
    name: 'Иван Петров',
    initials: 'ИП',
    color: '#FF6B6B'
  });
  const [manager, setManager] = useState({
    name: 'Алексей Иванов',
    initials: 'АИ',
    color: '#4ECDC4'
  });
  
  const statusOptions = [
    { value: 'Новое', label: 'Новое', progress: 20 },
    { value: 'В работе', label: 'В работе', progress: 50 },
    { value: 'На проверке', label: 'На проверке', progress: 80 },
    { value: 'Выложено', label: 'Выложено', progress: 100 },
    { value: 'Отложено', label: 'Отложено', progress: 0 }
  ];
  
const getColorForName = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
  const index = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
  return colors[index];
};
// В useEffect после получения taskData:
// В useEffect после получения taskData:
useEffect(() => {
  const loadTask = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const taskData = await getTaskById(taskId, useMockData);
      setTask(taskData);
      
      // Описание в форму
      if (taskData.description) {
        setComment(taskData.description);
      }
      
      // Даты
      if (taskData.created) {
        const createdDate = new Date(taskData.created);
        const formattedStart = `${createdDate.getDate().toString().padStart(2, '0')}.${(createdDate.getMonth() + 1).toString().padStart(2, '0')}.${createdDate.getFullYear()}`;
        setStartDate(formattedStart);
      }
      
      if (taskData.deadline) {
        const deadlineDate = new Date(taskData.deadline);
        const formattedDeadline = `${deadlineDate.getDate().toString().padStart(2, '0')}.${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}.${deadlineDate.getFullYear()}`;
        setDeadline(formattedDeadline);
      }
      
      // Статус
      if (taskData.status_display) {
        setStatus(taskData.status_display);
        const progressMap = {
          'Новое': 20,
          'В работе': 60,
          'Завершено': 100,
          'Приостановлено': 40,
          'Черновик': 10
        };
        setProgress(progressMap[taskData.status_display] || 50);
      }
      
      // Исполнитель
      if (taskData.performer_name) {
        const initials = taskData.performer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setAssignee({
          name: taskData.performer_name,
          initials: initials,
          color: '#FF6B6B'
        });
      }
      
      // Руководитель
      if (taskData.director_name) {
        const initials = taskData.director_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setManager({
          name: taskData.director_name,
          initials: initials,
          color: '#4ECDC4'
        });
      }
      
      // КОММЕНТАРИИ из API в чат
      if (taskData.comments && taskData.comments.length > 0) {
        const formattedComments = taskData.comments.map(comment => {
          const commentDate = new Date(comment.created);
          return {
            id: comment.id,
            userId: `comment_${comment.id}`,
            userName: comment.author_name || 'Автор',
            userInitials: comment.author_name 
              ? comment.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '??',
            userColor: '#4ECDC4',
            text: comment.content,
            date: `${commentDate.getDate().toString().padStart(2, '0')}.${(commentDate.getMonth() + 1).toString().padStart(2, '0')}.${commentDate.getFullYear()}`,
            time: `${commentDate.getHours().toString().padStart(2, '0')}:${commentDate.getMinutes().toString().padStart(2, '0')}`,
            replies: []
          };
        });
        setCommentsList(formattedComments);
      } else {
        // Если нет комментариев - пустой массив
        setCommentsList([]);
      }
      
      // ФАЙЛЫ из API
      if (taskData.files && taskData.files.length > 0) {
        const formattedFiles = taskData.files.map(file => ({
          id: file.id,
          name: file.file ? file.file.split('/').pop() : 'Файл',
          size: formatFileSize(file.size) || 'Неизвестно'
        }));
        setFiles(formattedFiles);
      } else {
        // Если нет файлов - пустой массив
        setFiles([]);
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки задачи:', error);
      setError('Не удалось загрузить задачу');
    } finally {
      setLoading(false);
    }
  };
  
  loadTask();
}, [taskId, useMockData]);

// Добавьте функцию formatFileSize:
const formatFileSize = (bytes) => {
  if (!bytes) return 'Неизвестно';
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
};
  
  // Остальной код без изменений...
  // Скролл к низу чата при добавлении новых сообщений
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [commentsList]);
  
  // Группировка сообщений по дате
  const groupCommentsByDate = () => {
    const grouped = {};
    commentsList.forEach(comment => {
      if (!grouped[comment.date]) {
        grouped[comment.date] = [];
      }
      grouped[comment.date].push(comment);
    });
    return grouped;
  };
  
  const groupedComments = groupCommentsByDate();
  const sortedDates = Object.keys(groupedComments).sort((a, b) => {
    const dateA = a.split('.').reverse().join('-');
    const dateB = b.split('.').reverse().join('-');
    return new Date(dateA) - new Date(dateB);
  });
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const today = new Date().toLocaleDateString('ru-RU');
    const now = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const newCommentObj = {
      id: commentsList.length + 1,
      userId: 'current',
      userName: 'Текущий Пользователь',
      userInitials: 'ТП',
      userColor: '#06D6A0',
      text: comment,
      date: today,
      time: now,
      replies: []
    };
    
    setCommentsList([...commentsList, newCommentObj]);
    setComment('');
  };
  
  const handleChatCommentSubmit = (e) => {
    e.preventDefault();
    let textToSend = newComment.trim();
    
    if (!textToSend) return;
    
    const today = new Date().toLocaleDateString('ru-RU');
    const now = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (replyToCommentId) {
      // Добавляем ответ к существующему комментарию
      const updatedComments = commentsList.map(comment => {
        if (comment.id === replyToCommentId) {
          const newReply = {
            id: Date.now(),
            userId: 'current',
            userName: 'Текущий Пользователь',
            userInitials: 'ТП',
            userColor: '#06D6A0',
            text: textToSend,
            date: today,
            time: now
          };
          
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
      
      setCommentsList(updatedComments);
      setReplyToCommentId(null);
    } else {
      // Добавляем новый комментарий
      const newCommentObj = {
        id: commentsList.length + 1,
        userId: 'current',
        userName: 'Текущий Пользователь',
        userInitials: 'ТП',
        userColor: '#06D6A0',
        text: textToSend,
        date: today,
        time: now,
        replies: []
      };
      
      setCommentsList([...commentsList, newCommentObj]);
    }
    
    setNewComment('');
  };
  
  const handleReply = (commentId) => {
    if (replyToCommentId === commentId) {
      // Если уже отвечаем на этот комментарий, отменяем
      setReplyToCommentId(null);
      setNewComment('');
    } else {
      // Начинаем отвечать на новый комментарий
      setReplyToCommentId(commentId);
      setNewComment('');
    }
  };
  
  const handleStatusChange = (newStatus, newProgress) => {
    setStatus(newStatus);
    setProgress(newProgress);
    setShowStatusDropdown(false);
  };
  
  const handleFileDownload = (file) => {
    console.log('Скачивание файла:', file.name);
    alert(`Начинается скачивание файла: ${file.name}`);
  };
  
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const newFiles = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + ' МБ'
      }));
      
      setFiles([...newFiles, ...files]);
    }
  };
  
  const generateAvatar = (initials, color) => (
    <div className="taskcard-avatar" style={{ backgroundColor: color }}>
      {initials}
    </div>
  );

  // ДОБАВЛЕНО: Состояния загрузки
  if (loading) {
    return (
      <div className="taskcard-container">
        <div className="loading">Загрузка задачи...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="taskcard-container">
        <div className="error-message">
          {error}
          <button onClick={() => navigate('/my-tasks')} className="retry-btn">
            Вернуться к задачам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="taskcard-container">
      {/* Заголовок */}
      <div className="taskcard-header">
        <h1 className="taskcard-title">
          <span 
            className="mytasks-link" 
            onClick={() => navigate('/my-tasks')}
          >
            Мои задачи
          </span>
          {' — Задача '}
          <span className="task-number">{taskId || '3'}</span>
        </h1>
      </div>

      {/* Форма ввода комментария */}
      <div className="comment-form-container">
        <form onSubmit={handleCommentSubmit}>
          <textarea
            className="comment-input"
            placeholder="Начните ввод"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </form>
      </div>

      {/* Основное содержимое - 3 колонки */}
      <div className="taskcard-main-content">
        <div className="taskcard-grid">
          {/* Колонка 1: Чат */}
          <div className="column-section">
            <div className="column-rectangle chat-column">
              <h3 className="column-title">Чат</h3>
              
              {/* Список сообщений с скроллом */}
              <div className="chat-scroll-container" ref={chatContainerRef}>
                <div className="chat-container">
                  {sortedDates.map(date => (
                    <React.Fragment key={date}>
                      {/* Заголовок даты */}
                      <div className="chat-date-header">{date}</div>
                      
                      {/* Сообщения за эту дату */}
                      {groupedComments[date].map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            {generateAvatar(comment.userInitials, comment.userColor)}
                            <div className="comment-user-info">
                              <div className="comment-user-name">{comment.userName}</div>
                              <div className="comment-time">{comment.time}</div>
                            </div>
                          </div>
                          <div className="comment-text">{comment.text}</div>
                          
                          {/* Ответы на комментарий */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-container">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="reply-item">
                                  <div className="reply-header">
                                    {generateAvatar(reply.userInitials, reply.userColor)}
                                    <div className="reply-user-info">
                                      <div className="reply-user-name">{reply.userName}</div>
                                      <div className="reply-time">{reply.time}</div>
                                    </div>
                                  </div>
                                  <div className="reply-text">{reply.text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Кнопка "Ответить" */}
                          <button 
                            className={`reply-btn ${replyToCommentId === comment.id ? 'active' : ''}`}
                            onClick={() => handleReply(comment.id)}
                          >
                            {replyToCommentId === comment.id ? 'Отменить ответ' : 'Ответить'}
                          </button>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              {/* Форма для нового комментария */}
              <div className="new-comment-section">
                <form className="new-comment-form" onSubmit={handleChatCommentSubmit}>
                  <textarea
                    className="new-comment-input"
                    placeholder={replyToCommentId ? "Введите ответ..." : "Добавить комментарий"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <div className="comment-buttons">
                    {replyToCommentId && (
                      <button 
                        type="button"
                        className="cancel-reply-btn"
                        onClick={() => setReplyToCommentId(null)}
                      >
                        Отменить
                      </button>
                    )}
                    <button type="submit" className="send-comment-btn">
                      {replyToCommentId ? 'Отправить ответ' : 'Отправить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Колонка 2: Файлы */}
          <div className="column-section">
            <div className="column-rectangle files-column">
              <div className="files-header">
                <h3 className="column-title">Файлы проекта</h3>
                <label className="upload-file-btn">
                  + Загрузить файлы
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="files-list">
                {files.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{file.size}</span>
                    </div>
                    <button 
                      className="file-download" 
                      onClick={() => handleFileDownload(file)}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
              <div className="files-count">
                Всего файлов: {files.length}
              </div>
            </div>
          </div>

          {/* Колонка 3: 3 отдельных прямоугольника с информацией */}
          <div className="column-section">
            {/* Прямоугольник 1: Даты */}
            <div className="info-rectangle">
              <div className="date-item">
                <div className="date-row">
                  <span className="date-label">Начало:</span>
                </div>
                <div className="date-row">
                  <span className="date-value">{startDate}</span>
                </div>
                <div className="date-row">
                  <span className="date-label">Дедлайн:</span>
                </div>
                <div className="date-row">
                  <span className="date-value">{deadline}</span>
                </div>
              </div>
            </div>

            {/* Прямоугольник 2: Статус */}
            <div className="info-rectangle">
              <div className="status-header">
                <h3 className="column-title">Статус</h3>
                <div className="status-dropdown-wrapper">
                  <button 
                    className="change-status-btn"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  >
                    Изменить статус
                  </button>
                  
                  {showStatusDropdown && (
                    <div className="status-dropdown">
                      {statusOptions.map(option => (
                        <div 
                          key={option.value}
                          className="status-option"
                          onClick={() => handleStatusChange(option.value, option.progress)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="status-info">
                <div className="status-row">
                  <span className="current-status">{status}</span>
                </div>
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-label">{progress}%</div>
                </div>
              </div>
            </div>

            {/* Прямоугольник 3: Исполнитель и руководитель */}
            <div className="info-rectangle">
              
              {/* Исполнитель */}
              <div className="person-item">
                <div className="person-role">Исполнитель</div>
                <div className="person-info">
                  {generateAvatar(assignee.initials, assignee.color)}
                  <span className="person-name">{assignee.name}</span>
                </div>
              </div>
              
              {/* Руководитель */}
              <div className="person-item">
                <div className="person-role">Руководитель</div>
                <div className="person-info">
                  {generateAvatar(manager.initials, manager.color)}
                  <span className="person-name">{manager.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;