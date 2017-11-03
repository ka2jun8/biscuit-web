import {
  FirebaseWrapper, UserProfile, ListInfo, AllTextMap,
  TextInfo, PATH_MAP, EditTextInfo,
} from "./firebase";

import { MainState, TabContent } from "./main";

export function registerLogic(
  userProfile: UserProfile,
  mainState: MainState,
  setState: (state: any) => void,
  updateTextList: () => Promise<any>,
  updateListInfo: () => Promise<any>,
): void {
  mainState.emitter.on("add", (state: EditTextInfo) => {
    let id = state.__id;
    if (!id) {
      id = mainState.fb.generateId(userProfile, PATH_MAP.Text + "/" + state.listId);
    }
    mainState.fb.pushText(userProfile, state.listId, id, state).then(() => {
      setTimeout(updateTextList, 0);
      setState({ tabContent: TabContent.TEXTS });
    }).catch((error) => {
      console.error(error);
    });
  }).on("edit", (item: EditTextInfo) => {
    setState({ editItem: item, tabContent: TabContent.ADD });
  }).on("update", (state: EditTextInfo) => {
    mainState.fb.pushText(userProfile, state.listId, state.__id, state).then(() => {
      setTimeout(updateTextList, 0);
      setState({ tabContent: TabContent.TEXTS });
    }).catch((error) => {
      console.error(error);
    });
  }).on("delete", (listId: string, id: string) => {
    mainState.fb.deleteTextInfo(userProfile, listId, id).then(() => {
      setTimeout(updateTextList, 0);
      setState({ tabContent: TabContent.TEXTS });
    }).catch((error) => {
      console.error(error);
    });
  }).on("add-list", (state: any) => {
    const id = mainState.fb.generateId(userProfile, PATH_MAP.List);
    mainState.fb.createList(userProfile, id, state).then(() => {
      setTimeout(updateListInfo, 0);
      setState({ tabContent: TabContent.ADDLIST });
    }).catch((error) => {
      console.error(error);
    });
  }).on("delete-list", (id: string) => {
    mainState.fb.deleteList(userProfile, id).then(() => {
      setTimeout(updateListInfo, 0);
      setState({ tabContent: TabContent.TEXTS });
    }).catch((error) => {
      console.error(error);
    });
  }).on("select-list", (id: string) => {
    setState({
      selectedListId: id,
      selectedTextList: mainState.textList[id] || [],
    });
  }).on("change-list", (itemId: string, oldListId: string, newListId: string) => {
    mainState.fb.getTextWithId(userProfile, oldListId, itemId).then((item) => {
      return mainState.fb.pushText(userProfile, newListId, itemId, item);
    }).then(() => {
      return mainState.fb.deleteTextInfo(userProfile, oldListId, itemId);
    }).then(() => {
      setTimeout(updateTextList, 0);
      setState({ tabContent: TabContent.TEXTS });
    }).catch((error) => {
      // TODO roll back
      console.error(error);
    });
  }).on("tab", (id: number) => {
    setState({ tabContent: id });
  });
}
