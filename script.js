let tileSize = 105, px, py, pVel = 5, angle = 45, fov = 1;
let martix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let rays = [];

function start() {
    createCanvas(martix[0].length * tileSize * 2, martix.length * tileSize);

    px = martix[0].length * tileSize / 2;
    py = martix.length * tileSize / 2 + tileSize / 2;

    for (let i = -(fov / 2); i < fov / 2; i++) {
        rays.push(new Ray(px, py, i + angle));
    }
}

function update() {
    background("rgb(50,50,50)");
    drawBoard();
    drawPlayer();
    castRays();
}

function castRays() {
    for (let i = 0; i < fov; i++) {
        rays[i].update(px, py, i - fov / 2 + angle);
        rays[i].cast();
    }
}

function drawBoard() {
    stroke(6, 'gray');
    line(martix[0].length * tileSize, 0, martix[0].length * tileSize, martix.length * tileSize);

    stroke(2, 'gray');
    for (let rows = 0; rows < martix.length; rows++) {
        for (let columns = 0; columns < martix[0].length; columns++) {
            line(0, rows * tileSize, martix[0].length * tileSize, rows * tileSize);
            line(columns * tileSize, 0, columns * tileSize, martix.length * tileSize);

            if (martix[rows][columns] === 1) {
                fill('black');
                rect(columns * tileSize, rows * tileSize, tileSize, tileSize);
            }
        }
    }
}

function drawPlayer() {
    noStroke();
    fill('#ed174b');
    circle(px, py, 10);
}

function keyDown(key) {
    switch (key) {
        case ARROW_RIGHT: // D
            px += pVel;
            break;
        case ARROW_LEFT: // A
            px -= pVel;
            break;
        case ARROW_UP: // W
            py -= pVel;
            break;
        case ARROW_DOWN: // S
            py += pVel;
            break;
        case 65: //A
            angle += 1;
            if (angle > 360) angle = 1;
            break;
        case 68: //D
            angle -= 1;
            if (angle < 0) angle = 359;
            break;
    }
}

class Ray {
    constructor(_x, _y, _angle) {
        this.position = new Vector2(_x, _y);
        this.angle = _angle;
        this.direction = Vector2.angleToDirection(_angle);
    }

    update(_x, _y, _angle) {
        this.position.x = _x;
        this.position.y = _y;
        this.angle = _angle;
        this.direction = Vector2.angleToDirection(this.angle);
    }

    draw(finalX, finalY) {
        stroke(3, 'red');
        line(this.position.x, this.position.y,
            finalX, finalY);
    }

    cast() {
        // HORIZONTAL LINES

        let yPoint

        if (this.angle < 180) yPoint = Math.floor(this.position.y / tileSize) * tileSize; // LOOKING UP
        else yPoint = Math.ceil(this.position.y / tileSize) * tileSize; 

        noStroke(); fill('purple'); circle(this.position.x, yPoint, 5);

        let h = yPoint - this.position.y;

        noFill(); stroke(2, 'gray');
        circle(this.position.x, this.position.y, Math.abs(h));
        noStroke();

        let tangent = -1 / tan(angle) * h;

        fill('blue');
        circle(tangent + this.position.x, this.position.y, 5);

        // why ? ? ? ? ?
        //let inverseTangent = 1 / tan(angle);
        //let xPoint = h * inverseTangent;

        // xPoint is pased on the [0, 0] point, so to make it relative to the player position we should add its x pos
        //xPoint += this.position.x;

        //fill('blue'); circle(xPoint, yPoint, 5);

        return this.draw(this.position.x + this.direction.x * canvas.width, this.position.y + this.direction.y * canvas.width);
    }
}