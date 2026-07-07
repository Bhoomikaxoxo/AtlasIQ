import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Home, Calendar, Bookmark, Heart, Grid3X3,
  Sparkles, ChevronDown
} from 'lucide-react';
import './StaggeredMenu.css';

const NAV_ITEMS = [
  { key: 'explore', label: 'Explore', icon: <Home size={18} /> },
  { key: 'itinerary', label: 'Itinerary', icon: <Calendar size={18} /> },
  { key: 'bucket-list', label: 'Bucket List', icon: <Bookmark size={18} /> },
  { key: 'saved', label: 'Saved Places', icon: <Heart size={18} /> },
  { key: 'boards', label: 'Boards', icon: <Grid3X3 size={18} /> },
];

export const StaggeredMenu = ({
  position = 'left',
  colors = ['#7C3AED', '#14B8A6'], // Deep Purple & Teal to match theme
  activePage = 'explore',
  onNavigate,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#14B8A6', // Teal hover accent
  changeMenuColorOnOpen = true,
  isFixed = true,
  closeOnClickAway = true,
  displayItemNumbering = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const logoEl = panel.querySelector('.sm-panel-logo-wrap');
    const aiCard = panel.querySelector('.ai-assistant-card');
    const userRow = panel.querySelector('.sidebar-user-row');

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map(el => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 6 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (logoEl) gsap.set(logoEl, { opacity: 0, y: -15 });
    if (aiCard) gsap.set(aiCard, { opacity: 0, y: 20 });
    if (userRow) gsap.set(userRow, { opacity: 0, y: 15 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.45, ease: 'power3.out' }, i * 0.06);
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.06 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.07 : 0);
    const panelDuration = 0.55;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime
    );

    if (logoEl) {
      tl.to(logoEl, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, panelInsertTime + 0.15);
    }

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.2;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: { each: 0.08, from: 'start' }
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.5,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.06, from: 'start' }
          },
          itemsStart + 0.08
        );
      }
    }

    if (aiCard || userRow) {
      const footerStart = panelInsertTime + 0.35;
      if (aiCard) {
        tl.to(aiCard, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, footerStart);
      }
      if (userRow) {
        tl.to(userRow, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, footerStart + 0.08);
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.28,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 6 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const logoEl = panel.querySelector('.sm-panel-logo-wrap');
        const aiCard = panel.querySelector('.ai-assistant-card');
        const userRow = panel.querySelector('.sidebar-user-row');
        if (logoEl) gsap.set(logoEl, { opacity: 0, y: -15 });
        if (aiCard) gsap.set(aiCard, { opacity: 0, y: 20 });
        if (userRow) gsap.set(userRow, { opacity: 0, y: 15 });
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.3, ease: 'power2.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.1,
          duration: 0.25,
          ease: 'power2.out'
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.4 + lineCount * 0.05,
      ease: 'power3.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  return (
    <div
      className={`staggered-menu-wrapper ${isFixed ? 'fixed-wrapper' : ''}`}
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      {/* Background Stagger Layers */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      {/* Floating Burger Header */}
      <header className="staggered-menu-header" aria-label="Main navigation header">
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>
                  {l}
                </span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      {/* The Animated Panel */}
      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          
          {/* Logo */}
          <div className="sm-panel-logo-wrap">
            <div className="sidebar-compass-icon">
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path
                  d="M13 1 L14.5 11.5 L25 13 L14.5 14.5 L13 25 L11.5 14.5 L2 13 L11.5 11.5 Z"
                  fill="white" opacity="0.85"
                />
              </svg>
            </div>
            <span className="sidebar-wordmark">ATLAS IQ</span>
          </div>

          {/* Navigation Links */}
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {NAV_ITEMS.map((it, idx) => (
              <li className="sm-panel-itemWrap" key={it.key}>
                <a
                  className={`sm-panel-item ${activePage === it.key ? 'active' : ''}`}
                  href={`#/${it.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(it.key);
                    closeMenu();
                  }}
                  data-index={idx + 1}
                >
                  <span className="sm-panel-itemLabel">
                    {it.icon}
                    <span>{it.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* AI Assistant Teaser */}
          <div className="ai-assistant-card">
            <div className="ai-card-header">
              <Sparkles size={16} className="ai-sparkle" />
              <h4 className="ai-card-title">AI Travel Assistant</h4>
            </div>
            <p className="ai-card-body">
              Get personalized recommendations for your next adventure.
            </p>
            <button className="ai-ask-btn">Ask Atlas IQ</button>
          </div>

          {/* User Row */}
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">M</div>
            <span className="sidebar-username">Mika</span>
            <span className="sidebar-pro-badge">Pro</span>
            <ChevronDown size={14} className="sidebar-chevron" />
          </div>

        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
