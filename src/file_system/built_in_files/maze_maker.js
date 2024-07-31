import { Component } from "react";
import './maze_maker.css';

const maze_maker = function () {
    return [
        {line: "This is an webpage that can be run by accessing the following link. This project is meant to show my understanding of algorithms as I was able to efficiently and without recursion generate a maze based on given inputs.", className: "opened-file", remove_spaces: true},
        {line: "link", link: "/#/fs?path=~/Projects/maze_maker.html"},
        {"line": " ", "remove_spaces": false, "className": "opened-file"}
    ];
}

maze_maker.component = class extends Component{

    state = {
        w: null,
        h: null,
        startX: null,
        startY: null,
        isCircle: true,
        endX: null,
        endY: null,
        showSolution: false,
        currentMaze: null
    }

    #generateMaze = () => {

        const w = this.state.w ? this.state.w : 20;
        const h = this.state.h ? this.state.h : 20;

        const maze = new Array(w)
        .fill(0)
        .map((_e, i) => 
            new Array(h)
            .fill(0)
            .map((_c,j) => {return {
                x: i+1,
                y: j+1,
                left: 0,
                right: 0,
                top: 0,
                down: 0,
                visited: 0,
                partOfSolution: 0
            }})
        );


        maze.x = this.state.startX ? this.state.startX: 1;
        maze.y = this.state.startY ? this.state.startY: 1;
        maze[maze.x-1][maze.y-1].visited = 1;
        if(maze.x === 1 && !this.state.isCircle) maze[maze.x-1][maze.y-1].left = 1;
        if(maze.x === w && !this.state.isCircle) maze[maze.x-1][maze.y-1].right = 1;
        if(maze.y === 1) maze[maze.x-1][maze.y-1].down = 1;
        if(maze.y === h) maze[maze.x-1][maze.y-1].top = 1;


        const endX = this.state.endX ? this.state.endX: w;
        const endY = this.state.endY ? this.state.endY: h;
        if(endX === 1 && !this.state.isCircle) maze[endX-1][endY-1].left = 1;
        if(endX === w && !this.state.isCircle) maze[endX-1][endY-1].right = 1;
        if(endY === 1) maze[endX-1][endY-1].down = 1;
        if(endY === h) maze[endX-1][endY-1].top = 1;

        const directions = {
            left: 1,
            right: 2,
            up: 3,
            down: 4
        }

        maze.move = (direction) => {
            if(direction === directions.left){
                maze[maze.x-1][maze.y-1].left = 1;
                if(maze.x > 1) maze.x = maze.x - 1;
                else maze.x = w;
                maze[maze.x-1][maze.y-1].right = 1;
                maze[maze.x-1][maze.y-1].visited = 1;
            }else if(direction === directions.right){
                maze[maze.x-1][maze.y-1].right = 1;
                if(maze.x < w) maze.x = maze.x + 1;
                else maze.x = 1;
                maze[maze.x-1][maze.y-1].left = 1;
                maze[maze.x-1][maze.y-1].visited = 1;
            }else if(direction === directions.up){
                maze[maze.x-1][maze.y-1].top = 1;
                maze[maze.x-1][maze.y].down = 1;
                maze[maze.x-1][maze.y].visited = 1;
                maze.y = maze.y + 1;
            }else if(direction === directions.down){
                maze[maze.x-1][maze.y-1].down = 1;
                maze[maze.x-1][maze.y-2].top = 1;
                maze[maze.x-1][maze.y-2].visited = 1;
                maze.y = maze.y - 1;
            }
        }

        maze.possibleMoves = () => {
            const moves = [];
            if(maze.x > 1 && maze.x < w){
                if(!maze[maze.x-2][maze.y-1].visited) moves.push(directions.left);
                if(!maze[maze.x][maze.y-1].visited) moves.push(directions.right);
            }else if (maze.x === 1){
                if(!maze[w-1][maze.y-1].visited && this.state.isCircle) moves.push(directions.left);
                if(!maze[maze.x][maze.y-1].visited) moves.push(directions.right);
            }else if (maze.x === w){
                if(!maze[maze.x-2][maze.y-1].visited) moves.push(directions.left);
                if(!maze[0][maze.y-1].visited && this.state.isCircle) moves.push(directions.right);
            }

            if(maze.y > 1 && maze.y < h){
                if(!maze[maze.x-1][maze.y].visited) moves.push(directions.up);
                if(!maze[maze.x-1][maze.y-2].visited) moves.push(directions.down);
            }else if(maze.y === 1 && !maze[maze.x-1][maze.y].visited) moves.push(directions.up);
            else if(maze.y === h && !maze[maze.x-1][maze.y-2].visited) moves.push(directions.down);

            return moves;
        }

        maze.isSolutionCell = () => {
            maze[maze.x-1][maze.y-1].partOfSolution = 1;
        }

        const cells = [{x: maze.x, y: maze.y, partOfSolution: false}];

        let lastCellPopped;

        while(cells.length){
            const currentCell = cells[cells.length-1];

            maze.x = currentCell.x;
            maze.y = currentCell.y;

            if(maze.x === endX && maze.y === endY){
                maze.isSolutionCell();
                currentCell.partOfSolution = true;
                lastCellPopped = cells.pop();
                continue;
            }

            if(lastCellPopped && lastCellPopped.partOfSolution){
                maze.isSolutionCell();
                currentCell.partOfSolution = true;
            }

            const possibleMoves = maze.possibleMoves();

            if(possibleMoves.length){
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                maze.move(randomMove);
                const nextCell = {x: maze.x, y: maze.y, partOfSolution: false};
                cells.push(nextCell);
                lastCellPopped = null;
            }else{
                lastCellPopped = cells.pop();
            }

        }

        this.setState({currentMaze: maze});

    }

    #draw = () => {

        const maze = this.state.currentMaze;

        const canvas = document.getElementById("maze");
        const ctx = canvas.getContext("2d");

        if(this.state.isCircle){
            const a = Math.min(window.innerWidth * .7, window.innerHeight * .9);
            canvas.style.width = `${a}px`;
            canvas.style.height = `${a}px`;
        }else{
            canvas.style.width = `${window.innerWidth * .7}px`;
            canvas.style.height = `${window.innerHeight * .9}px`;
        }

        const w = canvas.width;
        const h = canvas.height;
        const numCellsW = this.state.w ? this.state.w: 20;
        const numCellsH = this.state.h ? this.state.h: 20;
        
        const widthPerCell = w / numCellsW;
        const heightPerCell = h / numCellsH;
        const arcPerCell = Math.PI * 2 / numCellsW;
        const radiusPerCell = (h/2) / (numCellsH + 1);
        const centerX = w / 2;
        const centerY = h / 2;
        const lineWidth = 200 / Math.max(numCellsW, numCellsH);

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "white";
        if(this.state.isCircle){
            ctx.arc(centerX, centerY, h/2, 0, 2 * Math.PI);
            ctx.fill();
        }else
            ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "red";
        ctx.lineWidth = lineWidth;

        ctx.beginPath();

        const drawLine = (x1, y1, x2, y2) => {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }

        const drawArc = (r, a) => {
            ctx.moveTo(Math.cos(a) * r + centerX, Math.sin(a) * r + centerY);
            ctx.arc(centerX, centerY, r, a, a + arcPerCell);
        }

        for(let i = 0; i < numCellsW; i++){
            const x = widthPerCell * i;
            const angleStart = arcPerCell * i + 1.5 * Math.PI;
            const angleEnd = angleStart + arcPerCell;

            for(let j = 0; j < numCellsH; j++){
                const y = heightPerCell * j;
                const bottomRadius = radiusPerCell * (j+1);
                const topRadius = radiusPerCell + bottomRadius;

                if(!this.state.isCircle){
                    if(!maze[i][j].left) drawLine(x, y, x, y + heightPerCell);
                    if(!maze[i][j].right) drawLine(x + widthPerCell, y, x + widthPerCell, y + heightPerCell);
                    if(!maze[i][j].top) drawLine(x, y + heightPerCell, x + widthPerCell, y + heightPerCell);
                    if(!maze[i][j].down) drawLine(x, y, x + widthPerCell, y);
                    if(maze[i][j].partOfSolution && this.state.showSolution) ctx.fillRect(x, y, widthPerCell, heightPerCell);
                }else{
                    if(!maze[i][j].top) drawArc(topRadius, angleStart);
                    if(!maze[i][j].down) drawArc(bottomRadius, angleStart);
                    if(!maze[i][j].left) drawLine(
                        Math.cos(angleStart) * bottomRadius + centerX, 
                        Math.sin(angleStart) * bottomRadius + centerY, 
                        Math.cos(angleStart) * topRadius + centerX,
                        Math.sin(angleStart) * topRadius + centerY
                    )
                    if(!maze[i][j].right) drawLine(
                        Math.cos(angleEnd) * bottomRadius + centerX, 
                        Math.sin(angleEnd) * bottomRadius + centerY, 
                        Math.cos(angleEnd) * topRadius + centerX,
                        Math.sin(angleEnd) * topRadius + centerY
                    )
                    if(maze[i][j].partOfSolution && this.state.showSolution){
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.strokeStyle = "red";
                        drawArc(topRadius, angleStart);
                        ctx.arc(centerX, centerY, bottomRadius, angleEnd, angleStart, true);
                        ctx.stroke();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.strokeStyle = "black";
                    }
                }



            }

        }

        ctx.stroke();

    }

    #onClickGenerate = () => {
        try{
            this.#generateMaze();
        }catch(e){
            console.error(e);
        }
    }

    #checkCircular = () => {
        this.setState({isCircle: !this.state.isCircle, currentMaze: null});
    }

    #setSize = (e) => {
        const sizeStr = e.target.value;
        const [w, h] = sizeStr.matchAll(/[0-9]+/g).map(g=>parseInt(g[0]));
        if(w >= 2 && h >= 2){
            this.setState({w,h, currentMaze: null});
            e.target.style.color = "black";
        }
        else e.target.style.color = "red";
    }

    #setStart = (e) => {
        const startStr = e.target.value;
        const [startX, startY] = startStr.matchAll(/[0-9]+/g).map(g=>parseInt(g[0]));
        if(startX >= 1 && startY >= 1 && (this.state.endX !== startX || this.state.endY !== startY)){
            this.setState({startX,startY, currentMaze: null});
            e.target.style.color = "black";
        }
        else e.target.style.color = "red";
    }

    #setEnd = (e) => {
        const endStr = e.target.value;
        const [endX, endY] = endStr.matchAll(/[0-9]+/g).map(g=>parseInt(g[0]));
        if(endX >= 1 && endY >= 1 && (this.state.startX !== endX || this.state.startY !== endY)){
            this.setState({endX,endY, currentMaze: null});
            e.target.style.color = "black";
        }
        else e.target.style.color = "red";
    }

    #showSolutionChecked = () => {
        this.setState({showSolution: !this.state.showSolution});
    }

    componentDidUpdate = () => {
        if(this.state.currentMaze)
            this.#draw();
    }

    componentDidMount = () => {
        const generate = document.getElementById("generate");
        generate.click();
    }

    render(){

        return <div>

            <div className="inputs">
                <div>Size: <input id="size" placeholder="w, h" onChange={this.#setSize} defaultValue="20,20"></input></div>
                <div>Start Location: <input id="start" placeholder="(x,y)" onChange={this.#setStart} defaultValue="(1,1)"></input></div>
                <div>End Location: <input id="end" placeholder="(x,y)" onChange={this.#setEnd} defaultValue="(20,20)"></input></div>
                <div>Circular: <input type="checkbox" onClick={this.#checkCircular} defaultChecked></input></div>
                <div>Generate: <button id="generate" onClick={this.#onClickGenerate}></button></div>
                <div>Solution: <input type="checkbox" onClick={this.#showSolutionChecked}></input></div>
            </div>

            <canvas id="maze" width="2000" height="2000"></canvas>
            
            
        </div>
    }
}

export default maze_maker;