import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel,
   FormControl, HelpBlock, Button, Radio } from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import { ListInfo, EditTextInfo, TextInfo, DEFAULT_LIST } from "./firebase";
import { SelectList } from "./select-list";

export interface AddProps {
  existItem: EditTextInfo;
  lists: ListInfo[];
  emitter: EventEmitter;
}

export class Add extends React.Component<AddProps, EditTextInfo> {
  constructor() {
    super();
  }

  state: EditTextInfo = {
    listId: DEFAULT_LIST,
    __id: "",
    sentence: "",
    meaning: "",
    comment: "",
    image: "",
    url: "",
    private: false,
  };

  style: any = {
    view: {
      margin: 5,
    },
  };

  componentDidUpdate() {
    const item = this.props.existItem;
    if (item && item.__id !== this.state.__id) {
      this.setState(item);
    }
  }

  onChangeList(listId) {
    this.setState({ listId });
  }

  onChangeSentence(e) {
    this.setState({ sentence: e.target.value });
  }

  onChangeMeaning(e) {
    this.setState({ meaning: e.target.value });
  }

  onChangeImage(e) {
    this.setState({ image: e.target.value });
  }

  onChangeComment(e) {
    this.setState({ comment: e.target.value });
  }

  onChangeUrl(e) {
    this.setState({ url: e.target.value });
  }

  onAdd() {
    this.props.emitter.emit("add", this.state);
    this.setState({
      sentence: "",
      meaning: "",
      comment: "",
      image: "",
      url: "",
      private: false,
    });
  }

  render() {

    const formView = (
      <div style={this.style.view}>
        <SelectList 
          lists={this.props.lists} 
          selectedId={this.state.listId} 
          onSelect={this.onChangeList.bind(this)} 
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Sentence"
          placeholder="Enter Sentence"
          value={this.state.sentence}
          onChange={this.onChangeSentence.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Meaning"
          placeholder="Enter Meaning"
          value={this.state.meaning}
          onChange={this.onChangeMeaning.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Comment"
          placeholder="Enter Comment"
          value={this.state.comment}
          onChange={this.onChangeComment.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Reference url"
          placeholder="Enter URL"
          value={this.state.url}
          onChange={this.onChangeUrl.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Image url"
          placeholder="Enter Image URL"
          value={this.state.image}
          onChange={this.onChangeImage.bind(this)}
        />
        <Button onClick={this.onAdd.bind(this)}>Add</Button>
      </div>
    );
    return (
      <div>
        {formView}
      </div>
    );
  }

}

function FieldGroup({ id, label, help, validationState, ...props }: any) {
  return (
    <FormGroup controlId={id} validationState={validationState}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}
