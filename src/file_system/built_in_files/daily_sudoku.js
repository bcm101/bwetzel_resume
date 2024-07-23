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

    state = {
        attempts: null,
        unSolvedGrid: null
    }

    #rand = Math.random // getRand(this.#getDay()); // random function that enables daily puzzles that are the same for everyone
    #numberList; // list of possible numbers to fill in (1-9 usually for sudoku)
    #solvedGrid; // solution grid

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
                return {number: 0, builtIn: true, shouldShow: false}
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
    
    #getSquare(x, y, grid){
        const d = grid.length;
        const squares = Math.floor(Math.pow(d, .5));
        const square = new Array(d);
    
        const xSquareNum = Math.floor(x / squares);
        const ySquareNum = Math.floor(y / squares);
    
        for(let i = 0; i < squares; i++){
            const xs = xSquareNum*squares + i;
            for(let j = 0; j < squares; j++){
                const ys = ySquareNum*squares + j;
                square[i*squares+j] = grid[xs][ys].number;
            }
        }
        return square;
    }

    #isFullGrid(grid){
        const d = grid.length;
        for(let i = 0; i < d; i++)
            for(let j = 0; j < d; j++)
                if(grid[i][j].number === 0)
                    return false;
        return true;
    }

    #fillGrid(grid){
        const d = grid.length;
        const totalCells = d*d;
        let x;
        let y;

        for(let i = 0; i < totalCells; i++){
            x = i % d;
            y = Math.floor(i/d);
            if(grid[x][y].number === 0){
                this.#shuffle(this.#numberList);
                for(let j = 0; j < d; j++){
                    const number = this.#numberList[j];
                    const row = grid[x].map(e => e.number);
                    if(!row.includes(number)){ // not include in row
                        const col = grid.map(e => e[y].number);
                        if(!col.includes(number)){ // not include in column
                            const square = this.#getSquare(x, y, grid);
                            if(!square.includes(number)){ // not included in the square
                                grid[x][y].number = number;
                                if(this.#isFullGrid(grid))
                                    return true;
                                else
                                    if(this.#fillGrid(grid))
                                        return true;
                            }
                        }
                    }
                }
                break;
            }
        }
        grid[x][y].number = 0;
        return false;
    }

    #copyGrid(grid){
        const d = grid.length;
        return new Array(d)
        .fill(0)
        .map((_, i) => new Array(d)
            .fill(0)
            .map((_, j) => {
                return {
                    number: grid[i][j].number,
                    builtIn: grid[i][j].builtIn,
                    shouldShow: grid[i][j].shouldShow
                }
            })
        );
    }

    async #findPuzzle(difficulty, solvedGrid){

        let unSolvedGrid = this.#copyGrid(solvedGrid);
        const d = solvedGrid.length;
        let solutionsFound = 0;
        let totalAttempts = 10;
        let totalRemoved = 0;

        const sleep = ms => new Promise(r => setTimeout(r, ms));

        const countSolutions = grid => {
            const d = grid.length;
            const totalCells = d*d;
            let x;
            let y;

            if(solutionsFound > 1) return true;

            for(let i = 0; i < totalCells; i++){
                x = i % d;
                y = Math.floor(i/d);
                if(grid[x][y].number === 0){

                    console.log("unsolved cell at ", x, y);
                    console.log(grid[x].map(e => e.number).join(), grid.map(e => e[y].number).join(), this.#getSquare(x, y, grid).join())

                    this.#shuffle(this.#numberList);
                    for(let j = 0; j < d; j++){
                        const number = this.#numberList[j];
                        const row = grid[x].map(e => e.number);
                        if(!row.includes(number)){ // not include in row
                            const col = grid.map(e => e[y].number);
                            if(!col.includes(number)){ // not include in column
                                const square = this.#getSquare(x, y, grid);
                                if(!square.includes(number)){ // not included in the square
                                    grid[x][y].number = number;
                                    if(this.#isFullGrid(grid)){
                                        solutionsFound++;
                                        console.log(square.join(), col.join(), row.join(), number, x, y)
                                        break;
                                    }
                                    else
                                        if(countSolutions(grid))
                                            return true;
                                }
                            }
                        }
                    }
                    break;
                }
            }
            grid[x][y].number = 0;
            return false;
        };

        while(totalAttempts > 0){
            let x = Math.floor(this.#rand() * d);
            let y = Math.floor(this.#rand() * d);

            while(unSolvedGrid[x][y] === 0){
                x = Math.floor(this.#rand() * d);
                y = Math.floor(this.#rand() * d);
            }

            unSolvedGrid[x][y].number = 0;
            unSolvedGrid[x][y].shouldShow = true;
            unSolvedGrid[x][y].builtIn = false;

            let copyOfGrid = this.#copyGrid(unSolvedGrid);

            countSolutions(copyOfGrid);
            if(solutionsFound !== 1){
                totalAttempts--;
                unSolvedGrid[x][y].number = solvedGrid[x][y].number;
                unSolvedGrid[x][y].shouldShow = solvedGrid[x][y].shouldShow;
                unSolvedGrid[x][y].builtIn = solvedGrid[x][y].builtIn;
                continue;
            };

            console.log(solutionsFound)

            solutionsFound = 0;

            totalRemoved++;

            await sleep(100);

            this.setState({attempts: difficulty, unSolvedGrid: this.#copyGrid(unSolvedGrid)});

        }



        console.log("done generating: removed ", totalRemoved);

    }
    
    #genSetAttempts = (difficulty) => {
        return () => {
            // this.setState({attempts});
            this.#findPuzzle(difficulty, this.#solvedGrid);
        }
    }

    componentDidMount = () => {
        const d = 9; // this only makes sense to be a perfect square... will likely get weird issues if not
        this.#numberList = this.#numberListGenerator(d);
        this.#solvedGrid = this.#makeGrid(d);
        this.#fillGrid(this.#solvedGrid);
        this.setState({unSolvedGrid: this.#copyGrid(this.#solvedGrid)});
    }

    render(){

        return <div>
            {!this.state.attempts && <div>
                <button onClick={this.#genSetAttempts(20)}>Easy</button>
                <button onClick={this.#genSetAttempts(30)}>Medium</button>
                <button onClick={this.#genSetAttempts(60)}>Hard</button>
            </div>}
            {this.state.attempts && <div>
                <table className="sudoku-puzzle">
                    <tbody>
                        {this.state.unSolvedGrid.map((row, i) => {
                            return <tr key={i}>{row.map((cell, j) => {

                                return <td key={j}>{cell.number}</td>

                                if(cell.shouldShow) return <td key={j}>{cell.number}</td>
                                    
                                return <td key={j} className={cell.number ? "not-shown": ""}>b</td>
                            })}</tr>
                        })}
                    </tbody>
                </table>
            </div>}
        </div>
    }
}

export default daily_sudoku;