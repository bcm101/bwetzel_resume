import { Component } from "react"

// this component gives the typing animation for the console

export default class Text extends Component{

    state = {
        numbers_shown: 0,
        current_string: "",
        total_time: 0,
        toggle_cursor: false
    }

    data = {
        string: this.props.string || " ",
        show_cursor: this.props.show_cursor === "true" || this.props.show_cursor === true,
        purge_multiple_spaces: this.props.purge_multiple_spaces === "true" || this.props.purge_multiple_spaces === true,
        show_animation: this.props.show_animation === "true" || this.props.show_animation === true,
        speed: Math.abs(parseInt(this.props.speed)) || 100,
        time_before_typing: parseInt(this.props.time_before_typing) ? Math.abs(parseInt(this.props.time_before_typing)) : 0,
        time_after_typing: parseInt(this.props.time_after_typing) ? Math.abs(parseInt(this.props.time_after_typing)) : 0,
        className: this.props.className || ""
    }

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
            
            const className = this.state.numbers_shown === this.data.string.length || !this.data.show_animation ? `is-not-typing ${this.data.className}`: `is-typing ${this.data.className}`;

        

        return (
            <div className={className}>
                {this.props.link && <a href={this.props.link} className={className}>
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
