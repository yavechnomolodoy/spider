function getViewport() {
    return [window.innerWidth, window.innerHeight];
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function shadeColor(color, shade) {
    var colorInt = parseInt(color.substring(1),16);

    var R = (colorInt & 0xFF0000) >> 16;
    var G = (colorInt & 0x00FF00) >> 8;
    var B = (colorInt & 0x0000FF) >> 0;

    R = R + Math.floor((shade/255)*R);
    G = G + Math.floor((shade/255)*G);
    B = B + Math.floor((shade/255)*B);

    var newColorInt = (R<<16) + (G<<8) + (B);
    var newColorStr = "#"+newColorInt.toString(16);

    return newColorStr;
}
