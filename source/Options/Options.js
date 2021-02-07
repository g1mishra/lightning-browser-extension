import * as React from "react";
import browser from "webextension-polyfill";
import { Collapse, Form, Input, Button, Typography } from "antd";

import { encryptData } from "./../lib/crypto";

import "./styles.scss";

const { Title } = Typography;
const { Panel } = Collapse;

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: {},
      currentAccount: "",
      settings: {},
    };
  }

  componentDidMount() {
    browser.storage.sync
      .get(["accounts", "currentAccount", "settings", "hostSettings"])
      .then((result) => {
        if (result.accounts) {
          console.log(result.accounts);
          //result.accounts = decryptData(result.accounts, "btc", "salt");
        }
        this.setState({
          accounts: result.accounts || {},
          currentAccount: result.currentAccount,
          settings: result.settings || {},
          hostSettings: result.hostSettings || {},
        });
      });
  }

  saveCurrentAccount(values) {
    const currentAccount = values.currentAccount;
    if (currentAccount) {
      browser.storage.sync.set({ currentAccount }).then(() => {
        this.setState({ currentAccount });
        alert("Saved");
      });
    }
  }

  saveLndAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {
        macaroon: values.macaroon,
        url: values.url,
      },
      connector: "lnd",
    };
    this.saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  }

  saveLndHubAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {
        login: values.login,
        password: values.password,
        url: values.url,
      },
      connector: "lndhub",
    };
    this.saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  }

  saveNativeAccount(values) {
    const accounts = this.state.accounts;
    accounts[values.name] = {
      config: {},
      connector: "native",
    };
    this.saveAccounts(accounts).then(() => {
      alert("Saved");
    });
  }

  resetAccounts() {
    return this.saveAccounts({}).then(() => {
      alert("Done");
    });
  }

  resetHostSettings() {
    return browser.storage.sync.set({ hostSettings: {} }).then(() => {
      this.setState({ hostSettings: {} });
      alert("Done");
    });
  }

  saveAccounts(accounts) {
    for (const [name, data] of Object.entries(accounts)) {
      if (data.config) {
        data.config = encryptData(data.config, "btc", "salt");
      }
      accounts[name] = data;
    }
    return browser.storage.sync.set({ accounts }).then(() => {
      this.setState({ accounts });
    });
  }

  onFinishFailedAddLndAccount(errorInfo) {
    console.log(errorInfo);
  }

  renderAddLndAccount() {
    return (
      <Form
        name="basic"
        initialValues={{
          name: "",
        }}
        onFinish={(values) => {
          this.saveLndAccount(values);
        }}
        onFinishFailed={(errorInfo) => {
          this.onFinishFailedAddLndAccount(errorInfo);
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Macaroon"
          name="macaroon"
          rules={[
            {
              required: true,
              message: "Please input the macroon key!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="URL"
          name="url"
          rules={[
            {
              type: "url",
              required: true,
              message: "Please enter the macroon url!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }

  renderAddLndHubAccount() {
    return <div>renderAddLndHubAccount</div>;
  }

  renderAddNativeAccount() {
    return <div>renderAddNativeAccount</div>;
  }

  render() {
    return (
      <div>
        <section>
          {JSON.stringify(this.state.accounts)}
          <button
            onClick={async (values) => {
              this.resetAccounts();
            }}
          >
            Reset
          </button>
        </section>
        <section>{JSON.stringify(this.state.settings)}</section>
        <section>
          {JSON.stringify(this.state.hostSettings)}
          <button
            onClick={async (values) => {
              this.resetHostSettings();
            }}
          >
            Reset
          </button>
        </section>
        {/* <section>
          <Formik
            initialValues={{ currentAccount: this.state.currentAccount }}
            onSubmit={async (values) => {
              this.saveCurrentAccount(values);
            }}
          >
            <Form>
              Current account: <Field name="currentAccount" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section> */}
        <Title level={2}>Add Account</Title>
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Add LND Account" key="1">
            {this.renderAddLndAccount()}
          </Panel>
          <Panel header="Add LndHub Account" key="2">
            {this.renderAddLndHubAccount()}
          </Panel>
          <Panel header="Add Native Connection" key="3">
            {this.renderAddNativeAccount()}
          </Panel>
        </Collapse>

        {/* <section>
          <h2>Add LND Account</h2>
          <Formik
            initialValues={{ name: "", macaroon: "", url: "" }}
            onSubmit={async (values) => {
              this.saveLndAccount(values);
            }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              URL: <Field name="url" type="text" />
              Macaroon Hex: <Field name="macaroon" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
        <section>
          <h2>Add LndHub Account</h2>
          <Formik
            initialValues={{ name: "", login: "", password: "", url: "" }}
            onSubmit={async (values) => {
              this.saveLndHubAccount(values);
            }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              URL: <Field name="url" type="text" />
              Login: <Field name="login" type="text" />
              Password: <Field name="password" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section>
        <section>
          <h2>Add Native Connection</h2>
          <Formik
            initialValues={{ name: "", login: "", password: "", url: "" }}
            onSubmit={async (values) => {
              this.saveNativeAccount(values);
            }}
          >
            <Form>
              Name: <Field name="name" type="text" />
              <button type="submit">Save</button>
            </Form>
          </Formik>
        </section> */}
      </div>
    );
  }
}

export default Options;