import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProjectCard.css';
import { getProjectById, updateProject, uploadFileToProject, addPerformerToProject, getProjectLogs, getStaffList } from '../../services/api/api';

const ProjectCard = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // Константы с ограничениями по количеству символов
  const CUSTOMER_NAME_MAX_LENGTH = 20; // Максимум 20 символов для заказчика
  const PROJECT_TYPE_MAX_LENGTH = 20;  // Максимум 20 символов для типа проекта
  
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectType, setProjectType] = useState('');
  const [price, setPrice] = useState('');
  const [customer, setCustomer] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [changes, setChanges] = useState([]);
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

  const generateAvatar = (member) => {
    // Получаем данные из API формата
    const name = member?.staff_name || member?.name || 'Исполнитель';
    
    // Получаем изображение из staff_image (поле из API)
    let imageUrl = null;
    if (member?.staff_image) {
      // staff_image содержит относительный путь, добавляем base URL
      imageUrl = `https://api.acrelis.ru/media/${member.staff_image}`;
    }
    
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    
    // Безопасное получение инициалов
    let initials = '';
    try {
      const words = name.split(' ').filter(word => word && word.length > 0);
      if (words.length >= 2) {
        initials = words[0][0] + words[words.length - 1][0];
      } else if (words.length === 1) {
        initials = words[0][0];
      } else {
        initials = 'И';
      }
    } catch (error) {
      console.error('Ошибка при получении инициалов:', error);
      initials = 'И';
    }
    
    const colorIndex = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) || 0), 0) % colors.length;
    
    if (imageUrl) {
      return (
        <div className="projectcard-avatar" style={{ 
          backgroundColor: colors[colorIndex], 
          position: 'relative',
          width: '4vh',
          height: '4vh',
          borderRadius: '50%',
          overflow: 'hidden'
        }}>
          <img 
            src={imageUrl} 
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            onError={(e) => {
              console.log('Ошибка загрузки аватарки для', name, 'URL:', imageUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="avatar-initials"
            style={{
              display: 'none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.4vh',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            {initials}
          </div>
        </div>
      );
    }
    
    return (
      <div className="projectcard-avatar" style={{ 
        backgroundColor: colors[colorIndex],
        width: '4vh',
        height: '4vh',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: '1.4vh'
      }}>
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
      
      // После обновления статуса делаем новый GET запрос
      await loadProjectAndLogs();
      
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
        await updateProject(project.id, updateData, useMockData);
        
        // После сохранения делаем новый GET запрос для обновления данных
        await loadProjectAndLogs();
        
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
      
      await addPerformerToProject(project.id, parseInt(foundStaff.id), useMockData);
      
      // После добавления исполнителя делаем новый GET запрос
      await loadProjectAndLogs();
      
      setStaffNameInput('');
      setShowSuggestions(false);
      setShowAddPerformerModal(false);
      
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
      await uploadFileToProject(project.id, file, useMockData);
      
      // После загрузки файла делаем новый GET запрос
      await loadProjectAndLogs();
      
      
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
      const token = localStorage.getItem('access_token');
      
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
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error('Ошибка скачивания файла через fetch:', error);
      
      try {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
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
            {generateAvatar(member)}
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
      const date = change.date?.split(' ')[0] || '';
      if (date) {
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(change);
      }
    });
    return grouped;
  };
  
  const loadProjectAndLogs = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Загружаем проект ID:', projectId);
      
      // Делаем GET запрос к API
      const projectData = await getProjectById(parseInt(projectId), useMockData);
      console.log('✅ Загружен проект:', projectData);
      
      // Используем performers из API
      const performers = projectData.performers || [];
      console.log('Исполнители проекта (performers):', performers);
      
      // Преобразуем performers в team для совместимости
      const team = performers.map(performer => ({
        id: performer.id,
        name: performer.staff_name || 'Исполнитель',
        staff_name: performer.staff_name || 'Исполнитель',
        staff_image: performer.staff_image
      }));
      
      console.log('Преобразованный team:', team);
      
      setProject({
        ...projectData,
        team: team
      });
      
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
      
    } catch (error) {
      console.error('❌ Ошибка загрузки проекта:', error);
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
  }, [projectId, useMockData]);

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
          <span>
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
                  {renderTeamAvatars(project.performers || [])}
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
                    onKeyDown={(e) => {
                      // Проверяем, если текст уже 20 символов и не нажата клавиша удаления
                      const currentText = e.target.textContent;
                      if (currentText.length >= PROJECT_TYPE_MAX_LENGTH && 
                          e.key !== 'Backspace' && 
                          e.key !== 'Delete' &&
                          e.key !== 'ArrowLeft' &&
                          e.key !== 'ArrowRight' &&
                          e.key !== 'ArrowUp' &&
                          e.key !== 'ArrowDown' &&
                          e.key !== 'Tab') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const currentText = e.target.textContent;
                      const newText = currentText + pastedText;
                      if (newText.length <= PROJECT_TYPE_MAX_LENGTH) {
                        document.execCommand('insertText', false, pastedText);
                      }
                    }}
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
                      onKeyDown={(e) => {
                        // Проверяем, если текст уже 20 символов и не нажата клавиша удаления
                        const currentText = e.target.textContent;
                        if (currentText.length >= CUSTOMER_NAME_MAX_LENGTH && 
                            e.key !== 'Backspace' && 
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight' &&
                            e.key !== 'ArrowUp' &&
                            e.key !== 'ArrowDown' &&
                            e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const currentText = e.target.textContent;
                        const newText = currentText + pastedText;
                        if (newText.length <= CUSTOMER_NAME_MAX_LENGTH) {
                          document.execCommand('insertText', false, pastedText);
                        }
                      }}
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
                            const time = change.date?.split(' ')[1] || '';
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

          <div className="right-panel">
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