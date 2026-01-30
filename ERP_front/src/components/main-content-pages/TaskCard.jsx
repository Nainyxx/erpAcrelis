import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaskById, updateTask, uploadFileToTask, addCommentToTask } from '../../services/api/api';
import './TaskCard.css';

const TaskCard = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const chatContainerRef_task_card = useRef(null);
  const fileInputRef_task_card = useRef(null);
  const patchTimeoutRef_task_card = useRef(null);
  
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
  const [showStatusDropdown_task_card, setShowStatusDropdown_task_card] = useState(false);
  const [assignee, setAssignee] = useState({
    name: '',
    initials: '',
    color: '#FF6B6B',
    image: null
  });
  const [manager, setManager] = useState({
    name: '',
    initials: '',
    color: '#4ECDC4',
    image: null
  });
  
  const statusOptions_task_card = [
    { value: 'new', label: 'Новое', progress: 20, apiValue: 'new' },
    { value: 'active', label: 'В работе', progress: 60, apiValue: 'active' },
    { value: 'paused', label: 'Ожидает', progress: 0, apiValue: 'paused' },
    { value: 'completed', label: 'Завершено', progress: 100, apiValue: 'completed' },
    { value: 'draft', label: 'Черновик', progress: 10, apiValue: 'draft' }
  ];

  // Функция для генерации аватарок
