
export const init = (orientationChange = ()=>{}, deviceOrientation = ()=>{}, deviceMotion = ()=>{}) => {
    
    let foundOrientation = true

    window.addEventListener("orientationchange", orientationChange, true);

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", deviceOrientation, true);
        foundOrientation = true
    }
    
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', deviceMotion, true)
    }

    return foundOrientation
}

// export function handleOrientation(event) {
//     socket.on('disconnect', () => $("#display").html("Disconnected"));
//     socket.emit('orientation', {
//         alpha:event.alpha, 
//         beta:event.beta, 
//         gamma:event.gamma, 
//         }
//     );
//     $("#display").html("Connection established");
//     var absolute = event.absolute;
//     var alpha    = event.alpha;
//     var beta     = event.beta;
//     var gamma    = event.gamma;

//     $("#x").html("alpha: " + (alpha - 180));
//     $("#y").html("beta: " + beta);
//     $("#z").html("gamma: " + (-gamma));
//     $("#alpha").html("alpha: " + absolute);
// }

// export function orientationChange(event) {
//     socket.emit('screenrotation', {direction:window.orientation});
//     $("#orientation").html("orientation:" + window.orientation);
    
// }

// export function handleMotion(event) {
//     var rotationRate = [event.DeviceRotationRate.alpha, event.DeviceRotationRate.beta, event.DeviceRotationRate.gamma];
//     $("#motion").html( rotationRate );
// }