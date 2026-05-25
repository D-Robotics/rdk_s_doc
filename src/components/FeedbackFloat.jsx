import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import styles from './FeedbackFloat.module.css';

const FLOAT_COLLAPSED_LINE_HEIGHT = 22;
const FLOAT_COLLAPSED_PADDING = 8;
const FLOAT_COLLAPSED_WIDTH = 46;
const FLOAT_EXPANDED_HEIGHT = 44;
const FLOAT_EDGE_OFFSET = 10;
const FEEDBACK_FLOAT_ID = 'feedback-float-entry';

function computeBottomRight(textLength) {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }
  const collapsedWidth = FLOAT_COLLAPSED_WIDTH;
  const collapsedHeight = computeCollapsedHeight(textLength);
  return {
    x: window.innerWidth - collapsedWidth - FLOAT_EDGE_OFFSET,
    y: window.innerHeight - collapsedHeight - FLOAT_EDGE_OFFSET,
  };
}

function notifyAssistantReposition() {
  if (typeof window !== 'undefined' && typeof window.repositionDifyChatbot === 'function') {
    window.repositionDifyChatbot();
    window.setTimeout(() => {
      window.repositionDifyChatbot?.();
    }, 300);
  }
}

function FeedbackIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function computeCollapsedHeight(textLength) {
  return Math.max(
    118,
    textLength * FLOAT_COLLAPSED_LINE_HEIGHT + FLOAT_COLLAPSED_PADDING * 2 + 28,
  );
}

function normalizePath(path) {
  if (!path) return '/';
  const normalized = path.replace(/\/+$/, '');
  return normalized || '/';
}

function resolveSitePath(pathname, baseUrl) {
  const normalizedPathname = normalizePath(pathname);
  const normalizedBaseUrl = normalizePath(baseUrl || '/');

  if (normalizedBaseUrl === '/') {
    return normalizedPathname;
  }
  if (normalizedPathname === normalizedBaseUrl) {
    return '/';
  }
  if (normalizedPathname.startsWith(`${normalizedBaseUrl}/`)) {
    return normalizedPathname.slice(normalizedBaseUrl.length);
  }
  return normalizedPathname;
}

function matchRule(path, rule) {
  const normalizedPath = normalizePath(path);
  const normalizedRule = normalizePath(rule);

  if (normalizedRule === '/*') return true;

  if (normalizedRule.endsWith('/*')) {
    const prefix = normalizedRule.slice(0, -2);
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  }

  return normalizedPath === normalizedRule;
}

function matchesAnyRule(path, rules) {
  if (!Array.isArray(rules) || rules.length === 0) return false;
  return rules.some((rule) => typeof rule === 'string' && matchRule(path, rule));
}

