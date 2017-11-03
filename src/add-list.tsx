import * as ReactDOM from "react-dom";
import * as React from "react";
import {
  ListGroup, ListGroupItem, Button, FormGroup,
  ControlLabel, FormControl, HelpBlock,
} from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import { ListInfo, TextInfo } from "./firebase";

export interface AddListProps {
  lists: ListInfo[];
  emitter: EventEmitter;
}

export interface AddListState {
  title: string;
}

export class AddList extends React.Component<AddListProps, AddListState> {
  constructor() {
    super();
  }

  state: AddListState = {
    title: "",
  };

  style: any = {
    view: {
      display: "flex",
      flexDirection: "row",
    },
    item: {
      margin: 10,
    },
  };

  onChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  onAdd() {
    this.props.emitter.emit("add-list", this.state);
    this.setState({
      title: "",
    });
  }

  onDelete(id: string) {
    this.props.emitter.emit("delete-list", id);
  }

  render() {
    const lists = this.props.lists.map((list, i) => {
      return (
      <ListGroupItem key={i} id={list.__id} value={list.title}>
        <div style={this.style.view}>
          <div style={this.style.item}>
            {list.title}
          </div>
          <div style={this.style.item}>
            <Button onClick={this.onDelete.bind(this, list.__id)}>Delete</Button>
          </div>
        </div>
      </ListGroupItem>
      );
    });
    lists.push(
      <ListGroupItem key={-1}>
        <div style={this.style.view}>
          <div style={this.style.item}>
            <FormControl
              id="formControlsText"
              type="text"
              label="title"
              placeholder="Enter New List Title"
              value={this.state.title}
              onChange={this.onChangeTitle.bind(this)}
            />
          </div>
          <div style={this.style.item}>
            <Button onClick={this.onAdd.bind(this)}>Add</Button>
          </div>
        </div>
      </ListGroupItem>,
    );
    const listView = (
      <ListGroup>
        {lists}
      </ListGroup>
    );

    return (
      <div>
        {listView}
      </div>
    );
  }

}

