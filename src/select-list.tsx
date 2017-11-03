import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel,
   FormControl, HelpBlock, Button, Radio } from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import { ListInfo } from "./firebase";

export interface SelectListProps {
  lists: ListInfo[];
  selectedId: string;
  nonTitle?: boolean;
  onSelect: (listId: string) => void;
}

export class SelectList extends React.Component<SelectListProps, any> {
  constructor() {
    super();
  }

  style: any = {
  };

  onSelect(e) {
    this.props.onSelect(e.target.value);
  }

  render() {
    const lists = this.props.lists.map((list, i) => {
      return <option key={i} value={list.__id}>{list.title}</option>;
    });
    const selectListView = this.props.nonTitle ? (
      <FormControl 
        value={this.props.selectedId} 
        onChange={this.onSelect.bind(this)} 
        componentClass="select"
      >
        {lists}
      </FormControl>
    ) :
      (
        <FormGroup controlId="formControlsSelect1">
          <ControlLabel>List Select</ControlLabel>
          <FormControl 
            value={this.props.selectedId} 
            onChange={this.onSelect.bind(this)} 
            componentClass="select"
          >
            {lists}
          </FormControl>
        </FormGroup>
      );

    return (
      <div style={this.style.view}>
        {selectListView}
      </div>
    );
  }

}
