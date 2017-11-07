import * as ReactDOM from "react-dom";
import * as React from "react";
import { FirebaseWrapper, UserProfile } from "./firebase";
import { Tabs, Tab, FormGroup, ControlLabel, 
  FormControl, HelpBlock, Button } from "react-bootstrap";

export interface LoginProps {
  fb: FirebaseWrapper;
  onLogin: (userProfile: UserProfile) => void;
}

export interface LoginState {
  email: string;
  password: string;
  checkPassword: string;
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor() {
    super();
  }

  state: any = {
    email: "",
    password: "",
    checkPassword: "",
  };

  style: any = {
    view: {
      margin: 5,
      width: 400,
      height: 500,
    },
  };

  onChangeemail(e) {
    this.setState({ email: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  onChangeCheckPassword(e) {
    this.setState({ checkPassword: e.target.value });
  }

  onPasswordKeyDown(e) {
    if (e.keyCode === 13) {
      this.onLogin();
    }
  }

  onCheckPasswordKeyDown(e) {
    if (e.keyCode === 13) {
      this.onSignup();
    }
  }

  onLogin() {
    this.props.fb.signIn(this.state.email, this.state.password)
      .then((userInfo) => {
        const user: UserProfile = {
          provider: userInfo.providerId,
          id: userInfo.uid,
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
        };
        this.props.onLogin(user);
      }).catch((error) => {
        console.error(error);
      });
  }

  onSignup() {
    if (this.state.password === this.state.checkPassword) {
      this.props.fb.register(this.state.email, this.state.password)
        .then((userInfo) => {
          console.log("success signup ", userInfo);
          const user: UserProfile = {
            provider: userInfo.providerId,
            id: userInfo.uid,
            displayName: userInfo.displayName,
            photoURL: userInfo.photoURL,
          };
          this.props.onLogin(user);
        }).catch((error) => {
          console.error(error);
        });

    }
  }

  render() {
    const checked = this.state.password === this.state.checkPassword;
    const warning = checked ? "success" : "error";

    const loginView = (
      <div style={this.style.view}>
        <FieldGroup
          id="formControlsText"
          type="email"
          label="email"
          placeholder="Enter User Name"
          value={this.state.email}
          onChange={this.onChangeemail.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="password"
          label="Password"
          placeholder="Enter Password"
          value={this.state.password}
          onKeyDown={this.onPasswordKeyDown.bind(this)}
          onChange={this.onChangePassword.bind(this)}
        />
        <Button onClick={this.onLogin.bind(this)}>Login</Button>
      </div>
    );

    const signupView = (
      <div style={this.style.view}>
        <FieldGroup
          id="formControlsText"
          type="email"
          label="email"
          placeholder="Enter User Name"
          value={this.state.email}
          onChange={this.onChangeemail.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="password"
          label="Password"
          placeholder="Enter Password"
          validationState={warning}
          value={this.state.password}
          onChange={this.onChangePassword.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="password"
          label="Password"
          placeholder="Enter Password"
          validationState={warning}
          value={this.state.checkPassword}
          onKeyDown={this.onCheckPasswordKeyDown.bind(this)}
          onChange={this.onChangeCheckPassword.bind(this)}
        />
        <Button onClick={this.onSignup.bind(this)}>Register</Button>
      </div>
    );

    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="Sign in">{loginView}</Tab>
          <Tab eventKey={2} title="Sign up">{signupView}</Tab>
        </Tabs>
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
