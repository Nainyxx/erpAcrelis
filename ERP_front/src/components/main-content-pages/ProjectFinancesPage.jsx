import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProjectFinancesPage.css';

function ProjectFinancesPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="project-finances-page">
            <h1 className="project-finances-title">
                <span className="project-finances-crumb" onClick={() => navigate('/projects')}>
                    Проекты
                </span>
                {' — '}
                <span
                    className="project-finances-crumb"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    Проект
                </span>
                {' — Финансы'}
            </h1>

            <div className="project-finances-placeholder">
                <p>Раздел «Финансы» в разработке.</p>
            </div>
        </div>
    );
}

export default ProjectFinancesPage;
