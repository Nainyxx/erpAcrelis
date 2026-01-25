import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaskById, updateTask, uploadFileToTask, addCommentToTask } from '../../services/api/api';
import './TaskCard.css';

const TaskCard = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const patchTimeoutRef = useRef(null);
  
  // Данные задачи
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для полей
  const [comment, setComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [files, setFiles] = useState([]);
  
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [assignee, setAssignee] = useState({
    name: '',
    initials: '',
    color: '#FF6B6B'
  });
  const [manager, setManager] = useState({
    name: '',
    initials: '',
    color: '#4ECDC4'
  });
  
  const statusOptions = [
    { value: 'new', label: 'Новое', progress: 20, apiValue: 'new' },
    { value: 'active', label: 'В работе', progress: 60, apiValue: 'active' },
    { value: 'paused', label: 'Ожидает', progress: 0, apiValue: 'paused' },
    { value: 'completed', label: 'Завершено', progress: 100, apiValue: 'completed' },
    { value: 'draft', label: 'Черновик', progress: 10, apiValue: 'draft' }
  ];

  // PATCH запрос для описания
  const patchDescription = async (descriptionText) => {
    if (!taskId || !task) return;
    
    clearTimeout(patchTimeoutRef.current);
    
    patchTimeoutRef.current = setTimeout(async () => {
      try {
        const updateData = { description: descriptionText };
        console.log(`🔄 PATCH описание:`, updateData);
        
        const updatedTask = await updateTask(taskId, updateData, useMockData);
        console.log('✅ Описание обновлено:', updatedTask);
        setTask(updatedTask);
        
      } catch (error) {
        console.error('❌ Ошибка обновления описания:', error);
      }
    }, 1000);
  };

  // PATCH запрос для дедлайна
  const patchDeadline = async (deadlineText) => {
    if (!taskId || !task) return;
    
    clearTimeout(patchTimeoutRef.current);
    
    patchTimeoutRef.current = setTimeout(async () => {
      try {
        // Преобразуем dd.mm.yyyy в формат API
        let deadlineForAPI = deadlineText;
        if (deadlineText.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = deadlineText.split('.');
          deadlineForAPI = `${year}-${month}-${day}T00:00:00+03:00`;
        }
        
        const updateData = { deadline: deadlineForAPI };
        console.log(`🔄 PATCH дедлайн:`, updateData);
        
        const updatedTask = await updateTask(taskId, updateData, useMockData);
        console.log('✅ Дедлайн обновлен:', updatedTask);
        setTask(updatedTask);
        
      } catch (error) {
        console.error('❌ Ошибка обновления дедлайна:', error);
      }
    }, 1000);
  };

  // PATCH запрос для статуса (сразу, без дебаунса)
  const patchStatus = async (statusApiValue, statusLabel, newProgress) => {
    try {
      const updateData = { status: statusApiValue };
      console.log(`🔄 PATCH статус:`, updateData);
      
      const updatedTask = await updateTask(taskId, updateData, useMockData);
      console.log('✅ Статус обновлен:', updatedTask);
      
      setTask(updatedTask);
      setStatus(statusLabel);
      setProgress(newProgress);
      
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
    }
  };

  // POST запрос для комментария в чат
  const postChatComment = async (commentText) => {
    if (!commentText.trim() || !task) return;
    
    try {
      const commentData = { content: commentText };
      console.log(`💬 POST комментарий:`, commentData);
      
      const newCommentObj = await addCommentToTask(task.id, commentData, useMockData);
      console.log('✅ Комментарий добавлен:', newCommentObj);
      
      // Форматируем для отображения
      const commentDate = new Date(newCommentObj.created);
      const formattedComment = {
        id: newCommentObj.id,
        userId: `comment_${newCommentObj.id}`,
        userName: newCommentObj.author_name || 'Текущий Пользователь',
        userInitials: newCommentObj.author_name 
          ? newCommentObj.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : 'ТП',
        userColor: '#06D6A0',
        text: newCommentObj.content,
        date: `${commentDate.getDate().toString().padStart(2, '0')}.${(commentDate.getMonth() + 1).toString().padStart(2, '0')}.${commentDate.getFullYear()}`,
        time: `${commentDate.getHours().toString().padStart(2, '0')}:${commentDate.getMinutes().toString().padStart(2, '0')}`,
        replies: []
      };
      
      setCommentsList(prev => [...prev, formattedComment]);
      
    } catch (error) {
      console.error('❌ Ошибка добавления комментария:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  // POST запрос для загрузки файла
  const postFileUpload = async (file) => {
    if (!file || !task) return;
    
    try {
      console.log(`📤 POST файл:`, file.name);
      
      const uploadedFile = await uploadFileToTask(task.id, file, useMockData);
      console.log('✅ Файл загружен:', uploadedFile);
      
      const formattedFile = {
        id: uploadedFile.id,
        name: file.name,
        size: formatFileSize(file.size),
        fileData: uploadedFile
      };
      
      setFiles(prev => [...prev, formattedFile]);
      
      alert(`Файл "${file.name}" успешно загружен!`);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  // Обработчики
  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    patchDescription(newComment);
  };

  const handleDeadlineChange = (e) => {
    const newDeadline = e.target.textContent;
    setDeadline(newDeadline);
    patchDeadline(newDeadline);
  };

  const handleStatusChange = (statusLabel, statusApiValue, newProgress) => {
    patchStatus(statusApiValue, statusLabel, newProgress);
    setShowStatusDropdown(false);
  };

  const handleChatCommentSubmit = async (e) => {
    e.preventDefault();
    const textToSend = newComment.trim();
    
    if (!textToSend) return;
    
    await postChatComment(textToSend);
    setNewComment('');
    setReplyToCommentId(null);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    await postFileUpload(files[0]);
    e.target.value = null;
  };

  const handleFileDownload = (file) => {
    if (!file.fileData || !file.fileData.file) {
      alert('Ссылка на файл недоступна');
      return;
    }
    
    const a = document.createElement('a');
    a.href = file.fileData.file;
    a.download = file.name;
    a.target = '_blank';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
    }, 10);
  };

  // Загрузка данных задачи
  const loadTask = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const taskData = await getTaskById(taskId, useMockData);
      setTask(taskData);
      
      if (taskData.description) {
        setComment(taskData.description);
      }
      
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
      
      if (taskData.status_display) {
        setStatus(taskData.status_display);
        const statusOption = statusOptions.find(opt => opt.label === taskData.status_display);
        setProgress(statusOption ? statusOption.progress : 50);
      }
      
      if (taskData.performer_name) {
        const initials = taskData.performer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setAssignee({
          name: taskData.performer_name,
          initials: initials,
          color: '#FF6B6B'
        });
      }
      
      if (taskData.director_name) {
        const initials = taskData.director_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setManager({
          name: taskData.director_name,
          initials: initials,
          color: '#4ECDC4'
        });
      }
      
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
        setCommentsList([]);
      }
      
      if (taskData.files && taskData.files.length > 0) {
        const formattedFiles = taskData.files.map(file => ({
          id: file.id,
          name: file.file ? file.file.split('/').pop() : 'Файл',
          size: formatFileSize(file.size) || 'Неизвестно',
          fileData: file
        }));
        setFiles(formattedFiles);
      } else {
        setFiles([]);
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки задачи:', error);
      setError('Не удалось загрузить задачу. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
    
    return () => {
      clearTimeout(patchTimeoutRef.current);
    };
  }, [taskId, useMockData]);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Неизвестно';
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

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

  const generateAvatar = (initials, color) => (
    <div className="taskcard-avatar" style={{ backgroundColor: color }}>
      {initials}
    </div>
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [commentsList]);

  // ЗАГРУЗКА - ТАК ЖЕ КАК В ГАНТЕ
  if (loading) {
    return (
      <div className="taskcard-container">
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка задачи...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем данные задачи
          </p>
        </div>
      </div>
    );
  }

  // ОШИБКА ЗАГРУЗКИ - ТАК ЖЕ КАК В ГАНТЕ
  if (error) {
    return (
      <div className="taskcard-container">
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button 
              onClick={loadTask}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ЗАДАЧА НЕ НАЙДЕНА - ТАК ЖЕ КАК В ГАНТЕ
  if (!task) {
    return (
      <div className="taskcard-container">
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">📋</span>
            <h4>Задача не найдена</h4>
            <p>Запрошенная задача не существует или была удалена</p>
            <button 
              onClick={() => navigate('/my-tasks')}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Вернуться к моим задачам
            </button>
          </div>
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
        <form onSubmit={(e) => e.preventDefault()}>
          <textarea
            className="comment-input"
            placeholder="Начните ввод"
            value={comment}
            onChange={handleCommentChange}
            onBlur={() => patchDescription(comment)}
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
              
              <div className="chat-scroll-container" ref={chatContainerRef}>
                <div className="chat-container">
                  {sortedDates.map(date => (
                    <React.Fragment key={date}>
                      <div className="chat-date-header">{date}</div>
                      
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
                          
                          
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
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
                    ref={fileInputRef}
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
                  <span 
                    className="date-value editable"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleDeadlineChange(e)}
                  >
                    {deadline}
                  </span>
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
                          onClick={() => handleStatusChange(option.label, option.apiValue, option.progress)}
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
              <div className="person-item">
                <div className="person-role">Исполнитель</div>
                <div className="person-info">
                  {generateAvatar(assignee.initials, assignee.color)}
                  <span className="person-name">{assignee.name}</span>
                </div>
              </div>
              
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