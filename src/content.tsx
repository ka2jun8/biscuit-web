import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, Button } from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import { FirebaseWrapper, AllTextMap, ListInfo, TextInfo, EditTextInfo } from "./firebase";
import { TabContent } from "./main";
import { Add } from "./add";
import { AddList } from "./add-list";
import { Texts } from "./texts";

export interface ContentProps {
  fb: FirebaseWrapper;
  emitter: EventEmitter;
  tabContent: number;
  lists: ListInfo[];
  textList: AllTextMap;
  selectedListId: string;
  selectedTextList: TextInfo[];
  editItem: EditTextInfo;
  onLogout: () => void;
}

export class Content extends React.Component<ContentProps, any> {
  constructor() {
    super();
  }

  state: any = {
  };

  style: any = {
    view: {
      margin: 10,
    },
  };

  onLogout() {
    this.props.fb.signOut().then(() => {
      console.log("logout!");
      this.props.onLogout();
    }).catch((error) => {
      console.error(error);
    });
  }

  onTabChange(key) {
    this.props.emitter.emit("tab", key);
  }

  render() {
    const listView = (
      <div style={this.style.view}>
        <Texts {...this.props} />
      </div>
    );

    const addView = (
      <div style={this.style.view}>
        <Add 
          emitter={this.props.emitter} 
          lists={this.props.lists}
          existItem={this.props.editItem} 
        />
      </div>
    );

    const addListView = (
      <div style={this.style.view}>
        <AddList emitter={this.props.emitter} lists={this.props.lists} />
      </div>
    );

    const userView = (
      <div style={this.style.view}>
        <Button onClick={this.onLogout.bind(this)}>Logout!</Button>
      </div>
    );

    return (
      <div>
        <Tabs 
          defaultActiveKey={this.props.tabContent} 
          activeKey={this.props.tabContent} 
          id="uncontrolled-tab-example" 
          onSelect={this.onTabChange.bind(this)}
        >
          <Tab eventKey={TabContent.TEXTS} title="Texts">{listView}</Tab>
          <Tab eventKey={TabContent.ADD} title="Add">{addView}</Tab>
          <Tab eventKey={TabContent.ADDLIST} title="AddList">{addListView}</Tab>
          <Tab eventKey={TabContent.USER} title="User">{userView}</Tab>
        </Tabs>
      </div>
    );
  }

}
