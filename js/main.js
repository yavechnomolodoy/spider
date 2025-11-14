var sim, spiderweb, spider;
var legIndex = 0;
var ti = 0;
var currentColorScheme = 0;
var colorSchemes = [
    ["#661111","#661111","#4D1A1A","#332222","#1A2B2B"],
    ["#116611","#116611","#1A4D1A","#223322","#2B1A2B"],
    ["#111166","#111166","#1A1A4D","#222233","#2B2B1A"],
    ["#661166","#661166","#4D1A4D","#332233","#1A2B1A"],
    ["#666611","#666611","#4D4D1A","#333322","#1A1A2B"]
];

function getColor(part) {
    var col = "#661111";
    
    if (ti >= 999) {
        ti = 0;
    }
    
    var ts = Math.floor(ti/100);
    var ta = 200 - ((ti%100) * 2);
    
    var scheme = colorSchemes[currentColorScheme];
    
    switch (part) {
        case 1: col = shadeColor(scheme[0], ta); break;
        case 2: col = shadeColor(scheme[1], ta); break;
        case 3: col = shadeColor(scheme[2], ta); break;
        case 4: col = shadeColor(scheme[3], ta); break;
        case 5: col = shadeColor(scheme[4], ta); break;
    }
    return col;
}

function initSimulation() {
    var canvas = document.getElementById("web");

    var viewport = getViewport();
    var width = viewport[0];
    var height = viewport[1];

    var dpr = 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.getContext("2d").scale(dpr, dpr);

    sim = new VerletJS(width, height, canvas);
    sim.showHighlight = false; // Отключаем белые кружки
    
    spiderweb = sim.spiderweb(new Vec2(width/2, height/2), Math.min(width, height)/2, 24, 8);
    spider = sim.spider(new Vec2(width/2, 50));    
    
    spiderweb.drawParticles = function(ctx, composite) {
        var i;
        for (i in composite.particles) {
            var point = composite.particles[i];
            var isPinned = composite.pinnedParticles && composite.pinnedParticles.indexOf(point) !== -1;
            
            ctx.beginPath();
            if (isPinned) {
                ctx.arc(point.pos.x, point.pos.y, 6, 0, 2*Math.PI);
                ctx.fillStyle = "#5af4f6";
                ctx.fill();
                ctx.strokeStyle = "#0a0a0a";
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.arc(point.pos.x, point.pos.y, 2, 0, 2*Math.PI);
                ctx.fillStyle = getColor(1);
                ctx.fill();
            }
        }
    }
        
    spider.drawConstraints = function(ctx, composite) {
        var i;

        ctx.beginPath();
        ctx.arc(spider.head.pos.x, spider.head.pos.y, 5, 0, 2*Math.PI);
        ctx.fillStyle = getColor(1);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(spider.thorax.pos.x, spider.thorax.pos.y, 5, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(spider.abdomen.pos.x, spider.abdomen.pos.y, 9, 0, 2*Math.PI);
        ctx.fill();
        
        for (i=3;i<composite.constraints.length;++i) {
            var constraint = composite.constraints[i];
            if (constraint instanceof DistanceConstraint) {
                ctx.beginPath();
                ctx.moveTo(constraint.a.pos.x, constraint.a.pos.y);
                ctx.lineTo(constraint.b.pos.x, constraint.b.pos.y);
                
                if (
                    (i >= 2 && i <= 4)
                    || (i >= (2*9)+1 && i <= (2*9)+2)
                    || (i >= (2*17)+1 && i <= (2*17)+2)
                    || (i >= (2*25)+1 && i <= (2*25)+2)
                ) {
                    ctx.save();
                    constraint.draw(ctx);
                    ctx.strokeStyle = getColor(2);
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.restore();
                } else if (
                    (i >= 4 && i <= 6)
                    || (i >= (2*9)+3 && i <= (2*9)+4)
                    || (i >= (2*17)+3 && i <= (2*17)+4)
                    || (i >= (2*25)+3 && i <= (2*25)+4)
                ) {
                    ctx.save();
                    constraint.draw(ctx);
                    ctx.strokeStyle = getColor(3);
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();
                } else if (
                    (i >= 6 && i <= 8)
                    || (i >= (2*9)+5 && i <= (2*9)+6)
                    || (i >= (2*17)+5 && i <= (2*17)+6)
                    || (i >= (2*25)+5 && i <= (2*25)+6)
                ) {
                    ctx.save();
                    ctx.strokeStyle = getColor(4);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.strokeStyle = getColor(5);
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    spider.drawParticles = function(ctx, composite) {
    }
}

function loop() {
    ti++;
    
    if (Math.floor(Math.random()*4) == 0) {
        sim.crawl(((legIndex++)*3)%8);
    }
    
    if (sim.draggedEntity) {
        var spiderweb = sim.composites[0];
        if (spiderweb && spiderweb.pinnedParticles) {
            var isDraggingPinned = spiderweb.pinnedParticles.indexOf(sim.draggedEntity) !== -1;
            if (isDraggingPinned) {
                sim.updatePinnedPositions();
            }
        }
    }
    
    sim.frame(16);
    sim.draw();
    requestAnimFrame(loop);
}

function handleResize() {
    var canvas = document.getElementById("web");
    var viewport = getViewport();
    var width = viewport[0];
    var height = viewport[1];

    canvas.width = width;
    canvas.height = height;
    
    if (sim) {
        sim.width = width;
        sim.height = height;
    }
}

window.onload = function() {
    initSimulation();
    loop();
    
    window.addEventListener('resize', handleResize);
    
    document.getElementById('resetBtn').addEventListener('click', function() {
        var canvas = document.getElementById("web");
        var viewport = getViewport();
        var width = viewport[0];
        var height = viewport[1];
        
        sim.composites = [];
        spiderweb = sim.spiderweb(new Vec2(width/2, height/2), Math.min(width, height)/2, 24, 8);
        spider = sim.spider(new Vec2(width/2, 50));
        
        spiderweb.drawParticles = function(ctx, composite) {
            var i;
            for (i in composite.particles) {
                var point = composite.particles[i];
                var isPinned = composite.pinnedParticles && composite.pinnedParticles.indexOf(point) !== -1;
                
                ctx.beginPath();
                if (isPinned) {
                    ctx.arc(point.pos.x, point.pos.y, 6, 0, 2*Math.PI);
                    ctx.fillStyle = "#5af4f6";
                    ctx.fill();
                    ctx.strokeStyle = "#0a0a0a";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    ctx.arc(point.pos.x, point.pos.y, 2, 0, 2*Math.PI);
                    ctx.fillStyle = getColor(1);
                    ctx.fill();
                }
            }
        }
            
        spider.drawConstraints = function(ctx, composite) {
            var i;

            ctx.beginPath();
            ctx.arc(spider.head.pos.x, spider.head.pos.y, 5, 0, 2*Math.PI);
            ctx.fillStyle = getColor(1);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(spider.thorax.pos.x, spider.thorax.pos.y, 5, 0, 2*Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(spider.abdomen.pos.x, spider.abdomen.pos.y, 9, 0, 2*Math.PI);
            ctx.fill();
            
            for (i=3;i<composite.constraints.length;++i) {
                var constraint = composite.constraints[i];
                if (constraint instanceof DistanceConstraint) {
                    ctx.beginPath();
                    ctx.moveTo(constraint.a.pos.x, constraint.a.pos.y);
                    ctx.lineTo(constraint.b.pos.x, constraint.b.pos.y);
                    
                    if (
                        (i >= 2 && i <= 4)
                        || (i >= (2*9)+1 && i <= (2*9)+2)
                        || (i >= (2*17)+1 && i <= (2*17)+2)
                        || (i >= (2*25)+1 && i <= (2*25)+2)
                    ) {
                        ctx.save();
                        constraint.draw(ctx);
                        ctx.strokeStyle = getColor(2);
                        ctx.lineWidth = 4;
                        ctx.stroke();
                        ctx.restore();
                    } else if (
                        (i >= 4 && i <= 6)
                        || (i >= (2*9)+3 && i <= (2*9)+4)
                        || (i >= (2*17)+3 && i <= (2*17)+4)
                        || (i >= (2*25)+3 && i <= (2*25)+4)
                    ) {
                        ctx.save();
                        constraint.draw(ctx);
                        ctx.strokeStyle = getColor(3);
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.restore();
                    } else if (
                        (i >= 6 && i <= 8)
                        || (i >= (2*9)+5 && i <= (2*9)+6)
                        || (i >= (2*17)+5 && i <= (2*17)+6)
                        || (i >= (2*25)+5 && i <= (2*25)+6)
                    ) {
                        ctx.save();
                        ctx.strokeStyle = getColor(4);
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        ctx.strokeStyle = getColor(5);
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                }
            }
        }
        
        spider.drawParticles = function(ctx, composite) {
        }
    });
    
    document.getElementById('colorBtn').addEventListener('click', function() {
        currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
    });
};
