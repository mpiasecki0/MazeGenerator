// declare drawing members
var canvas;
var c_width;
var c_height;
var square_len; 
var draw_speed;
var c;

// declare maze members
var length;
var rows;
var cols;
var current;
var grid;
var stack;
var running;

// define all member with user html input
function setupMembers(){
    // init draw members
    canvas = document.querySelector('canvas');
    c_width = parseInt(document.getElementById('width').value);
    c_height = parseInt(document.getElementById('height').value);
    square_len = parseInt(document.getElementById('length').value);
    draw_speed = parseInt(document.getElementById('speed').value);
    // check for wrong userinput
    if (c_width == "" || isNaN(c_width) || c_width > 10000 || c_width < 1){
        alert("You must input numbers. No letters or other funny characters are allowed! (MaxValue = 10.000)");
        return;
    }
    if (c_height == "" || isNaN(c_height) || c_height > 10000 || c_height < 1){
        alert("You must input numbers. No letters or other funny characters are allowed! (MaxValue = 10.000)");
        return;
    }
    if (square_len == "" || isNaN(square_len) || square_len > 10000 || square_len < 1){
        alert("You must input numbers. No letters or other funny characters are allowed! (MaxValue = 10.000)");
        return;
    }
    if (draw_speed == "" || isNaN(draw_speed) || draw_speed > 10000 || draw_speed < 1){
        alert("You must input numbers. No letters or other funny characters are allowed! (MaxValue = 10.000)");
        return;
    }

    canvas.width = c_width;
    canvas.height = c_height;
    c = canvas.getContext('2d');

    // init maze members
    length = square_len;  //length of stroke of a square
    grid = new Array();
    stack = new Array();
    running = true; // for framerate control

    // start the program/script
    main();
}

function drawLines(fromX, fromY, toX, toY){
    c.beginPath();
    c.moveTo(fromX, fromY);
    c.lineTo(toX, toY);
    c.stroke();
}

function drawColoredRect(color, fromX, fromY, toX, toY){
    c.fillStyle = color;
    c.fillRect(fromX, fromY, toX, toY); // cord,cord,width,height
}

// setup the grid/fields
function setupGrid(){
    // init grid members
    rows = Math.floor(canvas.width/length);
    cols = Math.floor(canvas.height/length);

    // create two dim-array
    for (var k = 0; k < rows; k++){
       grid[k] = [cols];
    }

    // init cells in the grid (i and j are a Cell position)
    for (var i = 0; i < rows; i ++){
        for (var j = 0; j < cols; j++){
            grid[i][j] = new Cell(i, j);
        }
    }

    current = grid[0][0];   // maze starts here (top left)
}

// draws the grid (no colors yet)
function drawGrid(){
    for (var i = 0; i < rows; i ++){
        for (var j = 0; j < cols; j++){
            grid[i][j].drawSquare();
        }
    }
}

// most of the algorithm calls happen here
function drawMaze(){
    current.drawSquare();
    current.visited = true;
    var next = current.checkNeighbours();

    if (next != undefined){
        current.highlightCurrent();
        next.visited = true;
        stack.push(current);
        removeWalls(current, next);
        current = next;
    }
}

// main object
function Cell(x, y){
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = [true, true, true, true]; // wall variables in order: top, right, bottom, left

    // returns the next random valid neighbour as a Cell Object 
    this.checkNeighbours = function(){
        var neighbours = [];
        var top, right, bottom, left;
        
        // check if cell coordinates are INSIDE of the grid (not out of bounds)
        if(this.x < 0 || this.y-1 < 0 || this.x > rows-1 || this.y-1 > cols-1){
            top = undefined;
        }else{
            top = grid[this.x][this.y-1];
        }
        if(this.x+1 < 0 || this.y < 0 || this.x+1 > rows-1 || this.y > cols-1){
            right = undefined;
        }else{
            right = grid[this.x+1][this.y];
        }
        if(this.x < 0 || this.y+1 < 0 || this.x > rows-1 || this.y+1 > cols-1){
            bottom = undefined;
        }else{
            bottom = grid[this.x][this.y+1];
        }
        if(this.x-1 < 0 || this.y < 0 || this.x-1 > rows-1 || this.y > cols-1){
            left = undefined;
        }else{
            left = grid[this.x-1][this.y];
        }
        
        // if neigbour hasnt been visited, push to array
        if (top != undefined && top.visited == false){
            neighbours.push(top)
        }
        if (right != undefined && right.visited == false){
            neighbours.push(right)
        }
        if (bottom != undefined && bottom.visited == false){
            neighbours.push(bottom)
        }
        if (left != undefined && left.visited == false){
            neighbours.push(left)
        }
        
        if (neighbours.length > 0){
            var rand = Math.floor(Math.random()*neighbours.length);
            return neighbours[rand];
        }else if(stack.length > 0){
            current = stack.pop();
        }else{
            running = false;
            return undefined;
        }
    }
    // draws the walls and rectangles
    this.drawSquare = function(){
        var strokeX = this.x*length;
        var strokeY = this.y*length;
        // 0 = top, 1 = right, 2 = bottom, 3 = left
        if (this.walls[0] == true){
            drawLines(strokeX, strokeY, strokeX+length, strokeY);
        }
        if (this.walls[1] == true){
            drawLines(strokeX+length, strokeY, strokeX+length, strokeY+length);
        }
        if (this.walls[2] == true){
            drawLines(strokeX+length, strokeY+length, strokeX, strokeY+length);
        }
        if (this.walls[3] == true){
            drawLines(strokeX, strokeY+length, strokeX, strokeY);
        }
        if (this.visited == true){
            drawColoredRect('#4BD9F2', strokeX, strokeY, length, length);
        }
    }

    this.highlightCurrent = function(){
        var strokeX = this.x*length;
        var strokeY = this.y*length;
        drawColoredRect('green', strokeX, strokeY, length, length);
    }
}

function removeWalls(cellA, cellB){
    var x = cellA.x - cellB.x;  // calculates which wall (left/right) needs to be removed by subtracting indexes
    var y = cellA.y - cellB.y;  // same with top/bottom

    if (x == 1){
        cellA.walls[3] = false;
        cellB.walls[1] = false;
    }else if(x == -1){
        cellA.walls[1] = false;
        cellB.walls[3] = false; 
    }

    if (y == 1){
        cellA.walls[0] = false;
        cellB.walls[2] = false;
    }else if(y == -1){
        cellA.walls[2] = false;
        cellB.walls[0] = false;
    }
}

// used for draw-speed regulation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    
}

// main method
async function main(){
    setupGrid();
    drawGrid();
    while(running){
        drawMaze();
        await sleep(draw_speed);
    }
    alert('Finished generating your maze! All cells have been visited & the stack is empty!');
    console.log('Finished generating your maze! All cells have been visited & the stack is empty!');
}
