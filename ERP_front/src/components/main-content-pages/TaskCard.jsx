// ERP_front/src/components/main-content-pages/TaskCard.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getTaskById, 
    updateTask, 
    uploadFileToTask, 
    addCommentToTask,
    getProjectById
} from '../../services/api/api';
import TaskWebSocketService from '../../services/taskWebSocketService';
import './TaskCard.css';

// Константы для ограничения длины названий файлов
const MAX_FILENAME_LENGTH = 15;
const MAX_FILENAME_EXTENSION_LENGTH = 5;

const TaskCard = ({ useMockData = false }) => {
    const navigate = useNavigate();
    const params = useParams();
    const { taskId, projectId } = params;
    
    const chatContainerRef_task_card = useRef(null);
    const fileInputRef_task_card = useRef(null);
    
    // Флаги для отслеживания состояния
    const initialLoadDone = useRef(false);
    
    // WebSocket реф
    const wsServiceRef = useRef(null);
    
    // Данные задачи
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingProject, setLoadingProject] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // WebSocket состояния
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [wsError, setWsError] = useState(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    
    // Состояния для полей
    const [comment, setComment] = useState('');
    const [originalComment, setOriginalComment] = useState('');
    const [newComment, setNewComment] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [commentsList, setCommentsList] = useState([]);
    const [files, setFiles] = useState([]);
    
    // Для оптимистичного обновления UI
    const [pendingComments, setPendingComments] = useState([]);
    const [isSending, setIsSending] = useState(false);
    
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');
    const [originalDeadline, setOriginalDeadline] = useState('');
    const [status, setStatus] = useState('');
    const [originalStatus, setOriginalStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [originalProgress, setOriginalProgress] = useState(0);
    const [showStatusDropdown_task_card, setShowStatusDropdown_task_card] = useState(false);
    const [assignee, setAssignee] = useState({
        id: null,
        name: '',
        initials: '',
        color: '#FF6B6B',
        image: null
    });
    const [manager, setManager] = useState({
        id: null,
        name: '',
        initials: '',
        color: '#4ECDC4',
        image: null
    });
    
    const statusOptions_task_card = [
        { value: 'new', label: 'Новое', progress: 20, apiValue: 'new' },
        { value: 'active', label: 'В работе', progress: 60, apiValue: 'active' },
        { value: 'paused', label: 'Ожидает', progress: 0, apiValue: 'paused' },
        { value: 'completed', label: 'Готова', progress: 100, apiValue: 'completed' },
        { value: 'draft', label: 'Черновик', progress: 10, apiValue: 'draft' }
    ];

    // ==================== Определение источника перехода ====================
    const getSourceContext = useCallback(() => {
        const path = window.location.pathname || window.location.hash;
        if (path.includes('/kanban/') && path.split('/').filter(Boolean).length === 3) {
            return 'kanban';
        } else if (path.includes('/gantt/') && path.split('/').filter(Boolean).length === 3) {
            return 'gantt';
        } else if (path.includes('/tasks/')) {
            return 'tasks';
        }
        return 'unknown';
    }, []);

    // ==================== Функция загрузки проекта ====================
    const loadProject = useCallback(async () => {
        if (!projectId || loadingProject) return;
        
        setLoadingProject(true);
        try {
            const projectData = await getProjectById(projectId, useMockData);
            setProject(projectData);
        } catch (error) {
        } finally {
            setLoadingProject(false);
        }
    }, [projectId, useMockData, loadingProject]);

    // ==================== Рендеринг заголовка в зависимости от контекста ====================
    const renderHeader = () => {
        // Используем window.location.hash для HashRouter
        const hashPath = window.location.hash || '';
        
        // Убираем # из начала
        const path = hashPath.startsWith('#') ? hashPath.substring(1) : hashPath;
        
        // Разбиваем путь на части
        const pathParts = path.split('/').filter(part => part !== '');
        
        // Проверяем структуру пути
        const isFromKanban = pathParts[0] === 'kanban' && pathParts.length === 3;
        const isFromGantt = pathParts[0] === 'gantt' && pathParts.length === 3;
        const isFromTasks = pathParts[0] === 'tasks' && pathParts.length === 2;
        
        // Если пришли из канбана
        if (isFromKanban) {
            return (
                <div className="taskcard-header_task_card">
                    <h1 className="taskcard-title_task_card">
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate('/projects')}
                            style={{ cursor: 'pointer'}}
                        >
                            Проекты
                        </span>
                        {' — '}
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate(`/projects/${projectId}`)}
                            style={{ cursor: 'pointer'}}
                        >
                            {project?.name || 'ERP Front'}
                        </span>
                        {' — '}
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate(`/kanban/${projectId}`)}
                            style={{ cursor: 'pointer'}}
                        >
                            Канбан задач
                        </span>
                        {' — '}
                        <span className="task-name_task_card">{task?.name || 'Задача'}</span>
                    </h1>
                    <button 
                        className="save-changes-btn_task_card" 
                        onClick={handleSaveChanges}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            );
        }
        
        // Если пришли из ганта
        if (isFromGantt) {
            return (
                <div className="taskcard-header_task_card">
                    <h1 className="taskcard-title_task_card">
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate('/projects')}
                            style={{ cursor: 'pointer'}}
                        >
                            Проекты
                        </span>
                        {' — '}
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate(`/projects/${projectId}`)}
                            style={{ cursor: 'pointer'}}
                        >
                            {project?.name || 'ERP Front'}
                        </span>
                        {' — '}
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate(`/gantt/${projectId}`)}
                            style={{ cursor: 'pointer'}}
                        >
                            Диаграмма Ганта
                        </span>
                        {' — '}
                        <span className="task-name_task_card">{task?.name || 'Задача'}</span>
                    </h1>
                    <button 
                        className="save-changes-btn_task_card" 
                        onClick={handleSaveChanges}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            );
        }
        
        // Если пришли из списка задач
        if (isFromTasks) {
            return (
                <div className="taskcard-header_task_card">
                    <h1 className="taskcard-title_task_card">
                        <span 
                            className="mytasks-link_task_card" 
                            onClick={() => navigate('/my-tasks')}
                            style={{ cursor: 'pointer' }}
                        >
                            Мои задачи
                        </span>
                        {' — '}
                        <span className="task-name_task_card">{task?.name || 'Задача'}</span>
                    </h1>
                    <button 
                        className="save-changes-btn_task_card" 
                        onClick={handleSaveChanges}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            );
        }
        
        // По умолчанию
        return (
            <div className="taskcard-header_task_card">
                <h1 className="taskcard-title_task_card">
                    <span 
                        className="mytasks-link_task_card" 
                        onClick={() => navigate('/my-tasks')}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Мои задачи
                    </span>
                    {' — '}
                    <span className="task-name_task_card">{task?.name || 'Задача'}</span>
                </h1>
                <button 
                    className="save-changes-btn_task_card" 
                    onClick={handleSaveChanges}
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        );
    };

    // ==================== Функции для обработки названий файлов ====================
    
    const truncateFilename = (filename) => {
        if (!filename) return 'Файл';
        
        const lastDotIndex = filename.lastIndexOf('.');
        
        if (lastDotIndex === -1) {
            if (filename.length <= MAX_FILENAME_LENGTH) {
                return filename;
            }
            return filename.substring(0, MAX_FILENAME_LENGTH) + '...';
        }
        
        const name = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex + 1);
        
        let truncatedExtension = extension;
        if (extension.length > MAX_FILENAME_EXTENSION_LENGTH) {
            truncatedExtension = extension.substring(0, MAX_FILENAME_EXTENSION_LENGTH) + '...';
        }
        
        if (name.length <= MAX_FILENAME_LENGTH) {
            return `${name}.${truncatedExtension}`;
        }
        
        return `${name.substring(0, MAX_FILENAME_LENGTH)}....${truncatedExtension}`;
    };
    
    const getFileExtension = (filename) => {
        if (!filename) return '';
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return '';
        return filename.substring(lastDotIndex + 1).toLowerCase();
    };
    
    const getFileIcon = (filename) => {
        const extension = getFileExtension(filename);
        
        switch(extension) {
            case 'pdf': return '📄';
            case 'doc': case 'docx': return '📝';
            case 'xls': case 'xlsx': return '📊';
            case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': return '🖼️';
            case 'zip': case 'rar': case '7z': return '📦';
            case 'mp4': case 'avi': case 'mov': case 'webm': return '🎬';
            case 'mp3': case 'wav': case 'ogg': return '🎵';
            case 'txt': return '📃';
            default: return '📎';
        }
    };
    
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Неизвестно';
        if (bytes < 1024) return bytes + ' Б';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
        return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    };

    // ==================== Функции для комментариев ====================

    const formatComment = (commentData) => {
        
        const commentDate = new Date(commentData.created || commentData.createdAt || new Date());
        
        let userInitials = '??';
        let userName = 'Автор';
        
        if (commentData.author_name || commentData.userName) {
            const name = commentData.author_name || commentData.userName;
            userName = name;
            const nameParts = name.split(' ');
            userInitials = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        
        return {
            id: commentData.id || `temp_${Date.now()}_${Math.random()}`,
            userId: commentData.author_id || `comment_${commentData.id}`,
            userName: userName,
            userInitials: userInitials,
            userColor: '#06D6A0',
            text: commentData.content || commentData.text || '',
            date: `${commentDate.getDate().toString().padStart(2, '0')}.${(commentDate.getMonth() + 1).toString().padStart(2, '0')}.${commentDate.getFullYear()}`,
            time: `${commentDate.getHours().toString().padStart(2, '0')}:${commentDate.getMinutes().toString().padStart(2, '0')}`,
            replies: [],
            createdAt: commentData.created || commentData.createdAt,
            isFromWebSocket: commentData.isFromWebSocket || false,
            isPending: commentData.isPending || false,
            tempId: commentData.tempId || commentData.temp_id
        };
    };

    // ==================== WebSocket функции ====================

    const initWebSocket = useCallback(() => {
        if (!taskId || wsServiceRef.current) {
            return;
        }
        
        try {
            wsServiceRef.current = new TaskWebSocketService(taskId, {
                maxReconnectAttempts: 10,
                reconnectDelay: 3000,
                pingInterval: 25000,
                pingTimeout: 10000
            });
            
            const unsubscribeComment = wsServiceRef.current.onComment((newCommentData) => {
                
                if (!newCommentData) {
                    return;
                }
                
                if (newCommentData.task_id && newCommentData.task_id !== parseInt(taskId)) {
                    return;
                }
                
                handleNewCommentFromWebSocket(newCommentData);
            });
            
            const unsubscribeConnect = wsServiceRef.current.onConnect(() => {
                setIsWebSocketConnected(true);
                setIsReconnecting(false);
                setWsError(null);
            });
            
            const unsubscribeDisconnect = wsServiceRef.current.onDisconnect((code, reason) => {
                setIsWebSocketConnected(false);
            });
            
            const unsubscribeError = wsServiceRef.current.onError((error) => {
                setWsError(error.message);
                setIsWebSocketConnected(false);
            });
            
            const unsubscribeReconnecting = wsServiceRef.current.onReconnecting((attempt, delay) => {
                setIsReconnecting(true);
                setReconnectAttempt(attempt);
            });
            
            wsServiceRef.current.unsubscribeFunctions = {
                comment: unsubscribeComment,
                connect: unsubscribeConnect,
                disconnect: unsubscribeDisconnect,
                error: unsubscribeError,
                reconnecting: unsubscribeReconnecting
            };
            
        } catch (error) {
            setWsError(error.message);
        }
    }, [taskId]);

    const handleNewCommentFromWebSocket = useCallback((commentData) => {
        
        if (!commentData) {
            return;
        }
        
        const formattedComment = formatComment(commentData);
        formattedComment.isFromWebSocket = true;
        
        setCommentsList(prev => {
            
            const tempId = commentData.tempId || commentData.temp_id;
            const realId = commentData.id;
            
            const existingIndex = prev.findIndex(c => 
                c.id === realId || c.tempId === tempId
            );
            
            if (existingIndex !== -1) {
                const newComments = [...prev];
                newComments[existingIndex] = formattedComment;
                return newComments;
            }
            
            return [...prev, formattedComment];
        });
        
        const tempId = commentData.tempId || commentData.temp_id;
        if (tempId) {
            setPendingComments(prev => {
                const newPending = prev.filter(id => id !== tempId);
                return newPending;
            });
        }
        
        setTimeout(() => {
            if (chatContainerRef_task_card.current) {
                chatContainerRef_task_card.current.scrollTop = 
                    chatContainerRef_task_card.current.scrollHeight;
            }
        }, 100);
    }, []);

    const sendCommentViaWebSocket = async (commentText) => {
        if (!commentText.trim()) {
            throw new Error('Комментарий не может быть пустым');
        }
        
        if (!isWebSocketConnected || !wsServiceRef.current) {
            throw new Error('Нет соединения с чатом');
        }
        
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        
        const optimisticComment = {
            id: tempId,
            tempId: tempId,
            userName: 'Вы',
            text: commentText,
            createdAt: new Date().toISOString(),
            isPending: true
        };
        
        const formattedOptimisticComment = formatComment(optimisticComment);
        
        setCommentsList(prev => [...prev, formattedOptimisticComment]);
        setPendingComments(prev => [...prev, tempId]);
        
        scrollToBottom();
        
        try {
            const result = wsServiceRef.current.sendComment(commentText, tempId);
            return tempId;
        } catch (error) {
            
            setCommentsList(prev => prev.filter(c => c.tempId !== tempId));
            setPendingComments(prev => prev.filter(id => id !== tempId));
            
            throw error;
        }
    };

    const sendCommentViaAPI = async (commentText) => {
        if (!commentText.trim() || !taskId) {
            throw new Error('Комментарий не может быть пустым');
        }
        
        try {
            const response = await addCommentToTask(taskId, { content: commentText }, useMockData);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (chatContainerRef_task_card.current) {
                chatContainerRef_task_card.current.scrollTop = 
                    chatContainerRef_task_card.current.scrollHeight;
            }
        }, 100);
    }, []);

    // ==================== Загрузка данных ТОЛЬКО ПРИ ОТКРЫТИИ ====================

    const loadTask_task_card = async () => {
        if (initialLoadDone.current) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const taskData = await getTaskById(taskId, useMockData);
            
            setTask(taskData);
            
            if (taskData.description) {
                setComment(taskData.description);
                setOriginalComment(taskData.description);
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
                setOriginalDeadline(formattedDeadline);
            }
            
            if (taskData.status_display) {
                setStatus(taskData.status_display);
                setOriginalStatus(taskData.status_display);
                const statusOption = statusOptions_task_card.find(opt => opt.label === taskData.status_display);
                const progressValue = statusOption ? statusOption.progress : 50;
                setProgress(progressValue);
                setOriginalProgress(progressValue);
            }
            
            // Обновляем данные исполнителя
            if (taskData.performer || taskData.performer_name) {
                const initials = taskData.performer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                setAssignee({
                    id: taskData.performer,
                    name: taskData.performer_name,
                    initials: initials,
                    color: '#FF6B6B',
                    image: taskData.performer_image
                });
            }
            
            // Обновляем данные руководителя
            if (taskData.director || taskData.director_name) {
                const initials = taskData.director_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                setManager({
                    id: taskData.director,
                    name: taskData.director_name,
                    initials: initials,
                    color: '#4ECDC4',
                    image: taskData.director_image
                });
            }
            
            if (taskData.files && taskData.files.length > 0) {
                const formattedFiles = taskData.files.map(file => ({
                    id: file.id,
                    name: file.file ? file.file.split('/').pop() : 'Файл',
                    truncatedName: file.file ? truncateFilename(file.file.split('/').pop()) : 'Файл',
                    fullName: file.file ? file.file.split('/').pop() : 'Файл',
                    extension: file.file ? getFileExtension(file.file.split('/').pop()) : '',
                    icon: file.file ? getFileIcon(file.file.split('/').pop()) : '📎',
                    fileData: file
                }));
                setFiles(formattedFiles);
            } else {
                setFiles([]);
            }
            
            if (taskData.comments && taskData.comments.length > 0) {
                const sortedComments = [...taskData.comments].sort((a, b) => 
                    new Date(a.created) - new Date(b.created)
                );
                
                const formattedComments = sortedComments.map(comment => formatComment(comment));
                setCommentsList(formattedComments);
            } else {
                setCommentsList([]);
            }
            
            initialLoadDone.current = true;
            
            scrollToBottom();
            
            if (projectId) {
                loadProject();
            }
            
            setTimeout(() => {
                initWebSocket();
            }, 100);
            
        } catch (error) {
            setError('Не удалось загрузить задачу. Проверьте подключение.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== Обработка отправки комментария ====================

    const handleChatCommentSubmit_task_card = async (e) => {
        e.preventDefault();
        const textToSend = newComment.trim();
        
        if (!textToSend) return;
        
        if (isSending) {
            return;
        }
        
        setIsSending(true);
        const commentToSend = textToSend;
        
        setNewComment('');
        setReplyToCommentId(null);
        
        try {
            if (isWebSocketConnected && wsServiceRef.current) {
                await sendCommentViaWebSocket(commentToSend);
            } else {
                const response = await sendCommentViaAPI(commentToSend);
                
                const tempId = `temp_${Date.now()}_${Math.random()}`;
                const optimisticComment = {
                    id: tempId,
                    tempId: tempId,
                    userName: 'Вы',
                    text: commentToSend,
                    createdAt: new Date().toISOString(),
                    isPending: true
                };
                
                const formattedOptimisticComment = formatComment(optimisticComment);
                setCommentsList(prev => [...prev, formattedOptimisticComment]);
                setPendingComments(prev => [...prev, tempId]);
                
                scrollToBottom();
            }
            
        } catch (error) {
            alert('Не удалось отправить комментарий. Проверьте подключение.');
        } finally {
            setIsSending(false);
        }
    };

    // ==================== Обработка изменений полей ====================

    const handleCommentChange_task_card = (e) => {
        const newComment = e.target.value;
        setComment(newComment);
    };

    const handleDeadlineChange_task_card = (e) => {
        const newDeadline = e.target.textContent;
        setDeadline(newDeadline);
    };

    const handleStatusChange_task_card = (statusLabel, statusApiValue, newProgress) => {
        setStatus(statusLabel);
        setProgress(newProgress);
    };

    // ==================== Сохранение изменений ====================

    const handleSaveChanges = async () => {
        if (!taskId || isSaving) return;
        
        setIsSaving(true);
        
        try {
            const updateData = {};
            
            // Проверяем изменения описания
            if (comment !== originalComment) {
                updateData.description = comment;
            }
            
            // Проверяем изменения дедлайна
            if (deadline !== originalDeadline) {
                if (deadline.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                    const [day, month, year] = deadline.split('.');
                    updateData.deadline = `${year}-${month}-${day}T00:00:00+03:00`;
                } else {
                    updateData.deadline = deadline;
                }
            }
            
            // Проверяем изменения статуса
            if (status !== originalStatus) {
                const statusOption = statusOptions_task_card.find(opt => opt.label === status);
                if (statusOption) {
                    updateData.status = statusOption.apiValue;
                }
            }
            
            // Если есть изменения, отправляем запрос
            if (Object.keys(updateData).length > 0) {
                const updatedTask = await updateTask(taskId, updateData, useMockData);
                setTask(updatedTask);
                
                // Обновляем оригинальные значения
                setOriginalComment(comment);
                setOriginalDeadline(deadline);
                setOriginalStatus(status);
                setOriginalProgress(progress);
            } else {
                // Нет изменений для сохранения
            }
            
        } catch (error) {
            alert('Не удалось сохранить изменения. Проверьте подключение.');
        } finally {
            setIsSaving(false);
        }
    };

    // ==================== Остальные функции ====================

    const generateAvatar_task_card = (initials, color, imageUrl = null) => {
        const avatarSize_task_card = '2.5vh';
        
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
        
        let fullImageUrl;
        if (imageUrl.startsWith('http')) {
            fullImageUrl = imageUrl;
        } else if (imageUrl.startsWith('/')) {
            fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
        } else {
            fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
        }
        
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
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                    crossOrigin="anonymous"
                />
                
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

    const handleFileUpload_task_card = async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        
        await postFileUpload_task_card(files[0]);
        e.target.value = null;
    };

    const postFileUpload_task_card = async (file) => {
        if (!file || !task) return;
        
        try {
            const uploadedFile = await uploadFileToTask(task.id, file, useMockData);
            const formattedFile = {
                id: uploadedFile.id,
                name: file.name,
                truncatedName: truncateFilename(file.name),
                fullName: file.name,
                extension: getFileExtension(file.name),
                icon: getFileIcon(file.name),
                size: formatFileSize(file.size),
                fileData: uploadedFile
            };
            setFiles(prev => [...prev, formattedFile]);
        } catch (error) {
        }
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

    const groupCommentsByDate_task_card = () => {
        const grouped = {};
        
        const sortedComments = [...commentsList].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
            return dateA.getTime() - dateB.getTime();
        });
        
        sortedComments.forEach(comment => {
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
        return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    // ==================== Функции для перехода на карточку сотрудника ====================
    
    const handleAssigneeClick = () => {
        if (assignee.id) {
            navigate(`/staff/${assignee.id}`);
        }
    };

    const handleManagerClick = () => {
        if (manager.id) {
            navigate(`/staff/${manager.id}`);
        }
    };

    // ==================== Рендеринг блока с исполнителем и руководителем ====================
    
    const renderPeopleInfo = () => (
        <div className="info-rectangle_task_card">
            {/* Исполнитель */}
            <div className="person-item_task_card">
                <div className="person-role_task_card">Исполнитель</div>
                <div 
                    className={`person-info_task_card ${assignee.id ? 'clickable-person' : ''}`}
                    onClick={assignee.id ? handleAssigneeClick : undefined}
                    style={{
                        cursor: assignee.id ? 'pointer' : 'default'
                    }}
                >
                    {generateAvatar_task_card(assignee.initials, assignee.color, assignee.image)}
                    <span 
                        className="person-name_task_card"
                        style={{
                        }}
                    >
                        {assignee.name}
                    </span>
                </div>
            </div>
            
            {/* Руководитель */}
            <div className="person-item_task_card">
                <div className="person-role_task_card">Руководитель</div>
                <div 
                    className={`person-info_task_card ${manager.id ? 'clickable-person' : ''}`}
                    onClick={manager.id ? handleManagerClick : undefined}
                    style={{
                        cursor: manager.id ? 'pointer' : 'default'
                    }}
                >
                    {generateAvatar_task_card(manager.initials, manager.color, manager.image)}
                    <span 
                        className="person-name_task_card"
                        style={{
                        }}
                    >
                        {manager.name}
                    </span>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        scrollToBottom();
    }, [commentsList, scrollToBottom]);

    // ==================== ОСНОВНОЙ useEffect ====================
    useEffect(() => {
        if (!initialLoadDone.current) {
            loadTask_task_card();
        }
        
        return () => {
            if (wsServiceRef.current) {
                
                if (wsServiceRef.current.unsubscribeFunctions) {
                    Object.values(wsServiceRef.current.unsubscribeFunctions).forEach(unsubscribe => {
                        if (typeof unsubscribe === 'function') {
                            unsubscribe();
                        }
                    });
                }
                
                if (wsServiceRef.current.disconnect && typeof wsServiceRef.current.disconnect === 'function') {
                    wsServiceRef.current.disconnect();
                }
                
                wsServiceRef.current = null;
            }
        };
    }, [taskId, useMockData]);

    // ==================== РЕНДЕРИНГ ====================

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

    if (!task) {
        return (
            <div className="taskcard-container_task_card">
                <div className="no-tasks-message_gantt_class">
                    <div className="no-tasks-content_gantt_class">
                        <span className="no-tasks-icon_gantt_class">📋</span>
                        <h4>Задача не найдена</h4>
                        <p>Запрошенная задача не существует или была удалена</p>
                        <button 
                            onClick={() => {
                                const sourceContext = getSourceContext();
                                if (sourceContext === 'kanban' && projectId) {
                                    navigate(`/kanban/${projectId}`);
                                } else if (sourceContext === 'gantt' && projectId) {
                                    navigate(`/gantt/${projectId}`);
                                } else {
                                    navigate('/my-tasks');
                                }
                            }}
                            className="gantt-back-btn_gantt_class"
                            style={{ marginTop: '2vh' }}
                        >
                            Вернуться назад
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="taskcard-container_task_card">
            {/* Рендерим заголовок в зависимости от контекста */}
            {renderHeader()}

            {/* Форма ввода описания задачи */}
            <div className="comment-form-container_task_card">
                <form onSubmit={(e) => e.preventDefault()}>
                    <textarea
                        className="comment-input_task_card"
                        placeholder="Описание задачи..."
                        value={comment}
                        onChange={handleCommentChange_task_card}
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
                                    {sortedDates_task_card.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                            Нет сообщений. Будьте первым!
                                        </div>
                                    ) : (
                                        sortedDates_task_card.map(date => (
                                            <React.Fragment key={date}>
                                                <div className="chat-date-header_task_card">{date}</div>
                                                
                                                {groupedComments_task_card[date].map(comment => (
                                                    <div 
                                                        key={comment.id} 
                                                        className={`comment-item_task_card ${comment.isPending ? 'comment-pending' : ''}`}
                                                        style={{    
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div className="comment-header_task_card">
                                                            {generateAvatar_task_card(comment.userInitials, comment.userColor)}
                                                            <div className="comment-user-info_task_card">
                                                                <div className="comment-user-name_task_card">
                                                                    {comment.userName}
                                                                </div>
                                                                <div className="comment-time_task_card">{comment.time}</div>
                                                            </div>
                                                        </div>
                                                        <div className="comment-text_task_card">{comment.text}</div>
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    )}
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
                                        disabled={isSending}
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
                                        <button 
                                            type="submit" 
                                            className="send-comment-btn_task_card"
                                            disabled={!newComment.trim() || isSending}
                                        >
                                            {isSending ? 'Отправка...' : 'Отправить'}
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
                                    <div 
                                        key={file.id} 
                                        className="file-item_task_card"
                                        title={file.fullName}
                                    >
                                        <div className="file-details_task_card">
                                            <span 
                                                className="file-name_task_card"
                                                style={{
                                                    display: 'inline-block',
                                                    maxWidth: 'calc(100% - 40px)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {file.truncatedName}
                                            </span>
                                        </div>
                                        <div className="file-info_task_card">
                                            <button 
                                                className="file-download_task_card" 
                                                onClick={() => handleFileDownload_task_card(file)}
                                                title="Скачать файл"
                                            >
                                                ↓
                                            </button>
                                        </div>
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
                        {renderPeopleInfo()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;