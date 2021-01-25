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

const raysPerAngle = 5; // CONTROLL THE DETAIL

function start() {
    createCanvas(martix[0].length * tile * 2, martix.length * tile);

    px = martix[0].length * tile / 2;
    py = martix.length * tile / 2 + tile / 2;

    p = new Player(
        martix[0].length * tile / 2 + tile / 2,
        martix.length * tile / 2 + tile / 2,
        0,
        2,
        70
    );
}

function update() {
    background("#232020");

    drawBoard();
    p.update();
}

function drawBoard() {
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
    this.rayStrips = 0; // heights array

    for (let i = 0; i < this.fov * raysPerAngle; i++) {
        this.rays.push(new Ray(this.pos.x, this.pos.y, -(this.fov / 2) + (i / raysPerAngle) + this.angle ));
    }

    this.changeAngle = function (x) {
        this.angle += x;
        if (this.angle > 360) this.angle = 1;
        if (this.angle < 0) this.angle = 359;
    }

    this.setDir = function (_xD, _yD) {
        if (_xD != null) this.dir.x = _xD;
        if (_yD != null) this.dir.y = _yD;

        //this.dir.Normalize();
        const mag = Math.sqrt(this.dir.x ** 2 + this.dir.y ** 2);
        if (mag === 0) return;

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

    this.castRays = function () {
        for (let i = 0; i < this.fov * raysPerAngle; i++) {
            this.rays[i].update(this.pos.x, this.pos.y, -(this.fov / 2) + (i / raysPerAngle) + this.angle);
            this.rays[i].cast();
        }
    }

    this.addSceneStrip = function (rayDist, rayAngle) {
        
        if(this.rayStrips >= this.fov * raysPerAngle) this.rayStrips = 0;

        // TODO: fix fish eye
        // let a = rayAngle - this.angle;
        // let fixedDist = rayDist * cos(a);
    
        let height = map(rayDist , 0, 750, canvas.height / 1.5, 0);
        let color = map(rayDist  , 0, 750, 255, 0);
        
        noStroke();
        fill(`rgb(${color}, ${color}, ${color})`);

        const stripWidth = (canvas.width / 2 / (this.fov * raysPerAngle) );
        
        rect(canvas.width / 2 + this.rayStrips * stripWidth,
            (canvas.height - height) / 2,
            stripWidth, height);

        this.rayStrips++;
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

    this.draw = function (finalX, finalY, dist, angle) {
        stroke(2, '#d75b5b'); line(this.pos.x, this.pos.y, finalX, finalY);

        // 3D 'Render'
        p.addSceneStrip(dist, angle);
    }

    this.cast = function () {
        noStroke();

        let hRayDist = 10000, hPx, hPy;
        let vRayDist = 10000, vPx, vPy;

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

        for (let i = 0; i < 8; i++) {
            const xPos = ix - xOffset * i,
                yPos = lookingUp ? hy - yOffset * i : hy + yOffset * i;

            const xBoardIndex = Math.floor(xPos / tile);
            let yBoardIndex = Math.floor(yPos / tile);
            if (lookingUp) yBoardIndex -= 1;

            // fill('#d6b541'); circle(xPos, yPos, 5);

            // ray collided
            if (martix[yBoardIndex] && martix[yBoardIndex][xBoardIndex] === 1) {
                hRayDist = this.length(xPos, yPos);
                hPx = xPos; hPy = yPos;
                break;
            }

        }

        //#endregion

        //#region VERTICAL LINE CHECK

        const lookingRight = this.angle < 90 || this.angle > 270;

        // fisrt vertical line index that intersect with the ray
        let vx = lookingRight ? Math.ceil(this.pos.x / tile) : Math.floor(this.pos.x / tile);
        // convert line index to actual world pos
        vx *= tile;

        // fill('#eb9a44'); circle(vx, this.pos.y, 5);

        // vertical height/radius of the trigonometric circle
        let vh = Math.abs(this.pos.x - vx);

        // intersect point y
        let iy = lookingRight ? -tan(this.angle) : tan(this.angle);
        /* resize ix to fit the circle of radius h */ iy *= vh;
        /* tranlade the point relative to player x */ iy += this.pos.y;

        // fill('#d6b541'); circle(vx, iy, 5);

        // find the Big Triangle Right Angle Point
        // fill('#6dcf55'); circle(vx, ohy, 5);

        let dy = iy - this.pos.y;
        dx = vx - this.pos.x;

        let yCathetusLength = tile / dx * dy;

        xOffset = tile;
        yOffset = yCathetusLength;

        for (let i = 0; i < 8; i++) {
            const xPos = lookingRight ? vx + xOffset * i : vx - xOffset * i,
                yPos = lookingRight ? iy + yOffset * i : iy - yOffset * i;

            let xBoardIndex = Math.floor(xPos / tile);
            const yBoardIndex = Math.floor(yPos / tile);
            if (!lookingRight) xBoardIndex -= 1;

            // fill('#d6b541'); circle(xPos, yPos, 5);

            // fill('rgba(215, 91, 91, 0.1)'); rect(xBoardIndex * tile, yBoardIndex * tile, tile, tile);

            if (martix[yBoardIndex] && martix[yBoardIndex][xBoardIndex] === 1) {
                vRayDist = this.length(xPos, yPos);
                vPx = xPos; vPy = yPos;

                break;
            }
        }

        //#endregion

        // stroke(10, 'green'); line(this.pos.x, this.pos.y, hPx, hPy);
        // stroke(3, 'blue'); line(this.pos.x, this.pos.y, vPx, vPy);

        // Choose the shortest ray line
        
        //console.log('Horizontal line: ' + hRayDist +  ' x ' + 'Vertical line: ' + vRayDist);
        if(hRayDist <= vRayDist) this.draw(hPx, hPy, hRayDist, this.angle);
        else this.draw(vPx, vPy,vRayDist);

        //this.draw(this.pos.x + this.dir.x * canvas.width, this.pos.y + this.dir.y * canvas.width);
    }

    this.length = function (finalX, finalY) {
        //return Math.sqrt(this.pos.x - finalX ** 2 + this.pos.y - finalY ** 2);
        return Math.sqrt((this.pos.x - finalX) * (this.pos.x - finalX) + (this.pos.y - finalY) * (this.pos.y - finalY));
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