// Обновленная функция generateAvatar_task_card в TaskCard.jsx
const generateAvatar_task_card = (initials, color, imageUrl = null) => {
  const avatarSize_task_card = '2.5vh';
  
  // Если нет изображения или пустая строка, показываем инициалы
  if (!imageUrl || imageUrl.trim() === '') {
    return (
      <div 
        className="avatar-container_task_card"
        style={{ 
          width: avatarSize_task_card, 
          height: avatarSize_task_card,
          backgroundColor: color,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '1vh'
        }}
      >
        {initials}
      </div>
    );
  }
  
  // Формируем полный URL для изображения
  let fullImageUrl;
  if (imageUrl.startsWith('http')) {
    fullImageUrl = imageUrl;
  } else if (imageUrl.startsWith('/')) {
    fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
  } else {
    fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
  }
  
  console.log('Пробуем загрузить аватарку:', fullImageUrl);
  
  return (
    <div 
      className="avatar-container_task_card" 
      style={{ 
        backgroundColor: color, 
        position: 'relative',
        width: avatarSize_task_card,
        height: avatarSize_task_card,
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    >
      {/* Изображение */}
      <img 
        src={fullImageUrl} 
        alt={initials}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        onError={(e) => {
          console.log('Ошибка загрузки аватарки, показываем инициалы');
          e.target.style.display = 'none';
          // Показываем инициалы
          e.target.nextSibling.style.display = 'flex';
        }}
        crossOrigin="anonymous"
      />
      
      {/* Fallback с инициалами (скрыт по умолчанию) */}
      <div 
        className="avatar-fallback_task_card"
        style={{
          display: 'none',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '1vh',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: color
        }}
      >
        {initials}
      </div>
    </div>
  );
};

  // PATCH запрос для описания
  const patchDescription_task_card = async (descriptionText) => {
    if (!taskId || !task) return;
    
    clearTimeout(patchTimeoutRef_task_card.current);
    
    patchTimeoutRef_task_card.current = setTimeout(async () => {
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
  const patchDeadline_task_card = async (deadlineText) => {
    if (!taskId || !task) return;
    
    clearTimeout(patchTimeoutRef_task_card.current);
    
    patchTimeoutRef_task_card.current = setTimeout(async () => {
      try {
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

  // PATCH запрос для статуса
  const patchStatus_task_card = async (statusApiValue, statusLabel, newProgress) => {
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
  const postChatComment_task_card = async (commentText) => {
    if (!commentText.trim() || !task) return;
    
    try {
      const commentData = { content: commentText };
      console.log(`💬 POST комментарий:`, commentData);
      
      const newCommentObj = await addCommentToTask(task.id, commentData, useMockData);
      console.log('✅ Комментарий добавлен:', newCommentObj);
      
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
  const postFileUpload_task_card = async (file) => {
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
      
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error);
    }
  };

  // Обработчики
  const handleCommentChange_task_card = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    patchDescription_task_card(newComment);
  };

  const handleDeadlineChange_task_card = (e) => {
    const newDeadline = e.target.textContent;
    setDeadline(newDeadline);
    patchDeadline_task_card(newDeadline);
  };

  const handleStatusChange_task_card = (statusLabel, statusApiValue, newProgress) => {
    patchStatus_task_card(statusApiValue, statusLabel, newProgress);
    setShowStatusDropdown_task_card(false);
  };

  const handleChatCommentSubmit_task_card = async (e) => {
    e.preventDefault();
    const textToSend = newComment.trim();
    
    if (!textToSend) return;
    
    await postChatComment_task_card(textToSend);
    setNewComment('');
    setReplyToCommentId(null);
  };

  const handleFileUpload_task_card = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    await postFileUpload_task_card(files[0]);
    e.target.value = null;
  };

  const handleFileDownload_task_card = (file) => {
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
  const loadTask_task_card = async () => {
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
        const statusOption = statusOptions_task_card.find(opt => opt.label === taskData.status_display);
        setProgress(statusOption ? statusOption.progress : 50);
      }
      
      // Обновляем исполнителя с аватаркой
      if (taskData.performer_name) {
        const initials = taskData.performer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setAssignee({
          name: taskData.performer_name,
          initials: initials,
          color: '#FF6B6B',
          image: taskData.performer_image
        });
      }
      
      // Обновляем руководителя с аватаркой
      if (taskData.director_name) {
        const initials = taskData.director_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        setManager({
          name: taskData.director_name,
          initials: initials,
          color: '#4ECDC4',
          image: taskData.director_image
        });
      }
      
      if (taskData.comments && taskData.comments.length > 0) {
        const formattedComments = taskData.comments.map(comment => {
          const commentDate = new Date(comment.created);
          
          let userInitials = '??';
          if (comment.author_name) {
            const nameParts = comment.author_name.split(' ');
            userInitials = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2);
          }
          
          return {
            id: comment.id,
            userId: `comment_${comment.id}`,
            userName: comment.author_name || 'Автор',
            userInitials: userInitials,
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
    loadTask_task_card();
    
    return () => {
      clearTimeout(patchTimeoutRef_task_card.current);
    };
  }, [taskId, useMockData]);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Неизвестно';
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  const groupCommentsByDate_task_card = () => {
    const grouped = {};
    commentsList.forEach(comment => {
      if (!grouped[comment.date]) {
        grouped[comment.date] = [];
      }
      grouped[comment.date].push(comment);
    });
    return grouped;
  };
  
  const groupedComments_task_card = groupCommentsByDate_task_card();
  const sortedDates_task_card = Object.keys(groupedComments_task_card).sort((a, b) => {
    const dateA = a.split('.').reverse().join('-');
    const dateB = b.split('.').reverse().join('-');
    return new Date(dateA) - new Date(dateB);
  });

  useEffect(() => {
    if (chatContainerRef_task_card.current) {
      chatContainerRef_task_card.current.scrollTop = chatContainerRef_task_card.current.scrollHeight;
    }
  }, [commentsList]);

  // ЗАГРУЗКА
  if (loading) {
    return (
      <div className="taskcard-container_task_card">
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

  // ОШИБКА ЗАГРУЗКИ
  if (error) {
    return (
      <div className="taskcard-container_task_card">
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button 
              onClick={loadTask_task_card}
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

  // ЗАДАЧА НЕ НАЙДЕНА
  if (!task) {
    return (
      <div className="taskcard-container_task_card">
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
    <div className="taskcard-container_task_card">
      {/* Заголовок */}
      <div className="taskcard-header_task_card">
        <h1 className="taskcard-title_task_card">
          <span 
            className="mytasks-link_task_card" 
            onClick={() => navigate('/my-tasks')}
          >
            Мои задачи
          </span>
          {' — Задача '}
          <span className="task-number_task_card">{taskId || '3'}</span>
        </h1>
      </div>

      {/* Форма ввода комментария */}
      <div className="comment-form-container_task_card">
        <form onSubmit={(e) => e.preventDefault()}>
          <textarea
            className="comment-input_task_card"
            placeholder="Начните ввод"
            value={comment}
            onChange={handleCommentChange_task_card}
            onBlur={() => patchDescription_task_card(comment)}
          />
        </form>
      </div>

      {/* Основное содержимое - 3 колонки */}
      <div className="taskcard-main-content_task_card">
        <div className="taskcard-grid_task_card">
          {/* Колонка 1: Чат */}
          <div className="column-section_task_card">
            <div className="column-rectangle_task_card chat-column_task_card">
              <h3 className="column-title_task_card">Чат</h3>
              
              <div className="chat-scroll-container_task_card" ref={chatContainerRef_task_card}>
                <div className="chat-container_task_card">
                  {sortedDates_task_card.map(date => (
                    <React.Fragment key={date}>
                      <div className="chat-date-header_task_card">{date}</div>
                      
                      {groupedComments_task_card[date].map(comment => (
                        <div key={comment.id} className="comment-item_task_card">
                          <div className="comment-header_task_card">
                            {generateAvatar_task_card(comment.userInitials, comment.userColor)}
                            <div className="comment-user-info_task_card">
                              <div className="comment-user-name_task_card">{comment.userName}</div>
                              <div className="comment-time_task_card">{comment.time}</div>
                            </div>
                          </div>
                          <div className="comment-text_task_card">{comment.text}</div>
                          
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-container_task_card">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="reply-item_task_card">
                                  <div className="reply-header_task_card">
                                    {generateAvatar_task_card(reply.userInitials, reply.userColor)}
                                    <div className="reply-user-info_task_card">
                                      <div className="reply-user-name_task_card">{reply.userName}</div>
                                      <div className="reply-time_task_card">{reply.time}</div>
                                    </div>
                                  </div>
                                  <div className="reply-text_task_card">{reply.text}</div>
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
              
              <div className="new-comment-section_task_card">
                <form className="new-comment-form_task_card" onSubmit={handleChatCommentSubmit_task_card}>
                  <textarea
                    className="new-comment-input_task_card"
                    placeholder={replyToCommentId ? "Введите ответ..." : "Добавить комментарий"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <div className="comment-buttons_task_card">
                    {replyToCommentId && (
                      <button 
                        type="button"
                        className="cancel-reply-btn_task_card"
                        onClick={() => setReplyToCommentId(null)}
                      >
                        Отменить
                      </button>
                    )}
                    <button type="submit" className="send-comment-btn_task_card">
                      {replyToCommentId ? 'Отправить ответ' : 'Отправить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Колонка 2: Файлы */}
          <div className="column-section_task_card">
            <div className="column-rectangle_task_card files-column_task_card">
              <div className="files-header_task_card">
                <h3 className="column-title_task_card">Файлы проекта</h3>
                <label className="upload-file-btn_task_card">
                  + Загрузить файлы
                  <input
                    type="file"
                    ref={fileInputRef_task_card}
                    multiple
                    onChange={handleFileUpload_task_card}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="files-list_task_card">
                {files.map(file => (
                  <div key={file.id} className="file-item_task_card">
                    <div className="file-details_task_card">
                      <span className="file-name_task_card">{file.name}</span>
                      <span className="file-size_task_card">{file.size}</span>
                    </div>
                    <button 
                      className="file-download_task_card" 
                      onClick={() => handleFileDownload_task_card(file)}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
              <div className="files-count_task_card">
                Всего файлов: {files.length}
              </div>
            </div>
          </div>

          {/* Колонка 3: 3 отдельных прямоугольника с информацией */}
          <div className="column-section_task_card">
            {/* Прямоугольник 1: Даты */}
            <div className="info-rectangle_task_card">
              <div className="date-item_task_card">
                <div className="date-row_task_card">
                  <span className="date-label_task_card">Начало:</span>
                </div>
                <div className="date-row_task_card">
                  <span className="date-value_task_card">{startDate}</span>
                </div>
                <div className="date-row_task_card">
                  <span className="date-label_task_card">Дедлайн:</span>
                </div>
                <div className="date-row_task_card">
                  <span 
                    className="date-value_task_card editable_task_card"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleDeadlineChange_task_card(e)}
                  >
                    {deadline}
                  </span>
                </div>
              </div>
            </div>

            {/* Прямоугольник 2: Статус */}
            <div className="info-rectangle_task_card">
              <div className="status-header_task_card">
                <h3 className="column-title_task_card">Статус</h3>
                <div className="status-dropdown-wrapper_task_card">
                  <button 
                    className="change-status-btn_task_card"
                    onClick={() => setShowStatusDropdown_task_card(!showStatusDropdown_task_card)}
                  >
                    Изменить статус
                  </button>
                  
                  {showStatusDropdown_task_card && (
                    <div className="status-dropdown_task_card">
                      {statusOptions_task_card.map(option => (
                        <div 
                          key={option.value}
                          className="status-option_task_card"
                          onClick={() => handleStatusChange_task_card(option.label, option.apiValue, option.progress)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="status-info_task_card">
                <div className="status-row_task_card">
                  <span className="current-status_task_card">{status}</span>
                </div>
                <div className="progress-section_task_card">
                  <div className="progress-bar_task_card">
                    <div 
                      className="progress-fill_task_card"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-label_task_card">{progress}%</div>
                </div>
              </div>
            </div>

            {/* Прямоугольник 3: Исполнитель и руководитель */}
            <div className="info-rectangle_task_card">
              <div className="person-item_task_card">
                <div className="person-role_task_card">Исполнитель</div>
                <div className="person-info_task_card">
                  {generateAvatar_task_card(assignee.initials, assignee.color, assignee.image)}
                  <span className="person-name_task_card">{assignee.name}</span>
                </div>
              </div>
              
              <div className="person-item_task_card">
                <div className="person-role_task_card">Руководитель</div>
                <div className="person-info_task_card">
                  {generateAvatar_task_card(manager.initials, manager.color, manager.image)}
                  <span className="person-name_task_card">{manager.name}</span>
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