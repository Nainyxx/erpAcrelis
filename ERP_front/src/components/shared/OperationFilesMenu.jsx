import { useEffect, useRef, useState } from 'react';
import { MOCK_OPERATION_FILE_DOWNLOAD_URL } from '../../MockData/operationsPageMock';
import { downloadProjectFile } from '../../services/api';
import './OperationFilesMenu.css';

async function downloadOperationAttachmentFile(displayFileName) {
  const fileUrl = MOCK_OPERATION_FILE_DOWNLOAD_URL;
  const safeName =
    displayFileName?.trim() ||
    decodeURIComponent(fileUrl.split('/').pop() || '').split('?')[0] ||
    'file';

  try {
    const blob = await downloadProjectFile(fileUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = safeName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 100);
  } catch {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = safeName;
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch {
      alert('Не удалось скачать файл. Попробуйте позже или обратитесь к администратору.');
    }
  }
}

function FolderIcon() {
  return (
    <svg
      className="operation-files-menu__svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OperationFilesMenu({ files, itemKeyPrefix, ariaLabel }) {
  const [filesOpen, setFilesOpen] = useState(false);
  const wrapRef = useRef(null);

  const list = files?.length ? files : [];

  useEffect(() => {
    if (!filesOpen) return undefined;

    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFilesOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFilesOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filesOpen]);

  if (list.length === 0) return null;

  return (
    <div className="operation-files-menu__wrap" ref={wrapRef}>
      <button
        type="button"
        className="operation-files-menu__trigger"
        aria-label={ariaLabel}
        aria-expanded={filesOpen}
        aria-haspopup="menu"
        onClick={(e) => {
          e.stopPropagation();
          setFilesOpen((v) => !v);
        }}
      >
        <FolderIcon />
      </button>
      {filesOpen ? (
        <div className="operation-files-menu__popover" role="menu">
          {list.map((f, fileIndex) => (
            <button
              key={`${itemKeyPrefix}-file-${fileIndex}-${f.name}`}
              type="button"
              role="menuitem"
              className="operation-files-menu__item"
              onClick={() => {
                downloadOperationAttachmentFile(f.name);
                setFilesOpen(false);
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
