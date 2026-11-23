OUTRO_OVERLAY = true;
window.renderAt = function (v) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); if (v < 0) phraseX(v, -(window.LP || 0), 0, window.LINES || []); else outro(v, 0, window.TAG || ''); return out.toDataURL('image/png'); };
