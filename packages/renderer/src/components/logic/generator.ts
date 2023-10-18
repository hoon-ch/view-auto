import { view } from "#preload";

type Login = {
  id: string;
  password: string;
};

type Elements = {
  [key: string]: {
    selector?: string;
  };
};

const varLogin: Elements = {
  loginButton: {
    selector: ".pull-right.main_new_btn.mainhigh_btn.login_btn_pop",
  },
  idInput: {
    selector: "input#MainLogin_Id",
  },
  passwordInput: {
    selector: "input#MainLogin_Pw",
  },
  submitButton: {
    selector: ".btn_login",
  },
  loginSuccess: {
    selector: ".welcome_wrap.pull-right",
  },
  loginFail: {
    selector: ".login_wrap.login_wrap2.pull-left",
  },
  loginStatus: {},
};

const generateJsQuery = (element: string, selector: string) => `
  let ${element} = document.querySelector("${selector}");
`;

const injectVariables = (elements: Elements): void => {
  const queries = Object.entries(elements)
    // eslint-disable-next-line no-unused-vars
    .filter(([_, element]) => element.selector)
    .map(([name, element]) => generateJsQuery(name, element.selector!))
    .join("");

  view.injectJS("variable", queries);
};

function loginToWebsite(login: Login) {
  const loginScript = `
    ${generateJsQuery("loginButton", varLogin.loginButton.selector!)}
    loginButton.click();

    setTimeout(() => {
      ${generateJsQuery("idInput", varLogin.idInput.selector!)}
      ${generateJsQuery("passwordInput", varLogin.passwordInput.selector!)}
      ${generateJsQuery("submitButton", varLogin.submitButton.selector!)}

      idInput.value = "${login.id}";
      passwordInput.value = "${login.password}";
      submitButton.click();
    }, 500);
  `;

  view.injectJS("login-to-website", loginScript);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  // return new Promise<boolean>(resolve => {
  //   setTimeout(() => {
  //     const resultScript = `
  //       ${generateJsQuery("loginSuccess", varLogin.loginSuccess.selector!)}
  //       ${generateJsQuery("loginFail", varLogin.loginFail.selector!)}

  //       if (loginSuccess) {
  //         window.ipcRenderer.send("set-login-result", true);
  //       } else if (loginFail) {
  //         window.ipcRenderer.send("set-login-result", false);
  //       }
  //     `;

  //     executeJS(resultScript);

  //     const result = window.view.checkLogin();
  //     if (result) {
  //       console.log("Login Successful!");
  //       resolve(true);
  //     } else {
  //       console.log("Login Failed!");
  //       resolve(false);
  //     }
  //   }, 3000);
  // });
}

export { injectVariables, loginToWebsite };
