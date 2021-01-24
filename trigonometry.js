const TILE = 150, COLUMNS = 6;
let px, py, angle = 0;

function start(){
    createCanvas(COLUMNS * TILE, COLUMNS * TILE);
    px = py = COLUMNS * TILE / 2;
}

function update(){
    background('#232020');

    for(let i = 1; i < COLUMNS; i++){
        stroke(5, '#5a5858');
        line(0, i * TILE, canvas.width, i * TILE);
        line(i * TILE, 0, i * TILE, canvas.height);
    }

    const rayDir = Vector2.angleToDirection(angle);

    stroke(3, '#d75b5b');
    noFill();
    line(px, py, rayDir.x * canvas.width + px, rayDir.y * canvas.width + py);

    noStroke();
    fill('#ddc9b4');
    circle(px, py, 10);

    checkPoints();
} 

function checkPoints(){
    lookingUp = angle < 180;
    const hy = lookingUp ? py - TILE : py + TILE;

    // Radius circle
    stroke(3, '#918f8f');
    noFill();
    circle(px, py, TILE);

    noStroke();

    // hy point
    fill('#eb9a44'); circle(px, hy, 10); 

    // tangent point
    fill('#2ac355'); circle(tan(angle) * TILE + px, py, 8);

    // intersect point x
    const ix = lookingUp ? 1 / tan(angle) * TILE + px : -1 / tan(angle) * TILE + px;
    fill('#e3b945'); circle(ix, hy, 10);

    fill('#5eb1b7'); circle(ix, px, 8);

    // distance from px to ix
    const dx = Math.abs(px - ix);

    // oposite intersection x is not necessary considering py is in the bondary of an horizontal line   
}

function keyDown(key) {
    if(key === 65) { // A
        angle++;
        if(angle > 360) angle = 1;
    }else if(key === 68) { // D
        angle--;
        if(angle < 0) angle = 359;
    }
}