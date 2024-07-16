import { Component } from "react"

const maze_maker = function () {
    return [
        {line: "This is an webpage that can be run by accessing this link:", className: "opened-file", remove_space: "true"},
        {line: "link", link: "/bwetzel_resume/#/fs?path=~/Projects/maze_maker.html"}
    ];
}

maze_maker.component = class extends Component{

    state = {
        w: 20,
        h: 20,
        startX: 1,
        startY: 1,
        isCircle: false
    }

    render(){



        return <div>maze maker html page hello world ayyaya</div>
    }
}

export default maze_maker;