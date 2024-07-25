import { Component } from "react";
import './daily_sudoku.css';

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
        difficulty: null,
        unSolvedGrid: null,
        isComplete: false
    }

    #rand; // random function that enables daily puzzles that are the same for everyone
    #numberList; // list of possible numbers to fill in (1-9 usually for sudoku)
    #solvedGrid; // solution grid
    #selectedCell;
    #timeStart;
    #gridVisible = false;
    #madeChangeToGrid = false;
    // #isMobile = window.visualViewport.width < 700 || window.visualViewport.height < 700;

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
                return {number: 0, builtIn: true, shouldShow: false, wrong: false}
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

    #getRow(x, grid){
        return grid[x].map(e => e.number);
    }

    #getCol(y, grid){
        return grid.map(e => e[y].number);
    }

    #isCorrectGrid(grid){
        const d = grid.length;
        for(let i = 0; i < d; i++)
            for(let j = 0; j < d; j++)
                if(grid[i][j].number === 0 || grid[i][j].wrong)
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
                const numberList = this.#numberList.slice(0);

                this.#shuffle(numberList);
                for(let j = 0; j < d; j++){
                    const number = numberList[j];
                    const row = this.#getRow(x, grid);
                    if(!row.includes(number)){ // not include in row
                        const col = this.#getCol(y, grid)
                        if(!col.includes(number)){ // not include in column
                            const square = this.#getSquare(x, y, grid);
                            if(!square.includes(number)){ // not included in the square
                                grid[x][y].number = number;
                                if(this.#isCorrectGrid(grid))
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
                    shouldShow: grid[i][j].shouldShow,
                    wrong: grid[i][j].wrong
                }
            })
        );
    }

    #showGrid = grid => {
        this.#gridVisible = true;
        return grid.map(row => {
            return row.map(cell => {
                return {number: cell.number, builtIn: cell.builtIn, shouldShow: true, wrong: cell.wrong};
            });
        });
    };

    async #findPuzzle(difficulty, solvedGrid){

        let unSolvedGrid = this.#copyGrid(solvedGrid);
        const d = solvedGrid.length;
        let solutionsFound = 0;
        let totalAttempts = 20;
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

                    const numberList = this.#numberList.slice(0);
                    this.#shuffle(numberList);

                    for(let j = 0; j < d; j++){
                        
                        const number = numberList[j];
                        const row = grid[x].map(e => e.number);
                        if(!row.includes(number)){ // not include in row
                            const col = grid.map(e => e[y].number);
                            if(!col.includes(number)){ // not include in column
                                const square = this.#getSquare(x, y, grid);
                                if(!square.includes(number)){ // not included in the square
                                    grid[x][y].number = number;
                                    if(this.#isCorrectGrid(grid)){
                                        solutionsFound++;
                                        break;
                                    }
                                    else{
                                        if(countSolutions(grid))
                                            return true;
                                    }
                                         
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

        while(totalRemoved < difficulty && totalAttempts > 0){
            let x = Math.floor(this.#rand() * d);
            let y = Math.floor(this.#rand() * d);

            while(!unSolvedGrid[x][y].number){
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
                solutionsFound = 0;

                if(totalAttempts === 0)
                    this.setState({difficulty: difficulty, unSolvedGrid: this.#showGrid(unSolvedGrid)});

                continue;
            };

            solutionsFound = 0;

            totalRemoved++;

            if(totalRemoved === difficulty) {
                await sleep(300);
                this.setState({difficulty: difficulty, unSolvedGrid: this.#showGrid(unSolvedGrid)});
                break;
            }

            await sleep(50);

            this.setState({difficulty: difficulty, unSolvedGrid: this.#copyGrid(unSolvedGrid)});

        }

        console.log("done generating: removed ", totalRemoved);

        return unSolvedGrid;
    }
    
    #loadGrid = async (d, difficulty) => {

        try{ // find grid in local storage perchance?
            const item = window.localStorage.getItem(`BWetzel-DailySudoku-${difficulty}`);
            const {unSolvedGrid, solvedGrid, date} = JSON.parse(item);
            if(unSolvedGrid && solvedGrid && date === this.#getDay()){
                this.#solvedGrid = solvedGrid;
                const isComplete = this.#isCorrectGrid(unSolvedGrid);
                this.setState({difficulty, unSolvedGrid: this.#showGrid(unSolvedGrid), isComplete});
                return;
            }else throw new Error("no local storage found");          
        }catch(e){
            console.log("generating...");
        }

        this.#setUpStartGrid(d);
        const grid = await this.#findPuzzle(difficulty, this.#solvedGrid);
        this.#saveGrid(difficulty, grid);
    }

    #saveGrid = (identifier, grid) => {
        if(this.#gridVisible){
            const json = JSON.stringify({unSolvedGrid: grid, solvedGrid: this.#solvedGrid, date: this.#getDay()});
            const key = `BWetzel-DailySudoku-${identifier}`;
            try{
                window.localStorage.setItem(key, json);
            }catch(e){
                console.error(e);
            }
        }
    }

    #generateAndSetDifficulty = (d, difficulty) => {
        return () => {
            this.#rand = getRand(`${this.#getDay()}${difficulty}`);
            this.#loadGrid(d, difficulty);
        }
    }

    #selectCell = (x,y) => {
        return (e) => {
            if(this.#selectedCell?.target === e.target){
                this.#selectedCell = null;
                e.target.classList.remove("selected");
                return;
            }
            this.#selectedCell = {target: e.target, x, y};
            const allSelected = document.getElementsByClassName("selected");
            for(let i = 0; i < allSelected.length; i++) allSelected[i].classList.remove("selected");
            e.target.classList.add("selected");
        }
    }

    #setUpStartGrid = d => {
        this.#numberList = this.#numberListGenerator(d);
        this.#solvedGrid = this.#makeGrid(d);
        this.#fillGrid(this.#solvedGrid);
        this.setState({unSolvedGrid: this.#copyGrid(this.#solvedGrid)});
    }

    componentDidUpdate = () => {
        if(this.#madeChangeToGrid){
            this.#madeChangeToGrid = false;
            this.#saveGrid(this.state.difficulty, this.state.unSolvedGrid);
        }
    }

    componentDidMount = () => {
        document.addEventListener("keydown", (e) => {
            if(this.#selectedCell){
                let key = parseInt(e.key);
                if(key && key <= this.state.unSolvedGrid.length){
                    const unSolvedGrid = this.#copyGrid(this.state.unSolvedGrid)

                    const x = this.#selectedCell.x;
                    const y = this.#selectedCell.y;

                    const newObjForSelectedCell = {
                        number: key,
                        builtIn: unSolvedGrid[x][y].builtIn,
                        shouldShow: unSolvedGrid[x][y].shouldShow,
                        wrong: this.#solvedGrid[this.#selectedCell.x][this.#selectedCell.y].number !== key
                    }

                    unSolvedGrid[x][y] = newObjForSelectedCell;

                    this.#madeChangeToGrid = true;

                    if(this.#isCorrectGrid(unSolvedGrid)){
                        this.#selectedCell = null;
                        this.setState({unSolvedGrid: unSolvedGrid, isComplete: true});
                    }else
                        this.setState({unSolvedGrid: unSolvedGrid});
                    
                }
                    
                if(e.key === "Backspace" || e.key === "Delete"){
                    const unSolvedGrid = this.#copyGrid(this.state.unSolvedGrid)

                    const x = this.#selectedCell.x;
                    const y = this.#selectedCell.y;

                    const newObjForSelectedCell = {
                        number: 0,
                        builtIn: unSolvedGrid[x][y].builtIn,
                        shouldShow: unSolvedGrid[x][y].shouldShow,
                        wrong: false
                    }
                    
                    unSolvedGrid[x][y] = newObjForSelectedCell;

                    this.#madeChangeToGrid = true;

                    this.setState({unSolvedGrid: unSolvedGrid});
                }
                    
            }
        });

        this.#timeStart = Date.now();

    }

    #print = (e) => {
        e.target.parentElement.hidden = true;
        document.getElementById("sudoku-puzzle").style.width = "70vw";
        document.getElementById("sudoku-puzzle").style.height = "70vw";
        document.getElementById("sudoku-puzzle").style.left = "15vw";
        document.getElementById("sudoku-puzzle").style.top = "0";
        window.print();
        // window.location.reload();
    }

    render(){

        const rand = getRand(this.#getDay());

        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height; 

        let dimensionOfPuzzle = Math.min(screenWidth * .8, screenHeight * .8);
        const showKeysUnder = screenWidth - 2 * dimensionOfPuzzle < 100;

        let leftMarginPuzzle;
        let topMarginPuzzle;
        let leftMarginKeys;
        let topMarginKeys;
        let keypadWidth;
        let keypadHeight;

        if(showKeysUnder){
            topMarginPuzzle = `10px`;
            leftMarginPuzzle = `calc(50vw - ${dimensionOfPuzzle/2}px)`;
            leftMarginKeys = `calc(50vw - ${dimensionOfPuzzle/2}px)`;
            topMarginKeys = `${20+dimensionOfPuzzle}px`;
            keypadWidth = dimensionOfPuzzle;
            keypadHeight = `${screenHeight - dimensionOfPuzzle - 20}px`;
        }else{
            topMarginPuzzle = `calc(50vh - ${dimensionOfPuzzle/2}px)`;
            leftMarginPuzzle = `50px`;
            leftMarginKeys = `${75 + dimensionOfPuzzle}px`;
            topMarginKeys = `calc(50vh - ${dimensionOfPuzzle/2}px)`;
            keypadWidth = keypadHeight = dimensionOfPuzzle;
        }

        return <div style={{width: "100vw", height: "100vh"}}>
            {!this.state.difficulty &&<div>
                <div className="header">Daily Sudoku Puzzles!</div>
                <button onClick={this.#generateAndSetDifficulty(4, 14)} className="button-option">4x4</button>
                <button onClick={this.#generateAndSetDifficulty(9, 30)} className="button-option">Easy</button>
                <button onClick={this.#generateAndSetDifficulty(9, 40)} className="button-option">Medium</button>
                <button onClick={this.#generateAndSetDifficulty(9, 60)} className="button-option">Hard</button>
            </div>}
            {this.state.difficulty && <div style={{width: '100vw', height: '100vh'}}>
                <table id="sudoku-puzzle" className={this.state.isComplete ? "completed": ""} style={{
                    width: `${dimensionOfPuzzle}px`, 
                    height: `${dimensionOfPuzzle}px`, 
                    left: leftMarginPuzzle, 
                    top: topMarginPuzzle
                }}>
                    <tbody>
                        {this.state.unSolvedGrid.map((row, i) => {
                            const d = row.length;
                            const square = Math.floor(Math.pow(d, .5));
                            const percentageofTable = Math.round(10000 / d) / 100;

                            return <tr key={i} style={{width: "100%", height: `${percentageofTable}%`}}>{row.map((cell, j) => {

                                const listOfColors = ["red", "blue", "green"];
                                const color = listOfColors[Math.floor(rand() * listOfColors.length)]

                                const shownClassname = cell.shouldShow ? "shown": `not-shown ${color}`;
                                const leftSideofSquare = j % square === 0 ? " left-square": "";
                                const rightSideofSquare = j % square === square-1 ? " right-square": "";
                                const topofSquare = i % square === 0 ? " top-square": "";
                                const bottomofSquare = i % square === square-1 ? " bottom-square": "";
                                const typable = cell.builtIn || this.state.isComplete ? " not-typable": " typable";
                                const wrong = cell.wrong ? " wrong": "";
                                const selected = this.#selectedCell?.x === i && this.#selectedCell?.y === j ? " selected": "";

                                const onclick = cell.builtIn || this.state.isComplete ? () => {}: this.#selectCell(i, j);

                                const cn = `${shownClassname}${leftSideofSquare}${rightSideofSquare}${topofSquare}${bottomofSquare}${typable}${wrong}${selected}`;

                                return <td key={j} className={cn} style={{
                                    width: `${percentageofTable}%`, 
                                    height: `${percentageofTable}%`,
                                    fontSize: `${dimensionOfPuzzle/d/2}px`
                                }} onClick={onclick}>
                                    {cell.shouldShow && cell.number > 0 ? cell.number: ""}
                                </td>
                            })}</tr>
                        })}
                    </tbody>
                </table>
            </div>}
            {this.state.difficulty && <div id="keypad" style={{
                left: leftMarginKeys,
                top: topMarginKeys,
                width: keypadWidth,
                height: keypadHeight
            }}>
                {this.#numberListGenerator(this.state.unSolvedGrid.length+1).map((num, i) => {
                    

                    const d = this.state.unSolvedGrid.length;

                    if(i === d) return <button id="print" onClick={this.#print}>print</button>

                    let width;

                    if(screenHeight - dimensionOfPuzzle - 20 > dimensionOfPuzzle || !showKeysUnder)
                        width = keypadWidth / Math.pow(d, .5);
                    else
                        width = keypadWidth / d;

                    const height = keypadHeight;
                    const maxHeight = dimensionOfPuzzle / Math.pow(d, .5);
                    const fontSize = `${Math.max(width/8, height/8)}px`;
                    const onclick = () => {
                        document.dispatchEvent(new KeyboardEvent('keydown', {key: `${num}`}));
                    }

                    return <button onClick={onclick} key={i} style={{width, height, maxHeight, fontSize}}>{num}</button>
                })}
            </div>}
            {/* {this.state.difficulty && <button id="print">print</button>} */}
            {this.state.isComplete && <div id="success-popup">
                <p>You completed the daily sudoku puzzle!</p>
                <p>Congratulations!</p>
                <p>Come back tomorrow for a new sudoku</p>
            </div>}
            
        </div>
    }
}

export default daily_sudoku;