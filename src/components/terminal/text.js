import { Component } from "react"

// this component gives the typing animation for the console

export default class Text extends Component{

    state = {
        numbers_shown: 0,
        current_string: "",
        total_time: 0,
        toggle_cursor: false
    }

    /*additional props
        link: for when a text is a link as well
        before_string: text to display before typed text on the same line
        callbaack: function to callback when done typing
    */
    data = {
        string: this.props.string || " ", // string to type
        show_cursor: this.props.show_cursor === "true" || this.props.show_cursor === true, // show cursor during animation
        purge_multiple_spaces: this.props.purge_multiple_spaces === "true" || this.props.purge_multiple_spaces === true, // remove spaces from inbetween multiple (could be relevant for ASCII art)
        show_animation: this.props.show_animation === "true" || this.props.show_animation === true, // show animation of typing
        speed: Math.abs(parseInt(this.props.speed)) || 100, // typing speed animation
        time_before_typing: parseInt(this.props.time_before_typing) ? Math.abs(parseInt(this.props.time_before_typing)) : 0, // time before typing while showing cursor
        time_after_typing: parseInt(this.props.time_after_typing) ? Math.abs(parseInt(this.props.time_after_typing)) : 0, // time after typing while showing cursor
        className: this.props.className || "", // additional classnames aside from built in for 'is-typing' and 'is-not-typing'
        clickable: this.props.clickable || false
    }

    callback = typeof this.props.callback === 'function' ? this.props.callback: () => {}

    render() {

        if(this.data.show_animation)
            window.setTimeout(() => {
                if(this.state.numbers_shown < this.data.string.length && this.state.total_time >= this.data.time_before_typing) {
                    let to_add = this.data.string[this.state.numbers_shown] === ' ' && !this.data.purge_multiple_spaces ? "\u00A0": this.data.string[this.state.numbers_shown]
                    this.setState({
                        total_time: this.state.total_time+this.data.speed,
                        numbers_shown: this.state.numbers_shown+1,
                        current_string: this.state.current_string+to_add,
                        toggle_cursor: true
                    });
                }else if(this.state.numbers_shown < this.data.string.length){
                    this.setState({
                        total_time: this.state.total_time+this.data.speed,
                        toggle_cursor: !this.state.toggle_cursor
                    })
                }else if(this.data.time_after_typing > 0){
                    this.data.time_after_typing -= this.data.speed;
                    this.setState({
                        total_time: this.state.total_time+this.data.speed,
                        toggle_cursor: this.data.time_after_typing <= 0 ? false: !this.state.toggle_cursor
                    })
                }
            }, this.data.speed)
            
            const isTypingClass = this.state.numbers_shown === this.data.string.length || !this.data.show_animation ? `is-not-typing `: `is-typing `;
            const clickable = this.data.clickable ? `clickable-text `: '';

            const className = `${isTypingClass}${clickable}${this.data.className}`

            if(this.state.numbers_shown === this.data.string.length && this.data.time_after_typing <= 0){
                this.callback();
            }

        return (
            <div className={className} onClick={this.data.clickable ? this.data.clickable: () => {}}>
                {this.props.link && <a href={this.props.link} className={`${className} terminal-link`}>
                    {this.props.before_string}
                    {this.data.show_animation && this.state.current_string}
                    {!this.data.show_animation && (this.data.purge_multiple_spaces ? this.data.string: this.data.string.replace(/ /g, "\u00A0"))}
                    {this.state.toggle_cursor && this.data.show_cursor && '|'}
                </a>}
                {!this.props.link && <>
                    {this.props.before_string}
                    {this.data.show_animation && this.state.current_string}
                    {!this.data.show_animation && (this.data.purge_multiple_spaces ? this.data.string: this.data.string.replace(/ /g, "\u00A0"))}
                    {this.state.toggle_cursor && this.data.show_cursor && '|'}
                </>}
            </div>
        )
    }
}
