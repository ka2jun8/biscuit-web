import * as ReactDOM from "react-dom";
import * as React from "react";
import { Media, Button, Image, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import { EventEmitter } from "eventemitter3";
import * as _ from "underscore";
import { ListInfo, AllTextMap, TextInfo, EditTextInfo } from "./firebase";
import { SelectList } from "./select-list";

export interface TextsProps {
  emitter: EventEmitter;
  lists: ListInfo[];
  selectedListId: string;
  selectedTextList: TextInfo[];
}

export enum EditMenu {
  Menu = 1,
  Text,
  List,
}

export interface TextsState {
  editMenu: EditMenu;
  editingItem: EditTextInfo;
}

// TODO ダブルクリックで簡易エディットモード、Edit CardでAddに飛ばすようにする
export class Texts extends React.Component<TextsProps, TextsState> {
  constructor() {
    super();
  }

  state: TextsState = {
    editMenu: EditMenu.Menu,
    editingItem: null,
  };

  onClickEditCard(item: TextInfo) {
    const editTextInfo: EditTextInfo = _.assign({}, { listId: this.props.selectedListId }, item);
    this.setState({
      editMenu: EditMenu.Text,
      editingItem: editTextInfo,
    });
  }

  onClickEditList() {
    this.setState({ editMenu: EditMenu.List });
  }

  onClickEditCancel() {
    this.setState({
      editMenu: EditMenu.Menu,
      editingItem: null,
    });
  }

  onChangeEditedSentence(e) {
    const editingItem = this.state.editingItem;
    editingItem.sentence = e.target.value;
    this.setState({ editingItem });
  }

  onChangeEditedMeaning(e) {
    const editingItem = this.state.editingItem;
    editingItem.meaning = e.target.value;
    this.setState({ editingItem });
  }

  onSubmitEditedItem() {
    this.props.emitter.emit("update", this.state.editingItem);
    alert("Submited!");
    this.setState({
      editMenu: EditMenu.Menu,
      editingItem: null,
    });
  }

  onClick(url: string) {
    window.open(url, "_blank");
  }

  onEdit(item: TextInfo) {
    const edtiItem: EditTextInfo = _.assign({}, { listId: this.props.selectedListId }, item);
    this.props.emitter.emit("edit", edtiItem);
  }

  onDelete(id: string) {
    this.props.emitter.emit("delete", this.props.selectedListId, id);
  }

  onSelectList(listId) {
    this.props.emitter.emit("select-list", listId);
  }

  onChangeList(itemId, oldListId, newListId) {
    this.props.emitter.emit("change-list", itemId, oldListId, newListId);
  }

  render() {
    const maruStyle = {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      flexFlow: "column",
      verticalAlign: "column",
      border: "1px solid pink",
      color: "pink",
      width: "20px",
      height: "20px",
      margin: 10,
    } as any;

    const mediaList = this.props.selectedTextList && this.props.selectedTextList.map((item, i) => {
      const editList = (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <SelectList
            lists={this.props.lists}
            selectedId={this.props.selectedListId}
            onSelect={this.onChangeList.bind(this, item.__id, this.props.selectedListId)}
            nonTitle={true}
          />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Button onClick={this.onEdit.bind(this, item)}>編集</Button>
            <Button onClick={this.onDelete.bind(this, item.__id)}>削除</Button>
          </div>
          <div>
            <div
              style={{ cursor: "pointer" }}
              onClick={this.onClickEditCancel.bind(this)}
            >
              Cancel
            </div>
          </div>
        </div>
      );

      let editMenuList = <div />;

      if (this.state.editMenu === EditMenu.Menu) {
        editMenuList = (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{ cursor: "pointer" }}
              onClick={this.onClickEditCard.bind(this, item)}
            >
              Edit card
            </div>
            <div
              style={{ cursor: "pointer" }}
              onClick={this.onClickEditList.bind(this)}
            >
              Edit list
            </div>
          </div>
        );
      } else if (this.state.editMenu === EditMenu.List) {
        editMenuList = editList;
      } else if (this.state.editMenu === EditMenu.Text) {
        // TODO edit text
        editMenuList = (
          <div>
            <div
              style={{ cursor: "pointer" }}
              onClick={this.onClickEditCancel.bind(this)}
            >
              Cancel
            </div>
          </div>
        );
      }

      const itemView = this.state.editingItem ?
        (
          <div>
            <div style={{ margin: 5 }}>
              <FormControl
                type="text"
                value={this.state.editingItem.sentence}
                placeholder="Enter Sentence"
                onChange={this.onChangeEditedSentence.bind(this)}
              />
            </div>
            <div style={{ margin: 5 }}>
              <FormControl
                type="text"
                value={this.state.editingItem.meaning}
                placeholder="Enter Meaning"
                onChange={this.onChangeEditedMeaning.bind(this)}
              />
            </div>
            <div style={{ margin: 5 }}>
              <Button onClick={this.onSubmitEditedItem.bind(this)}>Submit</Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ margin: 5 }}>
              <p style={{ fontSize: "20px" }}>{item.sentence}</p>
            </div>
            <div style={{ margin: 5 }}>
              <p>{item.meaning}</p>
            </div>
          </div>
        );

      return (
        <Media key={i} style={{ margin: 5, width: "100%", height: 120 }}>
          <Media.Body>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={maruStyle}>
                <div style={{ fontSize: "1em", lineHeight: "1.5em" }}>
                  {i}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ margin: 5, paddingBottom: 10 }}>
                  {itemView}
                </div>
                <div style={{ bottom: 10, textAlign: "right", width: "100%", height: "100%" }}>
                  <p>study more...</p>
                </div>
              </div>
            </div>
          </Media.Body>
          <Media.Right>
            <div style={{ width: 120, margin: 10 }}>
              {editMenuList}
            </div>
          </Media.Right>
        </Media>
      );
    });

    // TODO 画像どうしようかなーという気持ち
    // <div 
    //  style={{width: 100, cursor: "pointer", margin: 5}} 
    //  onClick={this.onClick.bind(this, item.url)}
    // >
    // <Image src={item.image} responsive />
    // </div>

    const cardList = mediaList.map((media, i) => {
      const cardStyle = {
        width: "80%",
        background: "#fff",
        borderRadius: "5px",
        boxShadow: "0 2px 5px #ccc",
      };
      return (
        <div style={cardStyle} key={i}> {media} </div>
      );
    });

    const textView = this.props.selectedTextList.length > 0 ? (
      <div>
        {cardList}
      </div>
    ) : (
        <div>何も表示するものがないよん</div>
      );

    return (
      <div>
        <div>
          <SelectList
            lists={this.props.lists}
            selectedId={this.props.selectedListId}
            onSelect={this.onSelectList.bind(this)}
          />
        </div>
        <div>
          {textView}
        </div>
      </div>
    );
  }

}
