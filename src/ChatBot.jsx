import { Component, createElement } from "react";
import { hot } from "react-hot-loader/root";
import ReactWebChat, { createStore, createDirectLine } from "botframework-webchat";
import "./ui/ChatBot.css";

class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hideUploadButton: !props.upload,
            widgetReady: false
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            if (
                this.props.secret.status == "available" &&
                this.props.context.status == "available" &&
                this.props.username.status == "available" &&
                this.props.userid.status == "available"
            ) {
                const store = createStore({}, ({ dispatch }) => next => action => {
                    if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
                        dispatch({
                            type: "WEB_CHAT/SEND_EVENT",
                            payload: {
                                name: "context/set",
                                value: {
                                    app: "web",
                                    context: this.props.context.value
                                }
                            }
                        });
                        dispatch({
                            type: "WEB_CHAT/SEND_EVENT",
                            payload: {
                                name: "user/set",
                                value: {
                                    email: "pzajac@objectivity.co.uk"
                                }
                            }
                        });
                    }
                    return next(action);
                });
                const directLine = createDirectLine({ secret: this.props.secret.value });
                this.setState({ directLine: directLine, widgetReady: true, store: store });
                clearInterval(this.interval);
            }
        }, 50);
    }

    render() {
        const chatStyling = {
            hideUploadButton: this.state.hideUploadButton
        };
        if (this.state.widgetReady) {
            return (
                <div id="chatbot-container" style={this.props.style} className={this.props.class}>
                    <ReactWebChat
                        userID={this.props.userid.value}
                        username={this.props.username.value}
                        directLine={this.state.directLine}
                        store={this.state.store}
                        styleOptions={chatStyling}
                    />
                </div>
            );
        } else {
            return (
                <div id="chatbot-container" style={this.props.style} className={this.props.class}>
                    Loading...
                </div>
            );
        }
    }
}

export default hot(ChatBot);
