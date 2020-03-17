import { Component, createElement } from "react";
import { hot } from "react-hot-loader/root";
import ReactWebChat, { createStore, createDirectLine } from "botframework-webchat";
import "./ui/ChatBot.css";

class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hideUploadButton: !props.upload,
            widgetReady: false,
            context: ""
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            if (
                this.props.secret.status == "available" &&
                this.props.context.status == "available" &&
                this.props.username.status == "available" &&
                this.props.userid.status == "available" &&
                this.props.useremail.status == "available"
            ) {
                var pageContext = this.translateContext(mx.ui.getContentForm().path);
                var store = this.dispatchStoreContext(pageContext, this.props.useremail.value);
                const directLine = createDirectLine({ secret: this.props.secret.value });
                this.setState({
                    directLine: directLine,
                    widgetReady: true,
                    store: store,
                    context: mx.ui.getContentForm().path
                });
                clearInterval(this.interval);
            }
        }, 50);

        this.contextListener = setInterval(() => {
            //console.log("Checking context...");
            if (mx.ui.getContentForm().path != this.state.context) {
                console.log("New context! " + mx.ui.getContentForm().path);
                //check if page context has changed
                var pageContext = this.translateContext(mx.ui.getContentForm().path); //translate page context to bot context
                var store_new = this.dispatchStoreContext(pageContext, this.props.useremail.value);
                console.log(store_new);
                this.setState({ context: mx.ui.getContentForm().path, store: store_new });
            }
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.contextListener);
    }

    dispatchStoreContext(context, useremail) {
        return createStore({}, ({ dispatch }) => next => action => {
            if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
                dispatch({
                    type: "WEB_CHAT/SEND_EVENT",
                    payload: {
                        name: "context/set",
                        value: {
                            app: "web",
                            context: context
                        }
                    }
                });
                dispatch({
                    type: "WEB_CHAT/SEND_EVENT",
                    payload: {
                        name: "user/set",
                        value: {
                            email: useremail
                        }
                    }
                });
            }
            return next(action);
        });
    }

    translateContext(page) {
        switch (page) {
            case "MyFirstModule/Home_Web.page.xml":
                return "ZZZZZZZZZZZZZZ";
            default:
                return "general questions";
        }
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
