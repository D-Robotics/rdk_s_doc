import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useLocation } from '@docusaurus/router';

function computeBottomRight(textLength) {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }
  const collapsedWidth = 40;
  const collapsedHeight = Math.max(80, textLength * 15);
  return {
    x: window.innerWidth - collapsedWidth - 10,
    y: window.innerHeight - collapsedHeight - 10,
  };
}

export default function FeedbackFloat() {
  /** null = 尚未在浏览器中算过初始右下角，避免先画在 (0,0) 再动画到右下角 */
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isClick, setIsClick] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true); // 默认为收齐状态
  const [isDraggingStarted, setIsDraggingStarted] = useState(false); // 标记是否真正开始拖动
  const location = useLocation();
  const floatRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startFloatPosRef = useRef({ x: 0, y: 0 });

  // 控制哪些页面显示 - 包括所有文档页面
  const show = location.pathname.startsWith('/rdk_doc_filter/') || location.pathname.startsWith('/en/rdk_doc_filter/');

  // 限制拖动范围
  const clampPosition = useCallback((x, y, isCollapsedState, textLength) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // 根据文本长度计算浮标大小
    const floatWidth = isCollapsedState ? 40 : Math.max(100, textLength * 12); // 横排时根据文本长度计算宽度
    const floatHeight = isCollapsedState ? Math.max(80, textLength * 15) : 40; // 竖排时根据文本长度计算高度
    
    // 限制在窗口内
    const clampedX = Math.max(10, Math.min(x, windowWidth - floatWidth - 10));
    const clampedY = Math.max(10, Math.min(y, windowHeight - floatHeight - 10));
    
    return { x: clampedX, y: clampedY };
  }, []);

  // 检查是否靠近边缘，实现收齐效果
  const checkEdgeProximity = useCallback((x, y, textLength) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const edgeThreshold = 50;
    const collapsedWidth = 40;
    const collapsedHeight = Math.max(80, textLength * 15); // 根据文本长度计算竖排高度
    const expandedSize = Math.max(100, textLength * 12); // 根据文本长度计算横排宽度
    
    // 检查是否靠近左边缘
    if (x < edgeThreshold) {
      setIsCollapsed(true);
      return { x: 10, y };
    }
    
    // 检查是否靠近右边缘
    if (windowWidth - x - expandedSize < edgeThreshold) {
      setIsCollapsed(true);
      return { x: windowWidth - collapsedWidth - 10, y };
    }
    
    // 检查是否靠近下边缘
    if (windowHeight - y - 40 < edgeThreshold) {
      setIsCollapsed(true);
      return { x: windowWidth - collapsedWidth - 10, y: windowHeight - collapsedHeight - 10 };
    }
    
    setIsCollapsed(false);
    return { x, y };
  }, []);

  // 根据当前路径检测语言
  const isEnglish = location.pathname.includes('/en/');
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
        // 计算鼠标移动距离
        const deltaX = Math.abs(e.clientX - startPosRef.current.x);
        const deltaY = Math.abs(e.clientY - startPosRef.current.y);
        
        // 如果移动距离超过 5px，认为是真正的拖动
        if (deltaX > 5 || deltaY > 5) {
          if (!isDraggingStarted) {
            setIsDraggingStarted(true);
            // 水平方向拖动超过一定距离时展开
            if (deltaX > 10) {
              setIsCollapsed(false);
            }
          }
          
          e.preventDefault(); // 防止拖动时选中文本
          setIsClick(false); // 拖动时标记为非点击
          
          let newX, newY;
          
          if (isCollapsed && deltaX <= 10) {
            // 收齐状态且水平拖动距离较小时，只允许上下拖动
            newX = startFloatPosRef.current.x;
            newY = startFloatPosRef.current.y + (e.clientY - startPosRef.current.y);
          } else {
            // 展开状态或水平拖动距离较大时，允许自由拖动
            newX = startFloatPosRef.current.x + (e.clientX - startPosRef.current.x);
            newY = startFloatPosRef.current.y + (e.clientY - startPosRef.current.y);
          }
          
          // 限制拖动范围
          const clampedPos = clampPosition(newX, newY, isCollapsed && deltaX <= 10, textLength);
          
          // 检查边缘收齐
          const finalPos = checkEdgeProximity(clampedPos.x, clampedPos.y, textLength);
          
          setPos(finalPos);
        }
      }
    };
    
    const up = () => {
      setDragging(false);
      setIsDraggingStarted(false);
      // 重置点击状态，以便下次点击
      setTimeout(() => setIsClick(true), 100);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    // 窗口大小变化时重新计算位置
    const handleResize = () => {
      setPos(computeBottomRight(textLength));
      setIsCollapsed(true); // 窗口大小变化时自动收齐
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
    e.preventDefault(); // 防止选中文本
    setDragging(true);
    setIsClick(true); // 初始化为点击
    setIsDraggingStarted(false); // 重置拖动开始标记
    // 记录鼠标起始位置
    startPosRef.current = { x: e.clientX, y: e.clientY };
    // 记录浮标起始位置
    startFloatPosRef.current = { ...pos };
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isClick && !isDraggingStarted) {
      // 只有当不是拖动时才打开反馈页面
      window.open('https://github.com/liqinglian01/rdk_doc_filter/issues', '_blank');
      // 点击时保持收齐状态
    }
  };

  // 根据文本长度计算浮标大小
  const collapsedWidth = 40;
  const collapsedHeight = Math.max(80, textLength * 15); // 竖排时根据文本长度计算高度
  const expandedWidth = Math.max(100, textLength * 12); // 横排时根据文本长度计算宽度
  const expandedHeight = 40;

  return (
    <div
      ref={floatRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        cursor: dragging ? 'grabbing' : 'grab',
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        color: '#fff',
        width: isCollapsed ? collapsedWidth : expandedWidth,
        height: isCollapsed ? collapsedHeight : expandedHeight,
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
        // 勿对 left/top 使用 transition，否则路由切换或 setPos 时会出现「从左上角滑到右下角」
        transition: 'width 0.3s ease, height 0.3s ease',
        userSelect: 'none', // 防止选中文本
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        // 确保浮标始终可见
        transform: 'translateZ(0)',
        outline: 'none',
        // 添加悬停效果
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
      title={feedbackText}
    >
      <span style={{ 
        fontSize: '14px', 
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        writingMode: isCollapsed ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: 'upright',
        lineHeight: isCollapsed ? '20px' : '1',
        padding: isCollapsed ? '5px' : '0',
      }}>
        {feedbackText}
      </span>
    </div>
  );
}
