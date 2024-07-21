import { Component } from "react";

const daily_sudoku = function () {
    return [
        {line: "This is a website linked below that will generate sudoku puzzles daily.", className: "opened-file", remove_space: true},
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

    #rand = getRand(this.#getDay());

    #makeGrid(d) {
        const cellsList = new Array(d*d)
        .fill(0)
        .map((_, i) => {
            return {x: i % d, y: Math.floor(i / d)}
        });
        const grid = new Array(d)
        .fill(0)
        .map(_ => new Array(d)
            .fill(0)
        );
        return {cellsList, grid};
    }
    
    #selectRandomFromList(array){
        if(!array || array.length < 1) return null;

        return array[Math.floor(array.length * this.#rand())];
    }

    #solveGrid(grid){
        
    }
    
    render(){
        return <div>hello</div>
    }
}

export default daily_sudoku;