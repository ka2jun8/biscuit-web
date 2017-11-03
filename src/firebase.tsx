import * as firebase from "firebase";
import * as _ from "underscore";

export interface UserProfile {
  provider: string;
  id: string;
  displayName: string;
  photoURL: string;
}

export const PATH_MAP = {
  Text: "text",
  List: "list",
};

export const DEFAULT_LIST = "DEFAULT_LIST";

export interface ListInfo {
  __id?: string;
  title: string;
  updateDate?: number;
  createDate?: number;
}

export interface ResultListInfoMap {
  [id: string]: ListInfo;
}

export interface TextInfo {
  __id?: string;
  sentence: string;
  meaning: string;
  private?: boolean;
  comment?: string;
  image?: string;
  url?: string;
  updateDate?: number;
  createDate?: number;
}

export interface EditTextInfo extends TextInfo {
  listId: string;
}

export interface ResultAllTextMap {
  [listId: string]: ResultTextInfoMap;
}

export interface ResultTextInfoMap {
  [id: string]: TextInfo;
}

export interface AllTextMap {
  [listId: string]: TextInfo[];
}

export class FirebaseWrapper {
  fb: firebase.app.App;
  tp: firebase.auth.TwitterAuthProvider;
  isLogined: boolean;

  constructor(env) {
    const fconf = {
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      databaseURL: env.databaseURL,
      storageBucket: env.storageBucket,
      messagingSenderId: env.messagingSenderId,
    };
    this.fb = firebase.initializeApp(fconf);
    this.isLogined = false;
  }

  signIn(authEmail, authPass): Promise<firebase.UserInfo> {
    return new Promise((resolve, reject) => {
      this.fb.auth().signInWithEmailAndPassword(authEmail, authPass)
        .then(() => {
          const cUser: firebase.UserInfo = this.fb.auth().currentUser;
          this.isLogined = true;
          resolve(cUser);
        }).catch((error) => {
          reject(error);
        });
    });
  }

  signInWithTwitter(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tp = new firebase.auth.TwitterAuthProvider();
      this.tp.setCustomParameters({ lang: "ja" });
      this.fb.auth().signInWithPopup(this.tp)
        .then(() => {
          this.isLogined = true;
          resolve();
        }).catch(() => {
          reject();
        });
    });
  }

  register(email, password): Promise<firebase.UserInfo> {
    return new Promise((resolve, reject) => {
      this.fb.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
          const cUser: firebase.UserInfo = this.fb.auth().currentUser;
          this.isLogined = true;
          resolve(cUser);
        }).catch((error) => {
          reject(error);
        });
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fb.auth().signOut();
      resolve();
    });
  }

  // TODO 重複確認 // 型
  pushText(
    profile: UserProfile, 
    targetListId: string, 
    id: string, 
    textInfo: TextInfo,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let listId = targetListId;
      if (!listId) {
        listId = DEFAULT_LIST;
      }
      const path: string = "users/" + profile.id + "/" + PATH_MAP.Text + "/" + listId + "/";
      if (textInfo) {
        textInfo.__id = id;
        textInfo.createDate = +new Date();
        textInfo.updateDate = +new Date();
      } else {
        // Hard Delete
      }
      this.fb.database().ref(path + id).set(textInfo).then(resolve, reject);
    });
  }

  // TODO 二分木あたりで管理して高速化
  getTexts(profile: UserProfile): Promise<AllTextMap> {
    return new Promise((resolve, reject) => {
      const userref: firebase.database.Reference
        = this.fb.database().ref("users/" + profile.id + "/" + PATH_MAP.Text);
      userref.once("value", (snapshot) => { // TODO .onにしてsubscribeする？
        const results: AllTextMap = {};
        const values: ResultAllTextMap = snapshot.val();
        if (values) {
          Object.keys(values).forEach((listId) => {
            const textLists: TextInfo[] = values[listId] ?
              Object.keys(values[listId]).map((textId) => {
                return _.assign({}, values[listId][textId], { __id: textId });
              }) : [];
            results[listId] = textLists;
          });
        }
        resolve(results);
      });
    });
  }

  getTextWithListId(profile: UserProfile, targetListId: string): Promise<TextInfo[]> {
    return new Promise((resolve, reject) => {
      let listId = targetListId;
      if (!listId) {
        listId = DEFAULT_LIST;
      }
      const userref: firebase.database.Reference
       = this.fb.database().ref("users/" + profile.id + "/" + PATH_MAP.Text + "/" + listId);
      userref.once("value", (snapshot) => { // TODO .onにしてsubscribeする？
        const values: ResultTextInfoMap = snapshot.val();
        const lists = values ? Object.keys(values).map((id) => {
          return _.assign({}, values[id], { __id: id });
        }) : [];
        resolve(lists);
      });
    });
  }

  getTextWithId(profile: UserProfile, targetListId: string, id: string): Promise<TextInfo> {
    return new Promise((resolve, reject) => {
      let listId = targetListId;
      if (!listId) {
        listId = DEFAULT_LIST;
      }
      const path = "users/" + profile.id + "/" + PATH_MAP.Text + "/" + listId + "/" + id;
      const userref: firebase.database.Reference = this.fb.database().ref(path);
      userref.once("value", (snapshot) => { // TODO .onにしてsubscribeする？
        const value: ResultTextInfoMap = snapshot.val();
        const v: TextInfo = _.assign({}, value, { __id: id });
        resolve(v);
      });
    });
  }


  /**
   * ハードデリート
   * @param profile 
   * @param id 
   */
  deleteTextInfo(profile: UserProfile, targetListId: string, id: string) {
    let listId = targetListId;
    if (!listId) {
      listId = DEFAULT_LIST;
    }
    return this.pushText(profile, listId, id, null);
  }

  createList(profile: UserProfile, id: string, listInfo: ListInfo): Promise<any> { // TODO型 id返す
    return new Promise((resolve, reject) => {
      const path: string = "users/" + profile.id + "/" + PATH_MAP.List + "/";
      if (listInfo) {
        listInfo.createDate = +new Date();
        listInfo.updateDate = +new Date();
      } else {
        // Hard Delete
      }
      this.fb.database().ref(path + id).set(listInfo).then(resolve, reject);
    });
  }

  getList(profile: UserProfile): Promise<ListInfo[]> {
    return new Promise((resolve, reject) => {
      const userref: firebase.database.Reference
       = this.fb.database().ref("users/" + profile.id + "/" + PATH_MAP.List);
      userref.once("value", (snapshot) => { // TODO .onにしてsubscribeする？
        const values: ResultListInfoMap = snapshot.val();
        const lists = values ? Object.keys(values).map((id) => {
          return _.assign({}, values[id], { __id: id });
        }) : [];
        resolve(lists);
      });
    });
  }

  deleteList(profile: UserProfile, id: string) {
    return this.createList(profile, id, null);
  }

  // TODO IDをハッシュマップ管理したら重複管理できそう
  generateId(profile: UserProfile, targetPath: string): string {
    const path: string = "users/" + profile.id + "/" + targetPath + "/";
    return this.fb.database().ref().child(path).push().key;
  }

}

