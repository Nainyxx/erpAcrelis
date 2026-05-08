import React, { useLayoutEffect, useRef, useState } from 'react';
import './AvatarPhoto.css';

/**
 * Avatar image with shimmer until loaded; cached images handled via img.complete.
 */
export function AvatarPhoto({
  src,
  alt = '',
  imgClassName = '',
  crossOrigin,
  onError: onErrorProp,
}) {
  const [phase, setPhase] = useState('loading'); // loading | loaded | error
  const imgRef = useRef(null);
  const onErrorPropRef = useRef(onErrorProp);
  onErrorPropRef.current = onErrorProp;

  useLayoutEffect(() => {
    if (!src) return undefined;

    const img = imgRef.current;
    if (!img) return undefined;

    setPhase('loading');

    const markLoaded = () => setPhase('loaded');

    const markError = (e) => {
      onErrorPropRef.current?.(e);
      setPhase('error');
    };

    if (img.complete && img.naturalHeight > 0) {
      markLoaded();
      return undefined;
    }

    img.addEventListener('load', markLoaded);
    img.addEventListener('error', markError);
    return () => {
      img.removeEventListener('load', markLoaded);
      img.removeEventListener('error', markError);
    };
  }, [src]);

  if (!src) {
    return null;
  }

  if (phase === 'error') {
    return null;
  }

  return (
    <span className="avatar-photo" aria-hidden={alt ? undefined : true}>
      <span
        className={`avatar-photo__skeleton${phase === 'loaded' ? ' is-hidden' : ''}`}
        aria-hidden="true"
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`avatar-photo__img${phase === 'loaded' ? '' : ' is-pending'}${imgClassName ? ` ${imgClassName}` : ''}`}
        crossOrigin={crossOrigin}
        decoding="async"
      />
    </span>
  );
}
