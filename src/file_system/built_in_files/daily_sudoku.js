import { Component } from "react";

const daily_sudoku = function () {
    return [
        {line: "This is a website linked below that will generate sudoku puzzles daily.", className: "opened-file", remove_spaces: true},
        {line: "link", link: "/bwetzel_resume/#/fs?path=~/Projects/daily_sudoku.html"}
    ];
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4); 
    h2 ^= h1; 
    h3 ^= h1; 
    h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

// simple fast counter function (takes 4 32-bit data and returns a random number generator with that seed)
function sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

// combined above
function getRand(str) {
    return sfc32(...cyrb128(str));
}

daily_sudoku.component = class extends Component{
    
    #getDay(){
        const date = new Date(Date.now());
        return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
    }

    #rand = Math.random //getRand(this.#getDay());
    #numberList;
    #grid;

    #shuffle = (array) => {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
            // Pick a remaining element...
            let randomIndex = Math.floor(this.#rand() * currentIndex);
            currentIndex--;
    
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }

    #makeGrid(d) {
        return new Array(d)
        .fill(0)
        .map((_, j) => new Array(d)
            .fill(0)
            .map((_, i) => {
                // if(j === 0 && i === 0) return {number: 0, builtIn: true}
                // return {number: d*j+i+1, builtIn: true}
                return {number: 0, builtIn: true}
            })
        );
    }

    #selectRandomFromList(array){
        if(!array || array.length < 1) return null;

        return array[Math.floor(array.length * this.#rand())];
    }

    #numberListGenerator(d){
        return new Array(d)
        .fill(0)
        .map((_, i) => i+1)
    }
    
    #getSquare(x, y){
        const d = this.#grid.length;
        const squares = Math.floor(Math.pow(d, .5));
        const square = new Array(d);
    
        const xSquareNum = Math.floor(x / squares);
        const ySquareNum = Math.floor(y / squares);
    
        for(let i = 0; i < squares; i++){
            const xs = xSquareNum*squares + i;
            for(let j = 0; j < squares; j++){
                const ys = ySquareNum*squares + j;
                square[i*squares+j] = this.#grid[xs][ys].number;
            }
        }
        return square;
    }

    #isFullGrid(){
        const d = this.#grid.length;
        for(let i = 0; i < d; i++)
            for(let j = 0; j < d; j++)
                if(this.#grid[i][j].number === 0)
                    return false;
        return true;
    }

    #fillGrid(){
        const d = this.#grid.length;
        const totalCells = d*d;
        let x;
        let y;

        // const grid = this.#grid;

        for(let i = 0; i < totalCells; i++){
            x = i % d;
            y = Math.floor(i/d);
            if(this.#grid[x][y].number === 0){
                this.#shuffle(this.#numberList);
                // const numberList = this.#numberList;
                for(let j = 0; j < d; j++){
                    const number = this.#numberList[j];
                    const col = this.#grid[x].map(e => e.number);
                    if(!col.includes(number)){ // not include in column
                        const row = this.#grid.map(e => e[y].number);
                        if(!row.includes(number)){ // not include in row
                            const square = this.#getSquare(x, y);
                            if(!square.includes(number)){ // not included in the square
                                this.#grid[x][y].number = number;
                                // console.log(`row: ${row.join(',')}`);
                                // console.log(`col: ${col.join(',')}`);
                                // console.log(`sqr: ${square.join(',')}`);
                                // console.log(number);
                                if(this.#isFullGrid()){
                                    console.log("found full grid?")
                                    return true;
                                }
                                else
                                    if(this.#fillGrid()){
                                        return true;
                                    }
                            }
                        }
                    }
                }
                break;
            }
        }
        // const currentGridNumber = this.#grid[x][y];
        this.#grid[x][y].number = 0;
        // console.log("backtracking", currentGridNumber)
        return false;
    }

    #solveGrid(){
        
    }
    
    render(){

        const d = 9;
        this.#numberList = this.#numberListGenerator(d);

        this.#grid = this.#makeGrid(d);

        return <div>
            <button onClick={() => {
                this.#fillGrid();
                console.log(this.#grid);
            }}>FILL GRID</button>
        </div>
    }
}

export default daily_sudoku;