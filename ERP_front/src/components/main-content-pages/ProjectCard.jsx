import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProjectCard.css';
import { getProjectById, updateProject, uploadFileToProject, addPerformerToProject, getProjectLogs } from '../../services/api/api';

const ProjectCard = ({ useMockData }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectType, setProjectType] = useState('');
  const [price, setPrice] = useState('');
  const [customer, setCustomer] = useState('');
  const [changes, setChanges] = useState([]);
  const [isUserInProject, setIsUserInProject] = useState(false);
  const [currentUser] = useState('Иван Петров');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAddPerformerModal_projects_performers_create, setShowAddPerformerModal_projects_performers_create] = useState(false);
  const [staffId_projects_performers_create, setStaffId_projects_performers_create] = useState('');
  const [addingPerformer_projects_performers_create, setAddingPerformer_projects_performers_create] = useState(false);
  
  const fileInputRef = useRef(null);

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

  const handleSaveChanges = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updateData = {};
      
      const formattedProjectStartDate = formatDateForDisplay(project.startDate);
      if (startDate !== formattedProjectStartDate && startDate.trim() !== '') {
        updateData.start_date = startDate;
      }
      
      const formattedProjectDeadline = formatDateForDisplay(project.deadline);
      if (deadline !== formattedProjectDeadline && deadline.trim() !== '') {
        updateData.deadline = deadline;
      }
      
      if (projectType !== project.typeLabel && projectType !== project.type_display) {
        updateData.type = projectType;
      }
      
      if (price !== project.price) {
        updateData.price = price;
      }
      
      if (customer !== project.customer) {
        updateData.customer = customer;
      }
      
      console.log('Отправляемые данные:', updateData);
      
      if (Object.keys(updateData).length > 0) {
        const updatedProject = await updateProject(project.id, updateData, useMockData);
        console.log('Обновленный проект:', updatedProject);
        
        setProject(updatedProject);
        
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
        
        alert('Изменения сохранены!');
      } else {
        alert('Нет изменений для сохранения');
      }
      
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении изменений');
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoinProject = () => {
    if (!isUserInProject) {
      console.log('Пользователь добавлен в проект:', currentUser);
      setIsUserInProject(true);
      
      const newChange = {
        id: changes.length + 1,
        action: `${currentUser} присоединился к проекту`,
        date: new Date().toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setChanges([newChange, ...changes]);
      
      alert(`Вы присоединились к проекту "${project.name}"`);
    } else {
      console.log('Пользователь удален из проекта:', currentUser);
      setIsUserInProject(false);
      
      const newChange = {
        id: changes.length + 1,
        action: `${currentUser} покинул проект`,
        date: new Date().toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setChanges([newChange, ...changes]);
      
      alert(`Вы покинули проект "${project.name}"`);
    }
  };

  const handleAddTeamMember = () => {
    setShowAddPerformerModal_projects_performers_create(true);
  };

  const handleAddPerformerSubmit_projects_performers_create = async () => {
    if (!staffId_projects_performers_create.trim() || !project) {
      alert('Введите ID сотрудника');
      return;
    }

    setAddingPerformer_projects_performers_create(true);
    
    try {
      console.log(`Добавляю сотрудника ${staffId_projects_performers_create} в проект ${project.id}`);
      
      const newPerformer = await addPerformerToProject(project.id, parseInt(staffId_projects_performers_create), useMockData);
      
      console.log('Исполнитель добавлен:', newPerformer);
      
      setProject(prev => ({
        ...prev,
        team: [...(prev.team || []), {
          id: newPerformer.id,
          name: newPerformer.staff_name || `Сотрудник ${staffId_projects_performers_create}`,
          role: newPerformer.staff_post || 'Исполнитель'
        }]
      }));
      
      const updatedLogs = await getProjectLogs(project.id, useMockData);
      setChanges(updatedLogs);
      
      setStaffId_projects_performers_create('');
      setShowAddPerformerModal_projects_performers_create(false);
      alert('Исполнитель успешно добавлен!');
      
    } catch (error) {
      console.error('Ошибка добавления исполнителя:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setAddingPerformer_projects_performers_create(false);
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

  const handleDownloadFile = (file) => {
    if (!file.file) {
      alert('Ссылка на файл недоступна');
      return;
    }
    
    const fileUrl = file.file;
    const fileName = file.name || fileUrl.split('/').pop() || 'file.txt';
    
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.target = '_blank';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
    }, 10);
    
    console.log(`Скачивание файла: ${fileName}`);
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
      setStartDate(projectData.startDateFormatted || projectData.startDate || '');
      setDeadline(projectData.deadlineFormatted || projectData.deadline || '');
      setProjectType(projectData.typeLabel || projectData.type_display || projectData.type || '');
      setPrice(projectData.price || '');
      setCustomer(projectData.customer || '');
      
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
  
  useEffect(() => {
    loadProjectAndLogs();
  }, [projectId, useMockData, currentUser]);
  
  if (isLoading) {
    return (
      <div className="projectcard-container">
        <div style={{padding: '5vh', textAlign: 'center'}}>
          Загрузка проекта...
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="projectcard-container">
        <div style={{padding: '5vh', textAlign: 'center'}}>
          <h2>Проект не найден</h2>
          <button 
            onClick={() => navigate('/projects')}
            style={{
              padding: '1vh 2vh',
              background: '#0066CC',
              color: 'white',
              border: 'none',
              borderRadius: '0.4vh',
              cursor: 'pointer',
              marginTop: '2vh'
            }}
          >
            Вернуться к списку проектов
          </button>
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
      
      <div className="projectcard-buttons">
        <button 
          className="save-changes-btn" 
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

      <div className="projectcard-header">
        <h1 className="projectcard-title">
          <span 
            className="projects-link" 
            onClick={() => navigate('/projects')}
          >
            Проекты
          </span>
          {' — Карточка проекта'}
        </h1>
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

          <div className="files-panel">
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
                const fileName = file.name || (file.file ? file.file.split('/').pop() : 'Файл');
                return (
                  <div key={file.id} className="file-item">
                    <div className="file-details">
                      <span className="file-name" title={file.file}>
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

      {showAddPerformerModal_projects_performers_create && (
        <div className="modal-overlay_projects_performers_create">
          <div className="modal-content_projects_performers_create">
            <div className="modal-header_projects_performers_create">
              <h2>Добавить исполнителя</h2>
              <button 
                className="modal-close_projects_performers_create"
                onClick={() => setShowAddPerformerModal_projects_performers_create(false)}
                disabled={addingPerformer_projects_performers_create}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body_projects_performers_create">
              <div className="form-group_projects_performers_create">
                <label>ID сотрудника *</label>
                <input
                  type="number"
                  value={staffId_projects_performers_create}
                  onChange={(e) => setStaffId_projects_performers_create(e.target.value)}
                  placeholder="Введите ID сотрудника"
                  disabled={addingPerformer_projects_performers_create}
                  min="1"
                />
                <small>Укажите числовой ID сотрудника из системы</small>
              </div>
              
              <div className="form-group_projects_performers_create">
                <p style={{ color: '#666', fontSize: '1.4vh' }}>
                  <strong>Примечание:</strong> ID сотрудника можно получить из списка сотрудников.
                  После добавления сотрудник появится в команде проекта.
                </p>
              </div>
            </div>
            
            <div className="modal-footer_projects_performers_create">
              <button 
                className="btn-cancel_projects_performers_create"
                onClick={() => setShowAddPerformerModal_projects_performers_create(false)}
                disabled={addingPerformer_projects_performers_create}
              >
                Отмена
              </button>
              <button 
                className="btn-create_projects_performers_create"
                onClick={handleAddPerformerSubmit_projects_performers_create}
                disabled={addingPerformer_projects_performers_create}
              >
                {addingPerformer_projects_performers_create ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;