import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './ProjectCard.css';
import uploadCloudIcon from '../../assets/download-files.svg';
import trashcanIcon from '../../assets/trashcan.svg';
import { getProjectById, updateProject, uploadFileToProject, addPerformerToProject, getProjectLogs, getStaffList } from '../../services/api/api';
import { deleteProjectFileById, downloadProjectFile } from '../../services/api/projectsApi';
import { PROJECT_ACTIONS_ALLOWED_ROLES } from '../../constants/roles';

const ProjectCard = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const navigateToProjectsPreservingQuery = useCallback(() => {
    navigate(`/projects${location.search || ''}`);
  }, [navigate, location.search]);

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
  const [projectHours, setProjectHours] = useState('');
  const [projectHoursDone, setProjectHoursDone] = useState('0');
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
  const userRole = localStorage.getItem('role');
  const canManageProjectActions = PROJECT_ACTIONS_ALLOWED_ROLES.includes(userRole);

  // Обновленные статусы согласно требованиям
  const statusOptions = [
    { value: 'draft', label: 'Черновик', apiValue: 'draft' },
    { value: 'active', label: 'В работе', apiValue: 'active' },
    { value: 'paused', label: 'Приостановлен', apiValue: 'paused' },
    { value: 'tests', label: 'Тестируется', apiValue: 'tests' },
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
    const staffId = member?.staff || member?.id; // Получаем ID сотрудника

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
      initials = 'И';
    }

    const colorIndex = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) || 0), 0) % colors.length;

    // Обработчик клика по аватарке
    const handleAvatarClick = (e) => {
      e.stopPropagation(); // Предотвращаем всплытие клика
      if (staffId) {
        navigate(`/staff/${staffId}`);
      }
    };

    const avatarContent = () => {
      if (imageUrl) {
        return (
          <>
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
          </>
        );
      }

      return initials.toUpperCase();
    };

    return (
      <div
        className="projectcard-avatar_project_card"
        style={{
          backgroundColor: colors[colorIndex],
          position: 'relative',
          width: '4vh',
          height: '4vh',
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: staffId ? 'pointer' : 'default',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onClick={handleAvatarClick}
        onMouseEnter={(e) => {
          if (staffId) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (staffId) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }
        }}
        title={staffId ? `Перейти к ${name}` : name}
      >
        {avatarContent()}
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

      const updateData = { status: statusApiValue };

      const updatedProject = await updateProject(project.id, updateData, useMockData);


      // После обновления статуса делаем новый GET запрос
      await loadProjectAndLogs();

      setShowStatusDropdown(false);


    } catch (error) {
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
          updateData.start_date = `${year}-${month}-${day}`;
        } else {
          updateData.start_date = startDate;
        }
      }

      const formattedProjectDeadline = formatDateForDisplay(project.deadline);
      if (deadline !== formattedProjectDeadline && deadline.trim() !== '' && deadline !== 'Не указана') {
        if (deadline.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [day, month, year] = deadline.split('.');
          updateData.deadline = `${year}-${month}-${day}`;
        } else {
          updateData.deadline = deadline;
        }
      }

      if (projectType !== project.type_display && projectType.trim() !== '') {
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

      if (projectHours !== project.hours && projectHours.trim() !== '') {
        const hoursNum = parseInt(projectHours);
        if (!isNaN(hoursNum)) {
          updateData.hours = hoursNum;
        }
      }


      if (Object.keys(updateData).length > 0) {
        await updateProject(project.id, updateData, useMockData);

        // После сохранения делаем новый GET запрос
        await loadProjectAndLogs();

      } else {
      }

    } catch (error) {
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


      await addPerformerToProject(project.id, parseInt(foundStaff.id), useMockData);

      // После добавления исполнителя делаем новый GET запрос
      await loadProjectAndLogs();

      setStaffNameInput('');
      setShowSuggestions(false);
      setShowAddPerformerModal(false);

    } catch (error) {
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

  const uploadProjectFile = useCallback(async (file) => {
    if (!file || !project) return;

    setUploadingFile(true);

    try {
      await uploadFileToProject(project.id, file, useMockData);

      // После загрузки файла делаем новый GET запрос
      await loadProjectAndLogs();


    } catch (error) {
      alert(`Ошибка загрузки файла: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  }, [project, useMockData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    await uploadProjectFile(file);
    event.target.value = null;
  };

  const onProjectFileDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    await uploadProjectFile(acceptedFiles[0]);
  }, [uploadProjectFile]);

  const {
    getRootProps: getProjectDropzoneRootProps,
    getInputProps: getProjectDropzoneInputProps,
    isDragActive: isProjectFileDragActive
  } = useDropzone({
    onDrop: onProjectFileDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    disabled: uploadingFile || !canManageProjectActions
  });

  const handleDownloadFile = async (file) => {
    if (!file.file) {
      alert('Ссылка на файл недоступна');
      return;
    }

    const fileUrl = file.file;
    const fileName = file.originalName || file.name || fileUrl.split('/').pop() || 'file.txt';

    try {
      const blob = await downloadProjectFile(fileUrl);
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
        alert('Не удалось скачать файл. Попробуйте позже или обратитесь к администратору.');
      }
    }
  };

  const handleDeleteFile = async (file) => {
    if (!file?.id) {
      alert('Не удалось определить файл для удаления');
      return;
    }

    const fileName = file.name || file.originalName || 'этот файл';
    const isConfirmed = window.confirm(`Удалить файл "${fileName}"?`);

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteProjectFileById(file.id);

      await loadProjectAndLogs();
    } catch (error) {
      alert('Не удалось удалить файл. Попробуйте позже.');
    }
  };

  const renderTeamAvatars = (team) => {
    if (!team || team.length === 0) {
      return (
        <div className="team-avatars_project_card" style={{
          color: '#888',
          fontSize: '14px',
          textAlign: 'center',
          padding: '10px'
        }}>
          Нет исполнителей
        </div>
      );
    }

    const maxVisible = 6;
    const visibleTeam = team.slice(0, maxVisible);
    const extraCount = team.length > maxVisible ? team.length - maxVisible : 0;

    return (
      <div className="team-avatars_project_card" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '-12px',
        flexWrap: 'wrap'
      }}>
        {visibleTeam.map((member, index) => (
          <div
            key={member.id || index}
            className="avatar-wrapper_project_card"
            style={{
              zIndex: maxVisible - index,
              position: 'relative'
            }}
          >
            {generateAvatar(member)}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className="avatar extra-avatar_project_card"
            style={{
              width: '4vh',
              height: '4vh',
              borderRadius: '50%',
              backgroundColor: '#6C757D',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4vh',
              fontWeight: 600,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginLeft: '-8px',
              cursor: 'default'
            }}
            title={`Ещё ${extraCount} исполнителей`}
          >
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

      // Делаем GET запрос к API
      const projectData = await getProjectById(parseInt(projectId), useMockData);

      // Используем performers из API
      const performers = projectData.performers || [];

      // Преобразуем performers в team для совместимости
      const team = performers.map(performer => ({
        id: performer.id,
        staff: performer.staff, // Добавляем ID сотрудника
        name: performer.staff_name || 'Исполнитель',
        staff_name: performer.staff_name || 'Исполнитель',
        staff_image: performer.staff_image
      }));


      setProject({
        ...projectData,
        team: team,
        performers: performers // Сохраняем оригинальный массив
      });

      setProjectName(projectData.name || 'Проект без названия');
      setStartDate(projectData.startDateFormatted || projectData.startDate || '');
      setDeadline(projectData.deadlineFormatted || projectData.deadline || '');
      setProjectType(projectData.type_display || projectData.typeLabel || projectData.type || '');
      setPrice(projectData.price || '');
      setCustomer(projectData.customer || '');
      setProjectHours(projectData.hours?.toString() || '0');
      setProjectHoursDone(projectData.hoursDone?.toString() || '0');

      const statusLabel = projectData.status_display || getStatusDisplay(projectData.status);
      setProjectStatus(statusLabel);

      const projectLogs = await getProjectLogs(parseInt(projectId), useMockData);
      setChanges(projectLogs);

    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'Черновик',
      'active': 'В работе',
      'paused': 'Приостановлен',
      'tests': 'Тестируется',
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
      <div className="projectcard-container_project_card">
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
      <div className="projectcard-container_project_card">
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Проект не найден</h4>
            <p>Запрошенный проект не существует или был удален</p>
            <button
              onClick={navigateToProjectsPreservingQuery}
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
    <div className="projectcard-container_project_card">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        disabled={uploadingFile}
      />

      <div className="projectcard-header_project_card">
        <h1 className="projectcard-title_project_card">
          <span
            className="projects-link_project_card"
            onClick={navigateToProjectsPreservingQuery}
            style={{ cursor: 'pointer' }}
          >
            Проекты
          </span>
          {' — '}
          <span>
            {projectName}
          </span>
        </h1>
        {canManageProjectActions && (
          <button
            className="save-changes-btn_project_card"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        )}
      </div>

      <div className="projectcard-main-content_project_card">
        <div className="projectcard-layout_project_card">
          <div className="main-cards-section_project_card">
            <div className="top-row_project_card">
              <div className="projectcard-tile_project_card">
                <div className="project-dates-hours-grid_project_card">
                  <div className="project-dates-column_project_card">
                    <div className="date-item_project_card">
                      <span className="date-label_project_card">Начало проекта</span>
                      <span
                        className="date-value1_project_card editable_project_card"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setStartDate(e.target.textContent)}
                      >
                        {formatDateForDisplay(startDate)}
                      </span>
                    </div>
                    <div className="date-item_project_card">
                      <span className="date-label_project_card">Дедлайн</span>
                      <span
                        className="date-value_project_card deadline_project_card editable_project_card"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setDeadline(e.target.textContent)}
                      >
                        {formatDateForDisplay(deadline)}
                      </span>
                    </div>
                  </div>
                  <div className="project-hours-column_project_card">
                    <div className="date-item_project_card">
                      <span className="date-label_project_card">Выделено:</span>
                      <span className="date-value1_project_card">{projectHours || '0'} ч</span>
                    </div>
                    <div className="date-item_project_card">
                      <span className="date-label_project_card">Использовано:</span>
                      <span className="date-value_project_card deadline_project_card">{projectHoursDone || '0'} ч</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="projectcard-tile_project_card performers-tile_project_card">
                <div className="performers-header_project_card">
                  <h3>Исполнители</h3>
                  {canManageProjectActions && (
                    <button
                      type="button"
                      className="performers-add-btn_project_card"
                      onClick={handleAddTeamMember}
                      aria-label="Добавить исполнителя"
                      title="Добавить исполнителя"
                    >
                      <span className="performers-add-icon_project_card" aria-hidden="true">+</span>
                    </button>
                  )}
                </div>
                <div className="performers-body_project_card">
                  <div className="team-container_project_card performers-team-container_project_card">
                    {renderTeamAvatars(project.performers || project.team || [])}
                  </div>
                </div>
                {/* <button
                  type="button"
                  className="performers-schedule-btn_project_card"
                  onClick={() => navigate('/schedule')}
                >
                  График
                </button> */}
              </div>
            </div>

            <div className="middle-row_project_card">
              <div className="projectcard-tile_project_card">
                <div className="info-item_project_card">
                  <span className="info-label_project_card">Часы на проект</span>
                  <span
                    className="project-hours_project_card editable_project_card"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setProjectHours(e.target.textContent)}
                  >
                    {projectHours || '0'}
                  </span>
                </div>
                <div className="info-item_project_card">
                  <span className="info-label_project_card">Бюджет проекта</span>
                  <span
                    className="project-price_project_card editable_project_card"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setPrice(e.target.textContent)}
                  >
                    {formatPrice(price)}
                  </span>
                </div>
              </div>

              <div className="projectcard-tile_project_card">
                <div className="customer-section_project_card">
                  <h3>Заказчик</h3>
                  <div className="customer-info_project_card">
                    <div className="customer-details_project_card">
                      <span
                        className="customer-name_project_card editable_project_card"
                        contentEditable
                        suppressContentEditableWarning
                        onKeyDown={(e) => {
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
                <div className="type-section_project_card">
                  <h1 className="info-label_project_card">Тип проекта</h1>
                  <span
                    className="project-type_project_card editable_project_card"
                    contentEditable
                    suppressContentEditableWarning
                    onKeyDown={(e) => {
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
                    {projectType || project.type_display || project.typeLabel || project.type || 'Не указан'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bottom-row_project_card">
              <div className="projectcard-tile_project_card">
                <h3>Изменения</h3>
                <div className="changes-container_project_card">
                  {changes.length === 0 ? (
                    <div className="empty-state_project_card">
                      <span className="empty-icon_project_card">📋</span>
                      <span className="empty-text_project_card">История изменений будет отображаться здесь</span>
                    </div>
                  ) : (
                    <div className="changes-chat_project_card">
                      {sortedDates.map(date => (
                        <React.Fragment key={date}>
                          <div className="change-date-header_project_card">{date}</div>
                          {groupedChanges[date].map(change => {
                            const time = change.date?.split(' ')[1] || '';
                            return (
                              <div key={change.id} className="change-message_project_card">
                                <div className="change-content_project_card">{change.action}</div>
                                <div className="change-time_project_card">{time}</div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="projectcard-tile_project_card">
                <button
                  className="action-btn_project_card kanban-btn_project_card"
                  onClick={() => navigate(`/kanban/${project.id}`)}
                >
                  Открыть канбан
                </button>
                <button
                  className="action-btn_project_card gantt-btn_project_card"
                  onClick={() => navigate(`/gantt/${project.id}`)}
                >
                  Диаграмма Ганта
                </button>
                {canManageProjectActions && (
                  <button
                    type="button"
                    className="action-btn_project_card finances-btn_project_card"
                    onClick={() => navigate(`/projects/finans/${project.id}`)}
                  >
                    Финансы
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="right-panel_project_card">
            <div className="status-tile_project_card" ref={statusDropdownRef}>
              <div className="status-header_project_card">
                <h3 className="status-title_project_card">Статус проекта</h3>
              </div>

              <div className="status-dropdown-wrapper_project_card">
                <button
                  className="status-current-btn_project_card"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span>{projectStatus}</span>
                  <span style={{ fontSize: '1.2vh', color: '#6C757D' }}>▼</span>
                </button>

                {showStatusDropdown && (
                  <div className="status-dropdown_project_card">
                    {statusOptions.map(option => (
                      <div
                        key={option.value}
                        className="status-option_project_card"
                        onClick={() => handleStatusChange(option.label, option.apiValue)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`files-tile_project_card ${isProjectFileDragActive ? 'files-drop-active_project_card' : ''}`}
              {...getProjectDropzoneRootProps()}
            >
              <input {...getProjectDropzoneInputProps()} />
              <div className="files-content_project_card">
                <div className="files-header_project_card">
                  <h3>Файлы проекта</h3>
                </div>
                <div className="files-list_project_card">
                  {project.files?.map(file => {
                    const fileName = file.name || file.originalName || (file.file ? file.file.split('/').pop() : 'Файл');

                    return (
                      <div
                        key={file.id}
                        className="file-item_project_card"
                        onClick={() => handleDownloadFile(file)}
                        title="Скачать файл"
                      >
                        <div className="file-details_project_card">
                          <span className="file-name_project_card" title={fileName}>
                            {fileName}
                          </span>
                          {file.uploaded_at && (
                            <span className="file-date_project_card">
                              {new Date(file.uploaded_at).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </div>
                        <button
                          className="file-download_project_card"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                          title="Удалить файл"
                        >
                          <img src={trashcanIcon} alt="Удалить файл" className="file-delete-icon_project_card" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="files-count_project_card">
                  Всего файлов: {project.files?.length || 0}
                </div>
                {canManageProjectActions && (
                  <div className={`files-drop-hint_project_card ${isProjectFileDragActive ? 'is-active_project_card' : ''}`}>
                    <img
                      src={uploadCloudIcon}
                      alt="Загрузка файлов"
                      className="files-drop-icon_project_card"
                    />
                    <div className="files-drop-or_project_card">ИЛИ</div>
                    <button
                      type="button"
                      className="files-drop-btn_project_card"
                      onClick={handleAddFile}
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? 'Загрузка...' : 'Загрузить файлы'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddPerformerModal && (
        <div className="modal-overlay_projects_performers_create_project_card">
          <div className="modal-content_projects_performers_create_project_card">
            <div className="modal-header_projects_performers_create_project_card">
              <h2>Добавить исполнителя</h2>
              <button
                className="modal-close_projects_performers_create_project_card"
                onClick={() => setShowAddPerformerModal(false)}
                disabled={addingPerformer}
              >
                ×
              </button>
            </div>

            <div className="modal-body_projects_performers_create_project_card" ref={suggestionsRef}>
              <div className="form-group_projects_performers_create_project_card" style={{ position: 'relative' }}>
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

              <div className="form-group_projects_performers_create_project_card">
                <p style={{ color: '#666', fontSize: '1.4vh' }}>
                  <strong>Примечание:</strong> Начните вводить ФИО сотрудника и выберите его из списка.
                  После добавления сотрудник появится в команде проекта.
                </p>
              </div>
            </div>

            <div className="modal-footer_projects_performers_create_project_card">
              <button
                className="btn-cancel_projects_performers_create_project_card"
                onClick={() => setShowAddPerformerModal(false)}
                disabled={addingPerformer}
              >
                Отмена
              </button>
              <button
                className="btn-create_projects_performers_create_project_card"
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