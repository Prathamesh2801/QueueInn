import React, { useEffect, useRef, useCallback, useMemo } from 'react';

const DEFAULT_BEHIND_GRADIENT =
    'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)';
const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, p = 3) => parseFloat(v.toFixed(p));
const adjust = (v, fMin, fMax, tMin, tMax) =>
    round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));
const easeInOutCubic = x =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const ProfileCard = React.memo(({
    waitingNumber = 1,
    progress = 0,
    statusText = 'Waiting',
    contactText = 'Play Now',
    onContactClick,
    behindGradient,
    innerGradient,
    showBehindGradient = true,
    enableTilt = true,
    enableMobileTilt = true,
    mobileTiltSensitivity = 3,
}) => {
    const wrapRef = useRef(null);
    const cardRef = useRef(null);

    const animation = useMemo(() => {
        if (!enableTilt) return null;
        let rafId = null;
        const update = (offX, offY, card, wrap) => {
            const { clientWidth: w, clientHeight: h } = card;
            const px = clamp((100 / w) * offX);
            const py = clamp((100 / h) * offY);
            const cx = px - 50;
            const cy = py - 50;

            const props = {
                '--pointer-x': `${px}%`,
                '--pointer-y': `${py}%`,
                '--background-x': `${adjust(px, 0, 100, 35, 65)}%`,
                '--background-y': `${adjust(py, 0, 100, 35, 65)}%`,
                '--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50)}`,
                '--pointer-from-top': `${py / 100}`,
                '--pointer-from-left': `${px / 100}`,
                '--rotate-x': `${round(-(cx / 5))}deg`,
                '--rotate-y': `${round(cy / 4)}deg`,
            };
            Object.entries(props).forEach(([k, v]) => wrap.style.setProperty(k, v));
        };

        const smooth = (dur, sx, sy, card, wrap) => {
            const start = performance.now();
            const targetX = wrap.clientWidth / 2;
            const targetY = wrap.clientHeight / 2;
            const loop = now => {
                const elapsed = now - start;
                const p = clamp(elapsed / dur);
                const e = easeInOutCubic(p);
                const curX = adjust(e, 0, 1, sx, targetX);
                const curY = adjust(e, 0, 1, sy, targetY);
                update(curX, curY, card, wrap);
                if (p < 1) rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
        };

        return {
            update,
            smooth,
            cancel: () => rafId && cancelAnimationFrame(rafId),
        };
    }, [enableTilt]);

    const onMove = useCallback(e => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!animation || !card || !wrap) return;
        const rect = card.getBoundingClientRect();
        animation.update(e.clientX - rect.left, e.clientY - rect.top, card, wrap);
    }, [animation]);

    const onEnter = useCallback(() => {
        const c = cardRef.current, w = wrapRef.current;
        if (!animation || !c || !w) return;
        animation.cancel();
        w.classList.add('active'); c.classList.add('active');
    }, [animation]);

    const onLeave = useCallback(e => {
        const c = cardRef.current, w = wrapRef.current;
        if (!animation || !c || !w) return;
        animation.smooth(600, e.offsetX, e.offsetY, c, w);
        w.classList.remove('active'); c.classList.remove('active');
    }, [animation]);

    const onDevice = useCallback(evt => {
        const c = cardRef.current, w = wrapRef.current;
        if (!animation || !c || !w) return;
        const { beta, gamma } = evt;
        animation.update(
            c.clientHeight / 2 + gamma * mobileTiltSensitivity,
            c.clientWidth / 2 + (beta - 20) * mobileTiltSensitivity,
            c, w
        );
    }, [animation, mobileTiltSensitivity]);

    useEffect(() => {
        if (!animation) return;
        const c = cardRef.current;
        const w = wrapRef.current;
        if (!c || !w) return;
        c.addEventListener('pointerenter', onEnter);
        c.addEventListener('pointermove', onMove);
        c.addEventListener('pointerleave', onLeave);
        c.addEventListener('click', () => {
            if (!enableMobileTilt) return;
            if (DeviceMotionEvent.requestPermission) {
                DeviceMotionEvent.requestPermission()
                    .then(s => s === 'granted' && window.addEventListener('deviceorientation', onDevice))
                    .catch(console.error);
            } else window.addEventListener('deviceorientation', onDevice);
        });

        const initX = w.clientWidth - 70;
        const initY = 60;
        animation.update(initX, initY, c, w);
        animation.smooth(1500, initX, initY, c, w);

        return () => {
            c.removeEventListener('pointerenter', onEnter);
            c.removeEventListener('pointermove', onMove);
            c.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('deviceorientation', onDevice);
            animation.cancel();
        };
    }, [animation, onEnter, onMove, onLeave, onDevice, enableMobileTilt]);



    const styleVars = useMemo(() => ({
        '--behind-gradient': showBehindGradient ? (behindGradient || DEFAULT_BEHIND_GRADIENT) : 'none',
        '--inner-gradient': innerGradient || DEFAULT_INNER_GRADIENT,
    }), [behindGradient, innerGradient, showBehindGradient]);



    return (
        <div
            ref={wrapRef}
            className="relative perspective-[500px] rounded-[var(--card-radius)] overflow-hidden"
            style={styleVars}
        >
            <div
                ref={cardRef}
                className="h-[60svh] max-h-[400px] aspect-[0.75] bg-[image:var(--behind-gradient)] shadow-lg rounded-[var(--card-radius)] transition-transform"
            >
                {/* Inner gradient + content */}
                <div className="absolute inset-1 bg-[image:var(--inner-gradient)] bg-black/70 rounded-[var(--card-radius)] p-6 flex flex-col items-center text-white">
                    <div className="text-6xl font-bold mb-4">{waitingNumber}</div>
                    <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-sm opacity-80 mb-4">{statusText}</div>
                    <button
                        onClick={onContactClick}
                        className="mt-auto px-5 py-2 bg-blue-600 rounded-full text-white font-medium hover:bg-blue-700"
                    >
                        {contactText}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ProfileCard;