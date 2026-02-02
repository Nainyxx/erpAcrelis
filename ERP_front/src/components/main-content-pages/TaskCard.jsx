// ERP_front/src/components/main-content-pages/TaskCard.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getTaskById, 
    updateTask, 
    uploadFileToTask, 
    addCommentToTask,
} from '../../services/api/api';
import TaskWebSocketService from '../../services/taskWebSocketService';
import './TaskCard.css';

// Константы для ограничения длины названий файлов
const MAX_FILENAME_LENGTH = 15; // Максимальная длина названия файла до обрезания
const MAX_FILENAME_EXTENSION_LENGTH = 5; // Максимальная длина расширения (например .png, .webm)

const TaskCard = ({ useMockData = false }) => {
    const navigate = useNavigate();
    const { taskId, taskName } = useParams();
    const chatContainerRef_task_card = useRef(null);
    const fileInputRef_task_card = useRef(null);
    const patchTimeoutRef_task_card = useRef(null);
    
    // Флаги для отслеживания состояния
    const initialLoadDone = useRef(false);
    
    // WebSocket реф
    const wsServiceRef = useRef(null);
    
    // Данные задачи
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // WebSocket состояния
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [wsError, setWsError] = useState(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);
    
    // Состояния для полей
    const [comment, setComment] = useState('');
    const [newComment, setNewComment] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [commentsList, setCommentsList] = useState([]);
    const [files, setFiles] = useState([]);
    
    // Для оптимистичного обновления UI
    const [pendingComments, setPendingComments] = useState([]);
    const [isSending, setIsSending] = useState(false);
    
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

    // ==================== Функции для обработки названий файлов ====================
    
    // Функция для обрезки длинного названия файла
    const truncateFilename = (filename) => {
        if (!filename) return 'Файл';
        
        // Разделяем имя файла и расширение
        const lastDotIndex = filename.lastIndexOf('.');
        
        if (lastDotIndex === -1) {
            // Если нет расширения
            if (filename.length <= MAX_FILENAME_LENGTH) {
                return filename;
            }
            return filename.substring(0, MAX_FILENAME_LENGTH) + '...';
        }
        
        const name = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex + 1);
        
        // Обрезаем расширение если оно слишком длинное
        let truncatedExtension = extension;
        if (extension.length > MAX_FILENAME_EXTENSION_LENGTH) {
            truncatedExtension = extension.substring(0, MAX_FILENAME_EXTENSION_LENGTH) + '...';
        }
        
        // Обрезаем имя если оно слишком длинное
        if (name.length <= MAX_FILENAME_LENGTH) {
            return `${name}.${truncatedExtension}`;
        }
        
        return `${name.substring(0, MAX_FILENAME_LENGTH)}....${truncatedExtension}`;
    };
    
    // Функция для получения полного названия файла (для title атрибута)
    const getFullFilename = (filename) => {
        if (!filename) return 'Файл';
        return filename;
    };
    
    // Функция для получения расширения файла
    const getFileExtension = (filename) => {
        if (!filename) return '';
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return '';
        return filename.substring(lastDotIndex + 1).toLowerCase();
    };
    
    // Функция для получения иконки в зависимости от типа файла
    const getFileIcon = (filename) => {
        const extension = getFileExtension(filename);
        
        switch(extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return '🖼️';
            case 'zip':
            case 'rar':
            case '7z':
                return '📦';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'webm':
                return '🎬';
            case 'mp3':
            case 'wav':
            case 'ogg':
                return '🎵';
            case 'txt':
                return '📃';
            default:
                return '📎';
        }
    };
    
    // Функция для форматирования размера файла
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Неизвестно';
        if (bytes < 1024) return bytes + ' Б';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
        return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    };

    // ==================== Функции для комментариев ====================

    // Форматирование комментария
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
        
        const formatted = {
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
        
        return formatted;
    };

    // ==================== WebSocket функции ====================

    // Инициализация WebSocket
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
            
            
            // Подписка на события WebSocket
            const unsubscribeComment = wsServiceRef.current.onComment((newCommentData) => {

                
                if (!newCommentData) {
                    return;
                }
                
                // Проверяем, что это комментарий для этой задачи
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
            
            // Сохраняем функции отписки для очистки
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

    // Обработка нового комментария из WebSocket
    const handleNewCommentFromWebSocket = useCallback((commentData) => {
        
        if (!commentData) {
            return;
        }
        

        
        const formattedComment = formatComment(commentData);
        formattedComment.isFromWebSocket = true;
        
        
        setCommentsList(prev => {
            
            // Ищем дубликаты
            const tempId = commentData.tempId || commentData.temp_id;
            const realId = commentData.id;
            
            // Проверяем по реальному ID и tempId
            const existingIndex = prev.findIndex(c => 
                c.id === realId || c.tempId === tempId
            );
            
            
            if (existingIndex !== -1) {
                // Обновляем существующий комментарий
                const newComments = [...prev];
                newComments[existingIndex] = formattedComment;
                return newComments;
            }
            
            // Добавляем новый комментарий в конец (самые новые внизу)
            return [...prev, formattedComment];
        });
        
        // Удаляем из pending, если это подтверждение нашего сообщения
        const tempId = commentData.tempId || commentData.temp_id;
        if (tempId) {
            setPendingComments(prev => {
                const newPending = prev.filter(id => id !== tempId);
                return newPending;
            });
        }
        
        // Прокрутка к новому сообщению
        setTimeout(() => {
            if (chatContainerRef_task_card.current) {
                chatContainerRef_task_card.current.scrollTop = 
                    chatContainerRef_task_card.current.scrollHeight;
            }
        }, 100);
    }, []);

    // Отправка комментария через WebSocket с оптимистичным обновлением
    const sendCommentViaWebSocket = async (commentText) => {
        if (!commentText.trim()) {
            throw new Error('Комментарий не может быть пустым');
        }
        
        if (!isWebSocketConnected || !wsServiceRef.current) {
            throw new Error('Нет соединения с чатом');
        }
        
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        
        
        // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ: сразу показываем сообщение
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
        
        // Прокручиваем к новому сообщению
        scrollToBottom();
        
        try {
            // Отправляем через WebSocket
            const result = wsServiceRef.current.sendComment(commentText, tempId);
            return tempId;
        } catch (error) {
            
            // Откатываем оптимистичное обновление при ошибке
            setCommentsList(prev => prev.filter(c => c.tempId !== tempId));
            setPendingComments(prev => prev.filter(id => id !== tempId));
            
            throw error;
        }
    };

    // Отправка комментария через API (fallback)
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

    // Прокрутка чата к последнему сообщению
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
            
            // Файлы (только при первой загрузке) - ОБНОВЛЕНО
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
            
            // КОММЕНТАРИИ: загружаем ТОЛЬКО при открытии страницы
            
            if (taskData.comments && taskData.comments.length > 0) {
                // Сортируем комментарии по дате создания (самые новые внизу)
                const sortedComments = [...taskData.comments].sort((a, b) => 
                    new Date(a.created) - new Date(b.created)
                );
                
                
                const formattedComments = sortedComments.map(comment => formatComment(comment));
                setCommentsList(formattedComments);
            } else {
                setCommentsList([]);
            }
            
            // Помечаем, что первая загрузка выполнена
            initialLoadDone.current = true;
            
            // Прокручиваем к последнему сообщению после загрузки
            scrollToBottom();
            
            // ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ ДАННЫХ инициализируем WebSocket
            
            // Небольшая задержка для стабильности
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
        
        // Блокируем повторную отправку
        if (isSending) {
            return;
        }
        
        setIsSending(true);
        const commentToSend = textToSend;
        
        
        // Очищаем поле ввода сразу (оптимистично)
        setNewComment('');
        setReplyToCommentId(null);
        
        try {
            // Пытаемся отправить через WebSocket
            if (isWebSocketConnected && wsServiceRef.current) {
                await sendCommentViaWebSocket(commentToSend);
            } else {
                // Если WebSocket не подключен, используем API
                const response = await sendCommentViaAPI(commentToSend);
                
                // После успешной отправки через API, сразу добавляем комментарий в список
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

    const patchDescription_task_card = async (descriptionText) => {
        if (!taskId || !task) return;
        
        clearTimeout(patchTimeoutRef_task_card.current);
        
        patchTimeoutRef_task_card.current = setTimeout(async () => {
            try {
                const updateData = { description: descriptionText };
                const updatedTask = await updateTask(taskId, updateData, useMockData);
                setTask(updatedTask);
            } catch (error) {
            }
        }, 1000);
    };

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
                const updatedTask = await updateTask(taskId, updateData, useMockData);
                setTask(updatedTask);
            } catch (error) {
            }
        }, 1000);
    };

    const patchStatus_task_card = async (statusApiValue, statusLabel, newProgress) => {
        try {
            const updateData = { status: statusApiValue };
            const updatedTask = await updateTask(taskId, updateData, useMockData);
            setTask(updatedTask);
            setStatus(statusLabel);
            setProgress(newProgress);
        } catch (error) {
        }
    };

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

    const handleFileUpload_task_card = async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        
        await postFileUpload_task_card(files[0]);
        e.target.value = null;
    };

    // Обновленная функция загрузки файла
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

    // Группировка комментариев по дате
    const groupCommentsByDate_task_card = () => {
        const grouped = {};
        
        // Сортируем комментарии по дате создания (старые сверху, новые снизу)
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

    // Прокрутка чата при изменении комментариев
    useEffect(() => {
        scrollToBottom();
    }, [commentsList, scrollToBottom]);

    // ==================== ОСНОВНОЙ useEffect ====================
    useEffect(() => {
        if (!initialLoadDone.current) {
            loadTask_task_card();
        }
        
        // Очистка при размонтировании
        return () => {
            clearTimeout(patchTimeoutRef_task_card.current);
            
            // Очистка WebSocket
            if (wsServiceRef.current) {
                
                // Отписываемся от всех событий
                if (wsServiceRef.current.unsubscribeFunctions) {
                    Object.values(wsServiceRef.current.unsubscribeFunctions).forEach(unsubscribe => {
                        if (typeof unsubscribe === 'function') {
                            unsubscribe();
                        }
                    });
                }
                
                // Отключаем WebSocket
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
            {/* Заголовок - показываем название задачи вместо ID */}
            <div className="taskcard-header_task_card">
                <h1 className="taskcard-title_task_card">
                    <span 
                        className="mytasks-link_task_card" 
                        onClick={() => navigate('/my-tasks')}
                    >
                        Мои задачи
                    </span>
                    {' — '}
                    <span className="task-name_task_card">{task.name || taskName || 'Задача'}</span>
                </h1>
            </div>

            {/* Форма ввода описания задачи */}
            <div className="comment-form-container_task_card">
                <form onSubmit={(e) => e.preventDefault()}>
                    <textarea
                        className="comment-input_task_card"
                        placeholder="Описание задачи..."
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
                                            <span className="file-size_task_card">{file.size}</span>
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