import { AssembleFn } from "../../core/builder/StageBuilder"
import * as LoginMate from "./LoginMate"

const k = LoginMate.k

export const assemble: AssembleFn = (state, packet) => ({
  constraint: { schema: LoginMate.finalSchema },
  branches: {
    form: {
      component: "form",
      branches: {
        col1: {
          component: "space",
          props: {
            _: {
              size: "middle",
              direction: "vertical"
            }
          },
          branches: {
            alert: {
              component: "alert-error"
            },
            username: {
              component: "input-field-b",
              props: {
                _: {
                  label: k("username.label"),
                  autoComplete: "username"
                }
              }
            },
            password: {
              component: "password-field-b",
              props: {
                _: {
                  label: k("password.label"),
                  autoComplete: "current-password"
                }
              }
            },
            col2: {
              component: "col",
              props: {
                _: {
                  offset: 15,
                  span: 6,
                  justifyContent: "end"
                }
              },
              branches: {
                resetPasswordLink: {
                  component: "nav-link-field",
                  props: {
                    _: {
                      to: "/reset-password",
                      text: k("resetPasswordLink.text")
                    }
                  }
                }
              }
            },
            submit: {
              component: "submit-field",
              props: {
                _: {
                  text: k("submit.text")
                }
              }
            },
            col3: {
              component: "col",
              props: {
                _: {
                  offset: 5,
                  span: 6,
                  justifyContent: "center"
                }
              },
              branches: {
                signupLink: {
                  component: "nav-link-field",
                  props: {
                    _: {
                      to: "/register",
                      text: k("signupLink.text"),
                      fullWidth: true
                    }
                  }
                }
              }
            },
            submitErr: {
              component: "button",
              actions: {
                onClick: () => {
                  throw new Error("Catastrofe!!!")
                }
              },
              props: {
                _: {
                  text: "Trigger Error Boundary",
                  color: "error",
                  variant: "outlined"
                }
              }
            }
          }
        }
      }
    }
  }
})
