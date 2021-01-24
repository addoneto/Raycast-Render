const martix = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

const tile = 100;
let p;

function start() {
    createCanvas(martix[0].length * tile * 2, martix.length * tile);

    px = martix[0].length * tile / 2;
    py = martix.length * tile / 2 + tile / 2;

    p = new Player(
        martix[0].length * tile / 2,
        martix.length * tile / 2 + tile / 2,
        0,
        2,
        1
    );
}

function update(){
    background("#232020");

    drawBoard();
    p.update();
}

function drawBoard(){
    stroke(5, 'gray');
    line(martix[0].length * tile, 0, martix[0].length * tile, martix.length * tile);

    stroke(2, '#5a5858');
    for (let rows = 0; rows < martix.length; rows++) {
        for (let columns = 0; columns < martix[0].length; columns++) {
            line(0, rows * tile, martix[0].length * tile, rows * tile);
            line(columns * tile, 0, columns * tile, martix.length * tile);

            if (martix[rows][columns] === 1) {
                fill('#434343');
                rect(columns * tile, rows * tile, tile, tile);
            }
        }
    }
}

function Player(_x, _y, _a, _v, _f) {
    this.pos = new Vector2(_x, _y);
    this.angle = _a;
    this.vel = _v;
    this.fov = _f;
    this.dir = new Vector2(0, 0);

    this.rays = [];

    for (let i = -(this.fov / 2); i < this.fov / 2; i++) {
        this.rays.push(new Ray(this.pos.x, this.pos.y, i + this.angle));
    }

    this.changeAngle = function(x){
        this.angle += x;
        if(this.angle > 360) this.angle = 1;
        if(this.angle < 0) this.angle = 359;
    }

    this.setDir = function (_xD, _yD) {
        if (_xD != null) this.dir.x = _xD;
        if (_yD != null) this.dir.y = _yD;

        //this.dir.Normalize();
        const mag = Math.sqrt(this.dir.x ** 2 + this.dir.y ** 2);
        if(mag === 0) return;
        
        this.dir.x /= mag;
        this.dir.y /= mag;
    }

    this.update = function () {
        this.castRays();

        this.pos.x += this.dir.x * this.vel;
        this.pos.y += this.dir.y * this.vel;

        this.draw();
    }

    this.draw = function () {
        noStroke();
        fill('#ddc9b4');
        circle(this.pos.x, this.pos.y, 10);
    }

    this.castRays = function(){
        for (let i = 0; i < this.fov; i++) {
            this.rays[i].update(this.pos.x, this.pos.y, i - this.fov / 2 + this.angle);
            this.rays[i].cast();
        }
    }
}

function Ray(_x, _y, _angle) {
    this.pos = new Vector2(_x, _y);
    this.angle = _angle;
    this.dir = Vector2.angleToDirection(_angle);

    this.update = function (_x, _y, _angle) {
        this.pos.x = _x;
        this.pos.y = _y;
        this.angle = _angle;
        this.dir = Vector2.angleToDirection(this.angle);
    }

    this.draw = function (finalX, finalY) {
        stroke(3, '#d75b5b'); line(this.pos.x, this.pos.y, finalX, finalY);
    }

    this.cast = function () {
        noStroke();

        //#region HORIZONTAL LINE CHECK

        const lookingUp = this.angle < 180;

        // fisrt horizontal line index that intersect with the ray
        let hy = lookingUp ? Math.floor(this.pos.y / tile) : Math.ceil(this.pos.y / tile);
        // convert line index to actual world pos
        hy *= tile;

        // fill('#eb9a44'); circle(this.pos.x, hy, 5);

        // height/radius of the trigonometric circle
        let h = Math.abs(this.pos.y - hy);

        // intersect point x
        let ix = lookingUp ? 1 / tan(this.angle) : -1 / tan(this.angle);
        /* resize ix to fit the circle of radius h */ ix *= h;
        /* tranlade the point relative to player x */ ix += this.pos.x;

        // fill('#d6b541'); circle(ix, hy, 5);

        // oposite horizontal line y
        let ohy = lookingUp ? hy + tile : hy - tile;

        // big triangle Right Angle Point
        // fill('#6dcf55'); circle(ix, ohy, 5);

        // oposite horizontal line intersection x point
            // using tangent (basiclly the opposite of ix [ix * -1] )
            //let opix = -1 / tan(this.angle) * h + this.pos.x;

            // using triangle similarity
            let dx = this.pos.x - ix; // distance between ix and player x
            // the number can be negative, 'cause in these cases the point is in the left of the player
            
            // tile / radius [h] = opx / dx --> opx = tile * dx / h
            let opiCathetusLength = tile * dx / h;
            let opix = ix + opiCathetusLength;

        // fill('#af55cf'); circle(opix, ohy, 5);

        let xOffset = opiCathetusLength;
        let yOffset = tile;

        for(let i = 0; i < 8; i++) {
            const xPos = ix - xOffset * i,
            yPos = lookingUp ? hy - yOffset * i : hy + yOffset * i;

            const xBoardIndex = Math.floor(xPos / tile);
            let yBoardIndex =  Math.floor(yPos / tile);
            if(lookingUp) yBoardIndex -= 1;

            // ray collided
            if(martix[yBoardIndex] && martix[yBoardIndex][xBoardIndex] === 1){
                this.draw(xPos, yPos);
                return;
            }

            // fill('#d6b541'); circle(xPos, yPos, 5);
        }

        //#endregion

        this.draw(this.pos.x + this.dir.x * canvas.width,
            this.pos.y + this.dir.y * canvas.width);
    }
}

function keyDown(key) {
    switch (key) {
        case ARROW_RIGHT: // D
            p.setDir(1, null);
            break;
        case ARROW_LEFT: // A
            p.setDir(-1, null);
            break;
        case ARROW_UP: // W
            p.setDir(null, -1);
            break;
        case ARROW_DOWN: // S
            p.setDir(null, 1);
            break;

        case 65: // A
            p.changeAngle(1);
            break;
        case 68: //D
            p.changeAngle(-1);
            break;
    }
}

function keyUp(key) {
    switch (key) {
        case ARROW_RIGHT: // D
            p.setDir(0, null);
            break;
        case ARROW_LEFT: // A
            p.setDir(0, null);
            break;
        case ARROW_UP: // W
            p.setDir(null, 0);
            break;
        case ARROW_DOWN: // S
            p.setDir(null, 0);
            break;
    }
}