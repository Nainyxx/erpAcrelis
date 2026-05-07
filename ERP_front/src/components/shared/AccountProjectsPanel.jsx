/**
 * Список проектов (аккаунт и карточка сотрудника): поиск, загрузка через getProjects,
 * строки с командой и переход в карточку проекта / профиль сотрудника.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getProjects, getStaffMediaUrl } from '../../services/api';

const SEARCH_DEBOUNCE_MS = 1500;

const STATUS_LABELS = {
    draft: 'Черновик',
    active: 'В работе',
    paused: 'Приостановлен',
    tests: 'Тестируется',
    completed: 'Завершен',
    cancelled: 'Отменен',
};

const AVATAR_BG = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];

function statusLabel(status) {
    if (status == null || status === '') return '—';
    return STATUS_LABELS[status] || status;
}

function ProjectMemberAvatarFace({ member, navigate }) {
    const displayName = member?.staff_name || member?.name || 'Исполнитель';
    const staffId = member?.staff ?? member?.id;
    const imageUrl =
        getStaffMediaUrl(member?.staff_image) || getStaffMediaUrl(member?.image_url) || null;

    let initials = 'И';
    try {
        const words = displayName.split(' ').filter((word) => word && word.length > 0);
        if (words.length >= 2) initials = `${words[0][0]}${words[words.length - 1][0]}`;
        else if (words.length === 1) initials = words[0][0];
    } catch (_) {
        initials = 'И';
    }

    const colorIndex =
        displayName.split('').reduce((acc, ch) => acc + (ch.charCodeAt(0) || 0), 0) % AVATAR_BG.length;
    const bg = AVATAR_BG[colorIndex];
    const canOpenStaff = staffId != null && staffId !== '';

    const onFaceClick = (e) => {
        e.stopPropagation();
        if (canOpenStaff) navigate(`/staff/${staffId}`);
    };

    const faceStyle = { backgroundColor: bg, cursor: canOpenStaff ? 'pointer' : 'default' };

    if (imageUrl) {
        return (
            <div
                className="account-projects-stack-inner"
                style={faceStyle}
                onClick={onFaceClick}
                title={canOpenStaff ? `Профиль: ${displayName}` : displayName}
            >
                <img
                    src={imageUrl}
                    alt=""
                    className="account-projects-stack-img"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        const fb = e.target.nextElementSibling;
                        if (fb) fb.style.display = 'flex';
                    }}
                />
                <span className="account-projects-stack-initials" style={{ display: 'none' }} aria-hidden="true">
                    {initials.toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <div
            className="account-projects-stack-inner account-projects-stack-inner--solid"
            style={faceStyle}
            onClick={onFaceClick}
            title={canOpenStaff ? `Профиль: ${displayName}` : displayName}
        >
            <span className="account-projects-stack-initials account-projects-stack-initials--visible" aria-hidden="true">
                {initials.toUpperCase()}
            </span>
        </div>
    );
}

function ProjectTeamAvatarStack({ team, navigate }) {
    const members = Array.isArray(team) ? team : [];

    if (members.length === 0) {
        return (
            <div className="account-projects-avatar-stack" aria-hidden="true">
                <div className="account-projects-stack-slot account-projects-stack-slot--first">
                    <div className="account-projects-stack-inner account-projects-stack-inner--placeholder" />
                </div>
            </div>
        );
    }

    const visible = members.slice(0, 3);
    const extraCount = members.length > 3 ? members.length - 3 : 0;

    return (
        <div className="account-projects-avatar-stack">
            {visible.map((member, index) => (
                <div
                    key={member?.id ?? member?.staff ?? index}
                    className={`account-projects-stack-slot${index === 0 ? ' account-projects-stack-slot--first' : ''}`}
                    style={{ zIndex: 3 - index }}
                >
                    <div className="account-projects-stack-face-wrap">
                        <ProjectMemberAvatarFace member={member} navigate={navigate} />
                        {extraCount > 0 && index === 2 && (
                            <span className="account-projects-avatar-more" title={`Ещё ${extraCount}`}>
                                +{extraCount}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * @param {{
 *   useMockData?: boolean;
 *   navigate: import('react-router-dom').NavigateFunction;
 *   headingId: string;
 *   searchInputId: string;
 * }} props
 */
export function AccountProjectsPanel({ useMockData = false, navigate, headingId, searchInputId }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const searchTimeoutRef = useRef(null);

    useEffect(
        () => () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        },
        []
    );

    const loadProjects = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const filters = {};
            const q = searchQuery.trim();
            if (q) filters.search = q;
            const result = await getProjects(useMockData, filters);
            setProjects(result.projects || []);
        } catch (_) {
            setFetchError('Не удалось загрузить проекты. Проверьте подключение.');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [useMockData, searchQuery]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => setSearchQuery(value), SEARCH_DEBOUNCE_MS);
    };

    const onSearchBlur = () => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (searchInput !== searchQuery) setSearchQuery(searchInput);
    };

    return (
        <section
            className="account-joint-projects-card account-projects-card"
            aria-labelledby={headingId}
        >
            <div className="account-projects-toolbar">
                <h3 id={headingId} className="account-projects-title">
                    Проекты
                </h3>
                <label className="account-projects-search-label" htmlFor={searchInputId}>
                    <span className="account-projects-search-icon-wrap" aria-hidden="true">
                        <svg
                            className="account-projects-search-svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                stroke="#8e9199"
                                strokeWidth="1.75"
                            />
                            <path
                                d="M16.5 16.5 21 21"
                                stroke="#8e9199"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>
                    <input
                        id={searchInputId}
                        type="search"
                        className="account-projects-search-input"
                        placeholder="Поиск"
                        value={searchInput}
                        onChange={onSearchChange}
                        onBlur={onSearchBlur}
                        aria-label="Поиск проектов"
                        autoComplete="off"
                    />
                </label>
            </div>
            <div className="account-projects-toolbar-divider" aria-hidden="true" />
            {fetchError ? (
                <p className="account-projects-fetch-error" role="alert">
                    {fetchError}
                </p>
            ) : null}
            <div className="account-projects-scroll-outer">
                {loading ? (
                    <p className="account-projects-loading">Загрузка проектов…</p>
                ) : (
                    <ul className="account-projects-list" role="list">
                        {projects.length === 0 ? (
                            <li className="account-projects-empty">Нет проектов</li>
                        ) : (
                            projects.map((project) => (
                                <li key={project.id} className="account-projects-item">
                                    <button
                                        type="button"
                                        className="account-projects-row-btn"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className="account-projects-col-avatars">
                                            <ProjectTeamAvatarStack team={project.team} navigate={navigate} />
                                        </div>
                                        <div className="account-projects-col-main">
                                            <span className="account-projects-name">{project.name || '—'}</span>
                                            <span className="account-projects-type">
                                                {project.typeLabel || '—'}
                                            </span>
                                        </div>
                                        <div className="account-projects-col-status">
                                            <span className="account-projects-status-label">Статус</span>
                                            <span className="account-projects-status-value">
                                                {statusLabel(project.status)}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </section>
    );
}
