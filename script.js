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

        let angle = this.angle;

        let yPoint

        if (angle < 180) { // LOOKING UP
            // find the closest point from `this.pos.y` to an horizontal line
            // since looking up use `Math.floor` not `Math.round`
            yPoint = Math.floor(this.position.y / tileSize) * tileSize;
        } else {
            // if looking down check the closest point from `this.pos.y` to an horizontal line !after the player
            yPoint = Math.ceil(this.position.y / tileSize) * tileSize;
        }

        noStroke(); fill('purple'); circle(this.position.x, yPoint, 5);

        // now find the x point where the ray intersects on the line on y `yPoint`

        // distance between player position and `yPoint`
        // since looking up yPoint will alwways be > than this.position.y
        // so it should come first to prevent negative values
        let h = yPoint - this.position.y;

        // why ? ? ? ? ?
        let inverseTangent = -1 / tan(angle);
        let xPoint = h * inverseTangent;

        // xPoint is pased on the [0, 0] point, so to make it relative to the player position we should add its x pos
        xPoint += this.position.x;

        fill('blue'); circle(xPoint, yPoint, 5);

        // now we need to find the triangle inseted into the grid cell that we'll use as ofset for the next points
        // we already have one point of this triangle, xPoint
        // the other one is  xPoint but in the other horizontal side of the grid the player is in
        // if looking up the side is xPoint + tileSide else xPoint - tileSide
        let offsetTriangleRightAngleSide = yPoint < this.position.y ? yPoint + tileSize : yPoint - tileSize;

        fill('green'); circle(xPoint, offsetTriangleRightAngleSide, 5);

        // one of the cathetus is simply tileSide, but we need the other one to calculate the final point
        // now to discover the other cathetus of this `Offset Triangle` we need its angle that is equal to the ray angle
        // so the cos of this angle is this cathetus

        //let secondCathetusSide = cos(angle);

        // multiply by the radius of the trigonometric circle
        // but it radius is = to the hipotenus os the triangle
        // we have one side (one cathetus) and three angle

        //let tirdAngle = 180 - (angle + 90);

        // one way to avoid the cosine and calculating the hipotenuse if to use triangle similarity
        // since we have one of the cathetus side (offsetTriangleRightAngleSide) we can compare it with the initial ray triangle
        // the big triangle cathetus side is = ( yPoint - offsetTriangleRightAngleSide )
        let bigCathetus = yPoint - offsetTriangleRightAngleSide;
        // the small one is = h
        // the smail triangle down cathetus is = this.position.x - xPoint
        let smallDownCathetus = this.position.x - xPoint;
        // the relation ship is bigCathetus / h = x / smallDownCathetus
        // x = bigCathetus / h * smallDownCathetus

        let secondCathetusSide = bigCathetus / h * smallDownCathetus;

        // the final point is the `xPoint` - `secondCathetusSide`
        let offsetTriangleOpositePoint = xPoint + secondCathetusSide;

        fill('cyan'); circle(offsetTriangleOpositePoint, offsetTriangleRightAngleSide, 5);

        // YOU CAN ALSO CAST RAY OPOSITE TO THE CURRENT AND DISCOVER WERE IT INTERSECTS WITH THE OPPOSITE HORIZONTAL LINE

        // now we need to check the squares along the ray and if it intersecs with a wall tile
        // to do that we define a offset based on the triangle we calculated

        // if point up offset should be negative
        let xOffset = yPoint < this.position.y ? -secondCathetusSide : secondCathetusSide;
        let yOffset = yPoint < this.position.y ? -tileSize: tileSize;

        //let topTrianglePoint = new Vector2(offsetTriangleOpositePoint, offsetTriangleRightAngleSide);

        for (let i = 0; i < martix[0].length; i++) {
            const boardIndexX = Math.floor( (xPoint + xOffset * i) / tileSize);
            let boardIndexY = Math.floor( (yPoint + yOffset * i) / tileSize);

            if(yPoint < this.position.y) boardIndexY -= 1;
            else boardIndexY += 1;

            const boardGlobalPosX = boardIndexX * tileSize;
            const boardGlobalPosY = boardIndexY * tileSize;

            try{
                let tile = martix[boardIndexY][boardIndexX];

                if (tile !== 1) fill('rgba(0,255,0,0.1)');
                else fill('rgba(255,0,0,0.1)');

                rect(boardGlobalPosX, boardGlobalPosY, tileSize, tileSize);

                if (tile === 1) {
                    return this.draw(xPoint + xOffset * i, yPoint + yOffset * i);
                }
            }catch(err){}
        }

        return this.draw(this.position.x + this.direction.x * canvas.width, this.position.y + this.direction.y * canvas.width);
    }
}