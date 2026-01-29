import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProjectCard.css';
import { getProjectById, updateProject, uploadFileToProject, addPerformerToProject, getProjectLogs, getStaffList } from '../../services/api/api';

const ProjectCard = ({ useMockData }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectType, setProjectType] = useState('');
  const [price, setPrice] = useState('');
  const [customer, setCustomer] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [changes, setChanges] = useState([]);
  const [isUserInProject, setIsUserInProject] = useState(false);
  const [currentUser] = useState('Иван Петров');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAddPerformerModal, setShowAddPerformerModal] = useState(false);
  const [staffNameInput, setStaffNameInput] = useState('');
  const [addingPerformer, setAddingPerformer] = useState(false);
  
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  
  const [allStaff, setAllStaff] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const fileInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const statusOptions = [
    { value: 'draft', label: 'Черновик', apiValue: 'draft' },
    { value: 'active', label: 'Активный', apiValue: 'active' },
    { value: 'paused', label: 'Приостановлен', apiValue: 'paused' },
    { value: 'tests', label: 'Тестирование', apiValue: 'tests' },
    { value: 'completed', label: 'Завершен', apiValue: 'completed' },
    { value: 'cancelled', label: 'Отменен', apiValue: 'cancelled' }
  ];

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Не указана';
    
    if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return dateString;
    }
    
    if (dateString.includes('T')) {
      try {
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}.${month}.${year}`;
      } catch (e) {
        console.error('Ошибка парсинга даты:', dateString);
        return 'Неверная дата';
      }
    }
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    
    return dateString;
  };

  const generateAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className="projectcard-avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  const formatPrice = (price) => {
    if (!price) return '0,00 ₽';
    const num = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num) + ' ₽';
  };

  const handleStatusChange = async (statusLabel, statusApiValue) => {
    if (!project) return;
    
    try {
      console.log(`🔄 Отправляем PATCH запрос для обновления статуса проекта на: ${statusLabel} (${statusApiValue})`);
      
      const updateData = { status: statusApiValue };
      
      const updatedProject = await updateProject(project.id, updateData, useMockData);
      
      console.log('✅ PATCH запрос успешен:', updatedProject);
      
      setProject(updatedProject);
      setProjectStatus(updatedProject.status_display || statusLabel);
      
      const updatedLogs = await getProjectLogs(project.id, useMockData);
      setChanges(updatedLogs);
      
      setShowStatusDropdown(false);
      
      console.log(`✅ Статус проекта успешно обновлен на: ${statusLabel}`);
      
    } catch (error) {
      console.error('❌ Ошибка PATCH запроса для статуса:', error);
      alert('Ошибка при обновлении статуса проекта');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const loadStaffList = async () => {
    try {
      const staffListResult = await getStaffList(useMockData);
      const staffList = staffListResult.employees || [];
      setAllStaff(staffList);
    } catch (error) {
      console.error('Ошибка загрузки списка сотрудников:', error);
    }
  };

  const handleStaffInputChange = (e) => {
    const value = e.target.value;
    setStaffNameInput(value);
    
    if (value.length > 1) {
      const searchQuery = value.toLowerCase().trim();
      const filtered = allStaff.filter(staff => 
        staff.name.toLowerCase().includes(searchQuery)
      ).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (staff) => {
    setStaffNameInput(staff.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const handleSaveChanges = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updateData = {};
      
      // Сохраняем название проекта если оно изменилось
      if (projectName !== project.name && projectName.trim() !== '') {
        updateData.name = projectName;
      }
      
      const formattedProjectStartDate = formatDateForDisplay(project.startDate);
      if (startDate !== formattedProjectStartDate && startDate.trim() !== '' && startDate !== 'Не указана') {
        if (startDate.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = startDate.split('.');
          updateData.start_date = `${year}-${month}-${day}T00:00:00+03:00`;
        } else {
          updateData.start_date = startDate;
        }
      }
      
      const formattedProjectDeadline = formatDateForDisplay(project.deadline);
      if (deadline !== formattedProjectDeadline && deadline.trim() !== '' && deadline !== 'Не указана') {
        if (deadline.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = deadline.split('.');
          updateData.deadline = `${year}-${month}-${day}T00:00:00+03:00`;
        } else {
          updateData.deadline = deadline;
        }
      }
      
      if (projectType !== project.typeLabel && projectType !== project.type_display) {
        const typeMap = {
          'Сайт': 'website',
          'Бот': 'bot',
          'Приложение': 'app',
          'Мини-приложение': 'miniapp',
          'Дизайн': 'design',
          'Другое': 'other'
        };
        updateData.type = typeMap[projectType] || projectType.toLowerCase();
      }
      
      if (price !== project.price) {
        const cleanPrice = price.replace(/[^\d.,]/g, '').replace(',', '.');
        updateData.price = parseFloat(cleanPrice) || 0;
      }
      
      if (customer !== project.customer && customer.trim() !== '') {
        updateData.customer = customer;
      }
      
      console.log('Отправляемые данные для PATCH:', updateData);
      
      if (Object.keys(updateData).length > 0) {
        const updatedProject = await updateProject(project.id, updateData, useMockData);
        console.log('Обновленный проект:', updatedProject);
        
        setProject(updatedProject);
        
        // Обновляем название если оно было изменено
        if (updatedProject.name) {
          setProjectName(updatedProject.name);
        }
        
        if (updatedProject.startDateFormatted) {
          setStartDate(updatedProject.startDateFormatted);
        } else if (updatedProject.startDate) {
          setStartDate(formatDateForDisplay(updatedProject.startDate));
        }
        
        if (updatedProject.deadlineFormatted) {
          setDeadline(updatedProject.deadlineFormatted);
        } else if (updatedProject.deadline) {
          setDeadline(formatDateForDisplay(updatedProject.deadline));
        }
        
        if (updatedProject.typeLabel) {
          setProjectType(updatedProject.typeLabel);
        } else if (updatedProject.type_display) {
          setProjectType(updatedProject.type_display);
        } else if (updatedProject.type) {
          setProjectType(updatedProject.type);
        }
        
        if (updatedProject.price) {
          setPrice(updatedProject.price);
        }
        
        if (updatedProject.customer) {
          setCustomer(updatedProject.customer);
        }
        
        const updatedLogs = await getProjectLogs(project.id, useMockData);
        setChanges(updatedLogs);
        
        console.log('✅ Изменения успешно сохранены!');
      } else {
        console.log('ℹ️ Нет изменений для сохранения');
      }
      
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTeamMember = () => {
    setShowAddPerformerModal(true);
    setStaffNameInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    loadStaffList();
  };

  const handleAddPerformerSubmit = async () => {
    const staffName = staffNameInput.trim();
    
    if (!staffName || !project) {
      alert('Введите ФИО сотрудника');
      return;
    }

    setAddingPerformer(true);
    
    try {
      const searchQuery = staffName.toLowerCase();
      const foundStaff = allStaff.find(staff => 
        staff.name.toLowerCase() === searchQuery ||
        staff.name.toLowerCase().includes(searchQuery)
      );
      
      if (!foundStaff) {
        alert(`Сотрудник "${staffName}" не найден. Проверьте правильность ввода ФИО.`);
        setAddingPerformer(false);
        return;
      }
      
      console.log(`Найден сотрудник: ${foundStaff.name}, ID: ${foundStaff.id}`);
      
      const newPerformer = await addPerformerToProject(project.id, parseInt(foundStaff.id), useMockData);
      
      console.log('Исполнитель добавлен:', newPerformer);
      
      setProject(prev => ({
        ...prev,
        team: [...(prev.team || []), {
          id: newPerformer.id,
          name: newPerformer.staff_name || foundStaff.name,
          role: newPerformer.staff_post || foundStaff.position || 'Исполнитель'
        }]
      }));
      
      const updatedLogs = await getProjectLogs(project.id, useMockData);
      setChanges(updatedLogs);
      
      setStaffNameInput('');
      setShowSuggestions(false);
      setShowAddPerformerModal(false);
      alert(`Исполнитель "${foundStaff.name}" успешно добавлен!`);
      
    } catch (error) {
      console.error('Ошибка добавления исполнителя:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setAddingPerformer(false);
    }
  };

  const handleAddFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !project) return;

    console.log('Загружаю файл:', file.name, file.size, file.type);
    setUploadingFile(true);

    try {
      const uploadedFile = await uploadFileToProject(project.id, file, useMockData);
      
      console.log('Файл загружен:', uploadedFile);
      
      setProject(prev => ({
        ...prev,
        files: [...(prev.files || []), uploadedFile]
      }));
      
      const updatedLogs = await getProjectLogs(project.id, useMockData);
      setChanges(updatedLogs);
      
      alert(`Файл "${file.name}" успешно загружен!`);
      
      event.target.value = null;
      
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert(`Ошибка загрузки файла: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadFile = async (file) => {
    if (!file.file) {
      alert('Ссылка на файл недоступна');
      return;
    }
    
    const fileUrl = file.file;
    const fileName = file.originalName || file.name || fileUrl.split('/').pop() || 'file.txt';
    
    try {
      const token = localStorage.getItem('access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NjU0NjU3LCJpYXQiOjE3NjY1NjgyNTcsImp0aSI6IjhkZmI1MmI2ZjhlNDRmMzAhZDJlOTdmMTA3N2RkYmY1IiwidXNlcl9pDCI6IjMifQ.FBGdiqMY1jzb7UTkV-urikB5pHbwu6an4zYJ-GQLzAw';
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки файла: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = 'none';
      a.setAttribute('download', fileName);
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`Файл скачан: ${fileName}`);
      
    } catch (error) {
      console.error('Ошибка скачивания файла через fetch:', error);
      
      try {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        a.style.display = 'none';
        a.setAttribute('download', fileName);
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        console.log(`Попытка скачивания через прямую ссылку: ${fileName}`);
      } catch (fallbackError) {
        console.error('Fallback метод тоже не сработал:', fallbackError);
        alert('Не удалось скачать файл. Попробуйте позже или обратитесь к администратору.');
      }
    }
  };

  const renderTeamAvatars = (team) => {
    if (!team || team.length === 0) {
      return <div className="team-avatars">Нет исполнителей</div>;
    }
    
    const maxVisible = 6;
    const visibleTeam = team.slice(0, maxVisible);
    const extraCount = team.length > maxVisible ? team.length - maxVisible : 0;

    return (
      <div className="team-avatars">
        {visibleTeam.map((member, index) => (
          <div key={member.id || index} className="avatar-wrapper" style={{ zIndex: maxVisible - index }}>
            {generateAvatar(member.name)}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="avatar extra-avatar">
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  const groupChangesByDate = () => {
    const grouped = {};
    changes.forEach(change => {
      const date = change.date.split(' ')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(change);
    });
    return grouped;
  };
  
  const loadProjectAndLogs = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const projectData = await getProjectById(parseInt(projectId), useMockData);
      console.log('Загружен проект:', projectData);
      
      setProject(projectData);
      setProjectName(projectData.name || 'Проект без названия');
      setStartDate(projectData.startDateFormatted || projectData.startDate || '');
      setDeadline(projectData.deadlineFormatted || projectData.deadline || '');
      setProjectType(projectData.typeLabel || projectData.type_display || projectData.type || '');
      setPrice(projectData.price || '');
      setCustomer(projectData.customer || '');
      
      const statusLabel = projectData.status_display || getStatusDisplay(projectData.status);
      setProjectStatus(statusLabel);
      
      const projectLogs = await getProjectLogs(parseInt(projectId), useMockData);
      console.log('Загружены логи:', projectLogs);
      setChanges(projectLogs);
      
      if (projectData.team) {
        const userInTeam = projectData.team.some(member => 
          member.name === currentUser
        );
        setIsUserInProject(userInTeam);
      }
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'Черновик',
      'active': 'Активный',
      'paused': 'Приостановлен',
      'tests': 'Тестирование',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || 'Черновик';
  };
  
  useEffect(() => {
    loadProjectAndLogs();
  }, [projectId, useMockData, currentUser]);

  if (isLoading) {
    return (
      <div className="projectcard-container">
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка карточки проекта...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем данные проекта
          </p>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="projectcard-container">
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Проект не найден</h4>
            <p>Запрошенный проект не существует или был удален</p>
            <button 
              onClick={() => navigate('/projects')}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Вернуться к списку проектов
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedChanges = groupChangesByDate();
  const sortedDates = Object.keys(groupedChanges).sort((a, b) => {
    const dateA = a.split('.').reverse().join('-');
    const dateB = b.split('.').reverse().join('-');
    return new Date(dateB) - new Date(dateA);
  });

  return (
    <div className="projectcard-container">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        disabled={uploadingFile}
      />
      
      <div className="projectcard-header">
        <h1 className="projectcard-title">
          <span 
            className="projects-link" 
            onClick={() => navigate('/projects')}
            style={{ cursor: 'pointer' }}
          >
            Проекты
          </span>
          {' — '}
          <span
          >
            {projectName}
          </span>
        </h1>
        <button 
          className="save-changes-btn" 
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

      <div className="projectcard-main-content">
        <div className="projectcard-layout">
          <div className="main-cards-section">
            <div className="top-row">
              <div className="projectcard-tile">
                <div className="date-item">
                  <span className="date-label">Начало проекта</span>
                  <span 
                    className="date-value1 editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setStartDate(e.target.textContent)}
                  >
                    {formatDateForDisplay(startDate)}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Дедлайн</span>
                  <span 
                    className="date-value deadline editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setDeadline(e.target.textContent)}
                  >
                    {formatDateForDisplay(deadline)}
                  </span>
                </div>
              </div>

              <div className="projectcard-tile">
                <div className="tile-header">
                  <h3>Исполнители</h3>
                  <button className="add-btn" onClick={handleAddTeamMember}>
                    + Добавить исполнителя
                  </button>
                </div>
                <div className="team-container">
                  {renderTeamAvatars(project.team)}
                </div>
                <div className="team-count">
                  Всего исполнителей: {project.team?.length || 0}
                </div>
              </div>
            </div>

            <div className="middle-row">
              <div className="projectcard-tile">
                <div className="info-item">
                  <span className="info-label">Тип проекта</span>
                  <span 
                    className="project-type1 editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setProjectType(e.target.textContent)}
                  >
                    {projectType || project.typeLabel || project.type_display || project.type || 'Не указан'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Бюджет проекта</span>
                  <span 
                    className="project-price editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setPrice(e.target.textContent)}
                  >
                    {formatPrice(price)}
                  </span>
                </div>
              </div>

              <div className="projectcard-tile">
                <h3>Заказчик</h3>
                <div className="customer-info">
                  <div className="customer-details">
                    <span 
                      className="customer-name editable" 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setCustomer(e.target.textContent)}
                    >
                      {customer}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bottom-row">
              <div className="projectcard-tile">
                <h3>Изменения</h3>
                <div className="changes-container">
                  {changes.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <span className="empty-text">История изменений будет отображаться здесь</span>
                    </div>
                  ) : (
                    <div className="changes-chat">
                      {sortedDates.map(date => (
                        <React.Fragment key={date}>
                          <div className="change-date-header">{date}</div>
                          {groupedChanges[date].map(change => {
                            const time = change.date.split(' ')[1];
                            return (
                              <div key={change.id} className="change-message">
                                <div className="change-content">{change.action}</div>
                                <div className="change-time">{time}</div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="projectcard-tile">
                <button 
                  className="action-btn kanban-btn" 
                  onClick={() => navigate(`/projects/${project.id}/kanban`)}
                >
                  Открыть канбан
                </button>
                <button 
                  className="action-btn gantt-btn" 
                  onClick={() => window.location.href = `/projects/${project.id}/gantt`}
                >
                  Диаграмма Ганта
                </button>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ - ДВЕ ОТДЕЛЬНЫЕ КАРТОЧКИ */}
          <div className="right-panel">
            {/* КАРТОЧКА СТАТУСА */}
            <div className="status-tile" ref={statusDropdownRef}>
              <div className="status-header">
                <h3 className="status-title">Статус проекта</h3>
              </div>
              
              <div className="status-dropdown-wrapper">
                <button 
                  className="status-current-btn"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span>{projectStatus}</span>
                  <span style={{ fontSize: '1.2vh', color: '#6C757D' }}>▼</span>
                </button>
                
                {showStatusDropdown && (
                  <div className="status-dropdown">
                    {statusOptions.map(option => (
                      <div 
                        key={option.value}
                        className="status-option"
                        onClick={() => handleStatusChange(option.label, option.apiValue)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* КАРТОЧКА ФАЙЛОВ */}
            <div className="files-tile">
              <div className="files-content">
                <div className="files-header">
                  <h3>Файлы проекта</h3>
                  <button 
                    className="add-btn" 
                    onClick={handleAddFile}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? 'Загрузка...' : '+ Загрузить файлы'}
                  </button>
                </div>
                <div className="files-list">
                  {project.files?.map(file => {
                    const fileName = file.name || file.originalName || (file.file ? file.file.split('/').pop() : 'Файл');
                    
                    return (
                      <div key={file.id} className="file-item">
                        <div className="file-details">
                          <span className="file-name" title={fileName}>
                            {fileName}
                          </span>
                          {file.uploaded_at && (
                            <span className="file-date">
                              {new Date(file.uploaded_at).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </div>
                        <button 
                          className="file-download" 
                          onClick={() => handleDownloadFile(file)}
                          title="Скачать файл"
                        >
                          ↓
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="files-count">
                  Всего файлов: {project.files?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddPerformerModal && (
        <div className="modal-overlay_projects_performers_create">
          <div className="modal-content_projects_performers_create">
            <div className="modal-header_projects_performers_create">
              <h2>Добавить исполнителя</h2>
              <button 
                className="modal-close_projects_performers_create"
                onClick={() => setShowAddPerformerModal(false)}
                disabled={addingPerformer}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body_projects_performers_create" ref={suggestionsRef}>
              <div className="form-group_projects_performers_create" style={{ position: 'relative' }}>
                <label>ФИО сотрудника *</label>
                <input
                  type="text"
                  value={staffNameInput}
                  onChange={handleStaffInputChange}
                  placeholder="Начните вводить ФИО сотрудника"
                  disabled={addingPerformer}
                  autoComplete="off"
                />
                <small>Введите имя и фамилию сотрудника. При вводе будут появляться подсказки.</small>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((staff, index) => (
                      <div 
                        key={staff.id || index}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => handleSuggestionClick(staff)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: '500' }}>{staff.name}</div>
                        {staff.position && (
                          <div style={{ fontSize: '12px', color: '#666' }}>{staff.position}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group_projects_performers_create">
                <p style={{ color: '#666', fontSize: '1.4vh' }}>
                  <strong>Примечание:</strong> Начните вводить ФИО сотрудника и выберите его из списка. 
                  После добавления сотрудник появится в команде проекта.
                </p>
              </div>
            </div>
            
            <div className="modal-footer_projects_performers_create">
              <button 
                className="btn-cancel_projects_performers_create"
                onClick={() => setShowAddPerformerModal(false)}
                disabled={addingPerformer}
              >
                Отмена
              </button>
              <button 
                className="btn-create_projects_performers_create"
                onClick={handleAddPerformerSubmit}
                disabled={addingPerformer}
              >
                {addingPerformer ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;