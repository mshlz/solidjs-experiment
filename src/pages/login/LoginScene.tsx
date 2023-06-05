import { useNavigate } from "@solidjs/router"
import { stageBuilder } from "../../core/builder/StageBuilder"
import * as LoginAssemble from "./LoginAssemble"
import * as LoginMate from "./LoginMate"
import { Component } from "solid-js"
import { PublicDecorator } from "../../layouts/public/PublicDecorator"

const k = LoginMate.k

const LoginForm = stageBuilder({
  init: (state: any) => {
    const navigate = useNavigate()

    return {
      ...state,
      onSendCompleted: () => {
        navigate("/home")
      }
    }
  },
  fetch: LoginMate.fetch,
  assemble: LoginAssemble.assemble,
  trans: LoginMate.trans,
  send: LoginMate.send
})
//
export const LoginScene: Component = () => {
  return (
    <PublicDecorator staticHeader paragraph={k("header.paragraph")} title={k("header.title")}>
      <LoginForm />
    </PublicDecorator>
  )
}

export default LoginScene
