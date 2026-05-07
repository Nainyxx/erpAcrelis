import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import './OperationsPage.css';
import './OperationsRequestPage.css';

function OperationsRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  if (!canAccessHub) {
    const staffId = localStorage.getItem('staff_id');
    if (staffId) {
      return <Navigate to={`/operations/finans/${staffId}`} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  const breadcrumb = (
    <nav className="projects-breadcrumb" aria-label="Навигация по разделам">
      <button
        type="button"
        className="projects-breadcrumb__home"
        onClick={() => navigate(`/projects${location.search || ''}`)}
      >
        Главная
      </button>
      <span className="projects-breadcrumb__sep" aria-hidden="true">
        {' '}
        /{' '}
      </span>
      <button
        type="button"
        className="projects-breadcrumb__home"
        onClick={() => navigate('/operations')}
      >
        Операции
      </button>
      <span className="projects-breadcrumb__sep" aria-hidden="true">
        {' '}
        /{' '}
      </span>
      <span className="projects-breadcrumb__current">Заявка</span>
    </nav>
  );

  return (
    <div className="operations-page operations-request-page">
      {breadcrumb}

      <section
        className="operations-page__panel operations-page__panel--filters"
        aria-label="Заявка"
      >
        <div className="operations-request-page__placeholder">
          Содержимое заявки — в разработке
        </div>
      </section>
    </div>
  );
}

export default OperationsRequestPage;
