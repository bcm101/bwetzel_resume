import { Component } from "react";
import './word_search_maker.css';

const word_search_maker = function () {
    return [
        {line: "This is an webpage that can be run by accessing the following link. This project is meant to show my understanding of algorithms, as well as to benefit my mother who is a teacher and uses games to assess student understanding.", className: "opened-file", remove_spaces: true},
        {line: "link", link: "/bwetzel_resume/#/fs?path=~/Projects/word_search_maker.html"}
    ];
}

// 128 bit hashing function
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

word_search_maker.component = class extends Component {

    state = {
        words: [],
        randomSeed: null,
        characters: [],
        w: null,
        h: null,
        showingPopup: false,
        hardMode: null,
        showSolutions: false
    }

    #isMobile = window.visualViewport.width < 600;
    #needUpdate = false;
    #rand = Math.random
    #currentWordStr = "";
    #selectedSavedWS = {};
    #currentWordSearch = null;

    componentDidUpdate  = () => {
        if(this.state.randomSeed && typeof this.state.randomSeed === "string" && this.#needUpdate)
            this.#rand = getRand(this.state.randomSeed);

        try{
            if(this.#needUpdate)
                this.#create();
            if(this.#currentWordSearch)
                this.#draw();
        }catch(e){
            if(typeof e === "string"){
                const words = document.getElementById("words");
                words.value = words.value + "\n" + e;
                words.style.color = "red";
            };
        }

    }

    #draw = () => {

        const wordSearch = this.#currentWordSearch;
        
        const {w,h} = this.state;

        const ws = document.getElementById("word-search");
        ws.width = w * 100;
        ws.height = h * 100;
        const vw = window.visualViewport.width;
        const vh = window.visualViewport.height;
        const maxStyleHeight = vh * .7;
        const maxStyleWidth = vw * .8;
        const ratio = w/h;
        const fontSize = 50;
        const lineWidth = 200 / Math.max(w, h);

        let styleWidth = maxStyleWidth;
        let styleHeight = styleWidth / ratio;

        if(styleHeight > maxStyleHeight){
            styleHeight = maxStyleHeight;
            styleWidth = styleHeight * ratio;
        }

        ws.style.width = `${styleWidth}px`;
        ws.style.height = `${styleHeight}px`;
        
        const ctx = ws.getContext("2d");
        const cellWidth = ws.width / w;
        const cellHeight = ws.height / h;

        ctx.font = `${fontSize}px Arial`;
        ctx.clearRect(0, 0, ws.width, ws.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,ws.width, ws.height);
        ctx.fillStyle = "black";
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(0,0, ws.width, ws.height);

        for(let i = 0; i < w*h; i++){
            const x = i % w;
            const y = Math.floor(i / w);
            const currentCell = wordSearch[x][y];

            const cellPosOnCanvasX = cellWidth * x + cellWidth /2 - fontSize /2;
            const cellPosOnCanvasY = cellHeight * y + cellHeight /2 + fontSize /2;

            if(this.state.showSolutions && currentCell.partOfWord) ctx.fillStyle = "red";

            ctx.fillText(currentCell.ch, cellPosOnCanvasX, cellPosOnCanvasY);

            ctx.fillStyle = "black";
        }
    }

    #create(){
        const {words, characters, w, h} = this.state;
        this.#needUpdate = false;

        const randomCharacter = () => {
            return characters[Math.floor(this.#rand()*characters.length)];
        }

        const directions = {
            up: 0,
            upRight: 1,
            right: 2,
            downRight: 3,
            down: 4,
            downLeft: 5,
            left: 6,
            upLeft: 7
        }

        const wordSearch = new Array(w)
        .fill(0)
        .map(_i => new Array(h)
            .fill(0)
            .map(_j => {return {ch: randomCharacter(), partOfWord: null}})
        );

        const copyWordSearch = (ws) => {
            return new Array(w)
            .fill(0)
            .map((_e,i) => new Array(h)
                .fill(0)
                .map((_e, j) => {return {ch: ws[i][j].ch.slice(0), partOfWord: ws[i][j].partOfWord?.slice(0)}})
            );
        };

        const copyWords = (words) => {
            return new Array(words.length)
            .fill(0)
            .map((_e, i) => new Array(words[i].length)
                .fill(0)
                .map((_, j) => words[i][j].slice(0))
            );
        };

        const possibleCells = (direction, wordLength) => {

            wordLength = wordLength || 0;

            return new Array(w*h)
            .fill(0)
            .map((_e, i) => {
                return {x: i % w, y: Math.floor(i / w)};
            })
            .filter(({x,y}) => {

                const spaceUp = wordLength < y+1;
                const spaceDown = wordLength <= h - y ;
                const spaceLeft = wordLength < x+1;
                const spaceRight = wordLength <= w - x;

                return (direction === directions.right && spaceRight) ||
                (direction === directions.downRight && spaceDown && spaceRight) ||
                (direction === directions.down && spaceDown) ||
                (direction === directions.downLeft && spaceDown && spaceLeft) ||
                (direction === directions.left && spaceLeft) ||
                (direction === directions.upLeft && spaceLeft && spaceUp) ||
                (direction === directions.up && spaceUp) ||
                (direction === directions.upRight && spaceRight && spaceUp);
            });
        };

        const nextCellInDirection = (x, y, direction) => {
            switch(direction){
                case directions.up:
                    return {x, y: y-1};
                case directions.upRight:
                    return {x: x+1, y: y-1};
                case directions.right:
                    return {x: x+1, y};
                case directions.downRight:
                    return {x: x+1, y: y+1};
                case directions.down:
                    return {x, y: y+1};
                case directions.downLeft:
                    return {x: x-1, y: y+1};
                case directions.left:
                    return {x: x-1, y};
                case directions.upLeft:
                    return {x: x-1, y: y-1};
            }
        }

        const states = [{words: copyWords(words), ws: copyWordSearch(wordSearch), attempts: 0}];

        const attemptsPer = 20;

        const maxRuns = 50000;
        let numRun = 0;

        do {
            const wordListAtState = copyWords(states[states.length-1].words);
            const wordSearchAtState = copyWordSearch(states[states.length-1].ws);
            const attempts = states[states.length-1].attempts;

            if(attempts > attemptsPer){
                states.pop();
                continue;
            };

            const wordIndex = Math.floor(this.#rand() * wordListAtState.length);
            const word = wordListAtState[wordIndex] || [];
            wordListAtState.splice(wordIndex, 1);

            const d = this.state.hardMode ? [0,1,2,3,4,5,6,7]: [2,3,4];

            let fits = false;

            while(d.length && !fits){
                const dIndex = Math.floor(this.#rand() * d.length);
                const rd = d[dIndex];

                const cellLocations = possibleCells(rd, word.length);

                while(cellLocations.length && !fits){
                    const cellLocationIndex = Math.floor(this.#rand() * cellLocations.length);
                    let currentCellLocation = cellLocations[cellLocationIndex];

                    let foundBreak = false;

                    for(let j = 0; j < word.length; j++){
                        const currentCell = wordSearchAtState[currentCellLocation.x][currentCellLocation.y];

                        const canBeUsed = !currentCell.partOfWord || currentCell.ch === word[j];
                        if(!canBeUsed){
                            foundBreak = true;
                            break;
                        }

                        currentCellLocation = nextCellInDirection(currentCellLocation.x, currentCellLocation.y, rd);
                    }
                    if(!foundBreak){
                        fits = true;
                        currentCellLocation = cellLocations[cellLocationIndex];
                        for(let j = 0; j < word.length; j++){
                            const currentCell = wordSearchAtState[currentCellLocation.x][currentCellLocation.y];
                            currentCell.ch = word[j];   
                            currentCell.partOfWord = word.join('-');
                            currentCellLocation = nextCellInDirection(currentCellLocation.x, currentCellLocation.y, rd);
                        }
                        if(states.length === words.length || !words.length) {
                            this.#currentWordSearch = wordSearchAtState;                            
                            return wordSearchAtState;
                        }
                        else states.push({words: wordListAtState, ws: wordSearchAtState, attempts: 0});
                    }

                    cellLocations.splice(cellLocationIndex, 1);
                }

                d.splice(dIndex, 1);
            }

            if(!fits){
                states.pop();
                if(states.length)
                    states[states.length-1].attempts += 1;
            }

            numRun++;


        }while(states.length && numRun < maxRuns);

        throw `Error: At least one word cannot fit`;
    }

    #parseWordInput(str){
        return str
        .match(/[a-zA-Z0-9<>]+/g)
        .map(e => e.match(/(?<=<)[^<>]+(?=>)|[^<>]/g))
    }

    #parseWH(str){
        let [w, h] = str.matchAll(/[0-9]+/g).map(g=>parseInt(g[0]));
        if(!w || w < 1) w = 20;
        if(!h || h < 1) h = 20;
        return {w,h};
    }

    #updateState = () => {
        const seedInput = document.getElementById("rand-seed");
        const randomSeed = seedInput.value ? seedInput.value: null;

        const listInput = document.getElementById("words");
        const words = listInput.value ?
            this.#parseWordInput(listInput.value):
            []
        listInput.style.color = "black";

        const allLetters = "abcdefghijklmnopqrstuvwxyz";
        const a_z = document.getElementById("a-z").checked ? allLetters: [];
        const A_Z = document.getElementById("A-Z").checked ? allLetters.toUpperCase(): [];
        const characters = [...new Set([
            ...a_z,
            ...A_Z,
            ...words
                .flat()
        ])]

        const {w,h} = this.#parseWH(document.getElementById("w-h").value);

        const hardMode = document.getElementById("hard").checked;

        this.#needUpdate = true;
        this.setState({randomSeed, words, characters, w, h, hardMode});
    }

    #removeCharacter = (i) => {
        return () => {
            if(this.state.characters.length > 1){
                const newCharList = [...this.state.characters.slice(0, i), ...this.state.characters.slice(i+1)];
                this.#needUpdate = true;
                this.setState({characters: newCharList});
            }
        }
    }

    #togglePopup = () => {
        this.#selectedSavedWS = {};
        this.setState({showingPopup: !this.state.showingPopup});
    }

    #saveCurrent = () => {
        try{
            
            const name = document.getElementById("save-input-name").value;
            const words = document.getElementById("words").value;

            if(words && name){
                const seed = document.getElementById("rand-seed").value;
                const size = document.getElementById("w-h").value;
                const incA_Z = document.getElementById("A-Z").checked;
                const inca_z = document.getElementById("a-z").checked;
                const hardMode = document.getElementById("hard").checked;
                const characters = this.state.characters;
                const json = JSON.stringify({words, seed, size, incA_Z, inca_z, characters, hardMode});
                window.localStorage.setItem(name, json);
                this.setState({showingPopup: true});
            }
            
        }catch(e){
            console.error(e);
        }
    }

    #clickSaved = (e) => {
        const allSaved = document.getElementsByClassName("saved-ws");
        for(let i = 0; i < allSaved.length; i++)
            allSaved[i].classList.remove('selected');

        e.target.parentElement.classList.add('selected');
    }

    #loadSaved = () => {
        const savedWs = this.#selectedSavedWS;
        document.getElementById("words").value = savedWs.words;
        const parsedWords = this.#parseWordInput(savedWs.words);
        const {w,h} = this.#parseWH(savedWs.size);

        if(savedWs.seed) document.getElementById("rand-seed").value = savedWs.seed;        
        if(savedWs.size) document.getElementById("w-h").value = savedWs.size;
        document.getElementById("A-Z").checked = savedWs.incA_Z === true;
        document.getElementById("a-z").checked = savedWs.inca_z === true;
        document.getElementById("hard").checked = savedWs.hardMode === true;
        
        this.#needUpdate = true;
        this.setState({characters: savedWs.characters, words: parsedWords, w, h, randomSeed: savedWs.seed, hardMode: savedWs.hardMode});

    }

    #deleteSaved = () => {
        try{
            const allSaved = document.getElementsByClassName("saved-ws");
            for(let i = 0; i < allSaved.length; i++)
                allSaved[i].classList.remove('selected');

            window.localStorage.removeItem(this.#selectedSavedWS.name);
            this.#selectedSavedWS = {};
            
            this.setState({showingPopup: true});
        }catch(e){
            console.error(e);
        }
    }

    #print = (e) => {

        const canvas = document.getElementById('word-search');
        if(!canvas) return;

        const noPrints = document.getElementsByClassName('no-print');
        for(let i = 0; i < noPrints.length; i++) noPrints[i].hidden = true;

        const printScreen = document.getElementById('print');
        printScreen.hidden = false;

        const currentWH = {h: canvas.style.height, w: canvas.style.width};

        canvas.style.height = '70vh';
        canvas.style.width = '70vw';

        window.print();
        
        // canvas.style.height = currentWH.h;
        // canvas.style.width = currentWH.w;

        // for(let i = 0; i < noPrints.length; i++) noPrints[i].hidden = false;
        // printScreen.hidden = true;

    }

    render(){

        let savedWs = [];

        if(this.state.showingPopup)
            try{
                const obj = window.localStorage;
                const keys = Object.keys(obj);

                for(let i = 0; i < keys.length; i++){
                    const name = keys[i];
                    try{
                        const json = JSON.parse(window.localStorage.getItem(name));
                        const words = json.words;
                        const seed = json.seed;
                        const size = json.size;
                        const incA_Z = json.incA_Z;
                        const inca_z = json.inca_z;
                        const hardMode = json.hardMode;
                        const characters = json.characters;
                        if(words)
                            savedWs.push({words, seed, name, size, incA_Z, inca_z, characters, hardMode});
                    }catch(e){
                        // this is expected if other things in localstorage
                    }

                }

                savedWs.sort();

            }catch(e){
                console.error(e);
            }
        
        return <div>
            <div id="inputs" className="no-print">
                <div className="word-list-input">
                    <textarea id="words" placeholder="comma seperated list of words, group letters by inserting between < and >" className={this.#isMobile ? "on-mobile": ""} onChange={e => {this.#currentWordStr = e.target.value}}></textarea>
                    {!this.#isMobile && <div id="ch-list">
                        {!this.state.characters.length && <input placeholder="character list" readOnly></input>}
                        {this.state.characters.map((ch, i) => <div className="character" key={i} onClick={this.#removeCharacter(i)}>{ch}</div>)}
                    </div>}
                </div>
                <div className="state-inputs">
                    <div className="rs inp-w"><input id="rand-seed" placeholder="random seed"></input></div>
                    <div className="w-h inp-w"><input id="w-h" placeholder="w,h"></input></div>
                    <div className="a-z">{!this.#isMobile && "Include a-z: "}<input id="a-z" type="checkbox"></input></div>
                    <div className="A-Z">{!this.#isMobile && "Include A-Z: "}<input id="A-Z" type="checkbox" defaultChecked></input></div>
                    <div className="hard-move">{!this.#isMobile && "Hard Mode: "}<input id="hard" type="checkbox" defaultChecked></input></div>
                    <div className="sol">{!this.#isMobile && "Show solutions: "}<input id="sol" type="checkbox" onClick={() => {this.setState({showSolutions: !this.state.showSolutions})}}></input></div>
                    <div className="save-load">{!this.#isMobile && "Save/Load: "}<button id="save-load" onClick={this.#togglePopup}>SL</button></div>
                </div>
                <div className="generate no-print">
                        <div>{!this.#isMobile && "Generate: "}<button id="generate" onClick={this.#updateState}>G</button></div>
                        <div>{!this.#isMobile && "Print: "}<button id="print-button" onClick={this.#print}>P</button></div>
                </div>
                {!this.state.characters.length && <div>
                    <br></br>
                    <p>Hi! This website is designed to help two teachers in my family to generate word searches to help teach kids. To make a word search, enter a list of words to be included in the word search. Then, enter the optional inputs of setting width/height ('w,h' input box) and setting a random seed. A random seed will determine whether the word search will be the same next time you generate with the same inputs. For example, if you generate a word search with the random seed of 'hello', and then you generate it again, the word search will not change as the seed is the exact same. But, if you remove the random seed and generate twice you will see two different word searches.</p>
                    <p>This word search also lets you customize with the way characters are handled more than traditional word search generators. If you aren't on mobile, you can see a character list in the top right of the screen when you hit generate. This list lets you remove individual characters from showing up in the word list. Moreover, the 'include a-z' checkbox (leftmost) and 'include A-Z' checkbox (second to the left) will include all the lowercase and uppercase letters in the character list respectively. If you wish to include a combination of characters as a single space in the word search, group letters when entering them in the word list using brackets, which is useful to include digraphs like 'th' or 'sh'.</p>
                    <p>One can save word searches by hitting the save/load button (rightmost), and entering a name for to save it under. Hit save, and you should see it appear in the dropdown. If it does not appear, your browser does not allow data to be saved to its local storage, and you will have to save it externally. Printing word searches is possible through the print button, but it will automatically stretch the word search; so it works best with square-ish shaped word searches.</p>
                    <p>Lastly, hard mode (second to last checkbox) is when words can go in all directions in the word search including in reverse (right to left). Not hard mode is restricted to only 3 directions: down, diagonal, and right.</p>
                    <p>-Brandon</p>
                </div>}
            </div>
            
            {this.state.w && this.state.h && this.state.characters.length && <canvas id="word-search" className="no-print"></canvas>}

            <div id="popup" className={this.state.showingPopup ? "show no-print": "no-print"}>
                <div className="top-popup">
                    <div>Current Word-Search</div>
                    <div className="possible-save">
                        <div>{this.state.showingPopup && <input autoFocus placeholder="type name here" id="save-input-name"></input>}</div>
                        <div>{[...this.#currentWordStr.slice(0, 31), ..."..."].join('')}</div>
                    </div>
                    <button className="save" onClick={this.#saveCurrent}>Save</button>
                </div>
                
                <div className="bottom-popup">
                    <div>All Saved Word-Searches</div>
                    <div className="all-saved-ws">
                        {savedWs.map((saved, i) => {
                            return <div key={i} className="saved-ws" onClick={(e) => {
                                this.#selectedSavedWS = saved;
                                this.#clickSaved(e);
                            }}>
                                <div><b>{saved.name}</b></div>
                                <div>{[...saved.words.slice(0, 31), ..."..."].join('')}</div>
                            </div>
                        })}
                    </div>
                    <div className="lde-buttons">
                        <div><button onClick={this.#loadSaved}>Load</button></div>
                        <div><button onClick={this.#deleteSaved}>Delete</button></div>
                        <div><button onClick={this.#togglePopup}>Exit</button></div>
                    </div>
                </div>
            </div>
            <div id="print" hidden>
                <div className="word-list-print-ready">
                    <div><b>Word List</b></div>
                    <div className="word-list-print-block">
                        {this.state.words.map((word, i) => {
                            return <div key={i}> {word.join('')} </div>
                        })}
                    </div>
                </div>
            </div>
        </div>
    }

}

export default word_search_maker;