import * as ReactDOM from "react-dom";
import * as React from "react";
import { Button } from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import * as _ from "underscore";
import {
  FirebaseWrapper, UserProfile, ListInfo, AllTextMap,
  TextInfo, PATH_MAP, DEFAULT_LIST, EditTextInfo,
} from "./firebase";
import { Login } from "./login";
import { Content } from "./content";
import { registerLogic } from "./logic";
const config = require("../settings.json");

export interface MainState {
  fb: FirebaseWrapper;
  emitter: EventEmitter;
  userProfile: UserProfile;
  tabContent: TabContent;
  lists: ListInfo[];
  textList: AllTextMap;
  selectedListId: string;
  selectedTextList: TextInfo[];
  editItem: EditTextInfo;
  logined: boolean;
}

export enum TabContent {
  TEXTS = 1,
  ADD,
  ADDLIST,
  USER,
}

export class Main extends React.Component<any, MainState> {
  constructor() {
    super();
  }

  state: MainState = {
    fb: new FirebaseWrapper(config),
    emitter: new EventEmitter(),
    userProfile: null,
    tabContent: TabContent.TEXTS,
    lists: [],
    textList: {},
    selectedListId: DEFAULT_LIST,
    selectedTextList: [],
    editItem: null,
    logined: false,
  };

  style: any = {
    main: {
      display: "flex",
      flexDirection: "column",
      margin: 20,
    },
  };

  componentDidMount() {
    const userProfileStr = localStorage.getItem("biscuit-userProfile");
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      this.setState({ userProfile, logined: true });
      setTimeout(() => {
        this.updateListInfo().then(() => {
          return this.updateTextList();
        }).then(() => {
          // console.log("Initialize Success");
        });
      }, 0);

    } else {
      console.warn("You don't get a userProfile in localstorage");
    }

    // register events of Eventemitter
    registerLogic(
      this.state,
      this.setState.bind(this),
      this.updateTextList.bind(this),
      this.updateListInfo.bind(this),
    );
    
  }

  checkExist(items: any[], id: string): boolean {
    let result = false;
    _.each(items, (item) => {
      if (item.__id === id) {
        result = true;
      }
    });
    return result;
  }

  updateListInfo(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.state.fb.getList(this.state.userProfile).then((result) => {
        if (this.checkExist(result, DEFAULT_LIST)) {
          this.setState({ lists: result });
        } else {
          this.state.fb.createList(this.state.userProfile, DEFAULT_LIST, {
            title: "Your Text List",
          }).then(() => {
            this.setState({
              lists: [{
                __id: DEFAULT_LIST,
                title: "Your Text List",
              }],
            });
          }).catch(console.error);
        }
        resolve();
      }).catch((error) => {
        console.error(error);
        reject();
      });
    });
  }

  updateTextList(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.state.fb.getTexts(this.state.userProfile).then((result) => {
        const selected = result[this.state.selectedListId] || [];
        this.setState({ textList: result, selectedTextList: selected });
        resolve();
      }).catch((error) => {
        console.error(error);
        reject();
      });
    });
  }

  onLogin(userProfile: UserProfile) {
    if (userProfile) {
      localStorage.setItem("biscuit-userProfile", JSON.stringify(userProfile));
      setTimeout(() => {
        this.updateListInfo().then(() => {
          return this.updateTextList();
        }).then(() => {
          // console.log("Initialize Success");
        });
      }, 0);
      this.setState({ userProfile, logined: true });
    }
  }

  onLogout() {
    localStorage.removeItem("biscuit-userProfile");
    this.setState({ logined: false });
  }

  render() {
    let contents = <div />;
    if (!this.state.logined) {
      contents = <Login fb={this.state.fb} onLogin={this.onLogin.bind(this)} />;
    } else {
      contents = <div><Content onLogout={this.onLogout.bind(this)} {...this.state} /></div>;
    }

    return (
      <div style={this.style.main}>{contents}</div>
    );
  }

}