export default function FeedbackFloat() {
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isClick, setIsClick] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);
  const { siteConfig, i18n } = useDocusaurusContext();
  const location = useLocation();
  const floatRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startFloatPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const feedbackCfg = siteConfig.customFields?.feedbackFloat || {};
  const localeSurveyUrl =
    feedbackCfg.questionnaireUrlByLocale &&
    typeof feedbackCfg.questionnaireUrlByLocale === 'object'
      ? feedbackCfg.questionnaireUrlByLocale[i18n.currentLocale]
      : '';
  const fallbackSurveyUrl =
    typeof feedbackCfg.questionnaireUrl === 'string'
      ? feedbackCfg.questionnaireUrl
      : '';
  const surveyUrl =
    typeof localeSurveyUrl === 'string' && localeSurveyUrl.trim()
      ? localeSurveyUrl.trim()
      : fallbackSurveyUrl.trim();
  const sitePath = useMemo(
    () => resolveSitePath(location.pathname, siteConfig.baseUrl),
    [location.pathname, siteConfig.baseUrl],
  );
  const showRules = Array.isArray(feedbackCfg.showOnPathRules) && feedbackCfg.showOnPathRules.length > 0
    ? feedbackCfg.showOnPathRules
    : ['/', '/en'];
  const hideRules = Array.isArray(feedbackCfg.hideOnPathRules) ? feedbackCfg.hideOnPathRules : [];
  const show =
    feedbackCfg.enabled !== false &&
    matchesAnyRule(sitePath, showRules) &&
    !matchesAnyRule(sitePath, hideRules);

  const clampPosition = useCallback((x, y, isCollapsedState, textLength) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const floatWidth = isCollapsedState ? FLOAT_COLLAPSED_WIDTH : Math.max(132, textLength * 14 + 48);
    const floatHeight = isCollapsedState ? computeCollapsedHeight(textLength) : FLOAT_EXPANDED_HEIGHT;

    const clampedX = Math.max(FLOAT_EDGE_OFFSET, Math.min(x, windowWidth - floatWidth - FLOAT_EDGE_OFFSET));
    const clampedY = Math.max(
      FLOAT_EDGE_OFFSET,
      Math.min(y, windowHeight - floatHeight - FLOAT_EDGE_OFFSET),
    );

    return { x: clampedX, y: clampedY };
  }, []);

  const checkEdgeProximity = useCallback((x, y, textLength) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const edgeThreshold = 50;
    const collapsedWidth = FLOAT_COLLAPSED_WIDTH;
    const collapsedHeight = computeCollapsedHeight(textLength);
    const expandedSize = Math.max(132, textLength * 14 + 48);

    if (x < edgeThreshold) {
      setIsCollapsed(true);
      return { x: FLOAT_EDGE_OFFSET, y };
    }

    if (windowWidth - x - expandedSize < edgeThreshold) {
      setIsCollapsed(true);
      return { x: windowWidth - collapsedWidth - FLOAT_EDGE_OFFSET, y };
    }

    if (windowHeight - y - FLOAT_EXPANDED_HEIGHT < edgeThreshold) {
      setIsCollapsed(true);
      return {
        x: windowWidth - collapsedWidth - FLOAT_EDGE_OFFSET,
        y: window.innerHeight - collapsedHeight - FLOAT_EDGE_OFFSET,
      };
    }

    setIsCollapsed(false);
    return { x, y };
  }, []);

  const isEnglish = i18n.currentLocale === 'en';
  const feedbackText = isEnglish ? 'Feedback' : '意见反馈';
  const textLength = feedbackText.length;

  useLayoutEffect(() => {
    if (!show || typeof window === 'undefined') {
      return;
    }
    setPos(computeBottomRight(textLength));
  }, [show, textLength]);

  useEffect(() => {
    const move = (e) => {
      if (dragging) {
        const deltaX = Math.abs(e.clientX - startPosRef.current.x);
        const deltaY = Math.abs(e.clientY - startPosRef.current.y);

        if (deltaX > 5 || deltaY > 5) {
          hasDraggedRef.current = true;
          if (!isDraggingStarted) {
            setIsDraggingStarted(true);
            if (deltaX > 10) {
              setIsCollapsed(false);
            }
          }

          e.preventDefault();
          setIsClick(false);

          let newX;
          let newY;

          if (isCollapsed && deltaX <= 10) {
            newX = startFloatPosRef.current.x;
            newY = startFloatPosRef.current.y + (e.clientY - startPosRef.current.y);
          } else {
            newX = startFloatPosRef.current.x + (e.clientX - startPosRef.current.x);
            newY = startFloatPosRef.current.y + (e.clientY - startPosRef.current.y);
          }

          const clampedPos = clampPosition(newX, newY, isCollapsed && deltaX <= 10, textLength);
          const finalPos = checkEdgeProximity(clampedPos.x, clampedPos.y, textLength);

          setPos(finalPos);
        }
      }
    };

    const up = () => {
      if (hasDraggedRef.current && floatRef.current) {
        floatRef.current.dataset.userPositioned = 'true';
      }
      hasDraggedRef.current = false;
      setDragging(false);
      setIsDraggingStarted(false);
      setTimeout(() => setIsClick(true), 100);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    const handleResize = () => {
      const userPositioned = floatRef.current?.dataset.userPositioned === 'true';
      if (!userPositioned) {
        setPos(computeBottomRight(textLength));
        setIsCollapsed(true);
        notifyAssistantReposition();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('resize', handleResize);
    };
  }, [dragging, clampPosition, checkEdgeProximity, isDraggingStarted, isCollapsed, textLength]);

  if (!show) return null;
  if (pos == null) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    hasDraggedRef.current = false;
    setDragging(true);
    setIsClick(true);
    setIsDraggingStarted(false);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startFloatPosRef.current = { ...pos };
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isClick && !isDraggingStarted) {
      if (surveyUrl) {
        window.open(surveyUrl, '_blank');
      }
    }
  };

  const collapsedWidth = FLOAT_COLLAPSED_WIDTH;
  const collapsedHeight = computeCollapsedHeight(textLength);
  const expandedWidth = Math.max(132, textLength * 14 + 48);
  const expandedHeight = FLOAT_EXPANDED_HEIGHT;

  return (
    <div
      id={FEEDBACK_FLOAT_ID}
      ref={floatRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={clsx(
        styles.float,
        isCollapsed ? styles.floatCollapsed : styles.floatExpanded,
        dragging && styles.floatDragging,
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: isCollapsed ? collapsedWidth : expandedWidth,
        height: isCollapsed ? collapsedHeight : expandedHeight,
      }}
      title={feedbackText}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && surveyUrl) {
          e.preventDefault();
          window.open(surveyUrl, '_blank');
        }
      }}
    >
      <FeedbackIcon className={styles.icon} />
      <span
        className={clsx(styles.text, isCollapsed && styles.textCollapsed)}
      >
        {feedbackText}
      </span>
    </div>
  );
}
