import { Navigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import './OperationsPage.css';
import './OperationsRequestPage.css';
import { Breadcrumbs } from '../shared/Breadcrumbs';

function OperationsRequestPage() {
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  if (!canAccessHub) {
    const staffId = localStorage.getItem('staff_id');
    if (staffId) {
      return <Navigate to={`/operations/finans/${staffId}`} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  const breadcrumbItems = [
    { label: 'Главная', to: '/projects', preserveSearch: true },
    { label: 'Операции', to: '/operations' },
    { label: 'Заявка' },
  ];

  return (
    <div className="operations-page operations-request-page">
      <Breadcrumbs items={breadcrumbItems} />

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
