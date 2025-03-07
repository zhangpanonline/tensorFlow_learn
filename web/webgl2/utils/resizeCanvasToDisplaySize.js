export function resizeCanvasToDisplaySize(canvas) {
    const displayW = canvas.clientWidth
    const displayH = canvas.clientHeight
    const needResize = canvas.width !== displayW || canvas.height !== displayH
    if (needResize) {
        canvas.width = displayW
        canvas.height = displayH
    }
    return needResize
}