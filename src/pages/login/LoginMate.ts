import Joi from "joi"
import { rootNodeTrans } from "../../core/builder/Node"
import type { FetchFn, SendFn, TransFn } from "../../core/builder/StageBuilder"

export const k = (v) => v //knsBuilder("login")

export const finalSchema = Joi.object({ model: { username: Joi.string().required(), password: Joi.string().required() } }) // getSchema(LoginArgs)

// const loginMutation = gql`
//   mutation Login($model: LoginInput!, $lang: String) {
//     login(model: $model, lang: $lang) {
//       accessToken
//       tokenType
//       expiresIn
//       refreshToken
//       challenge {
//         name
//         session
//         codeDeliveryMedium
//         codeDeliveryDestination
//       }
//     }
//   }
// `

export const trans: TransFn = (root, includeTransient) /*: LoginArgs*/ =>
  $also(rootNodeTrans(root, includeTransient), (it: any) => {
    it.model = {
      ...it.model,
      provider: "PROVISIONED",
      target: {
        solution: "USER_BASE",
        area: "PROFILE",
        tenant: "0"
      }
    }
  })

export const fetch: FetchFn = /* async */ (state) => ({
  template: {},
  data: {}
})

export const send: SendFn = async (node, data) => {
  const {
    state: { onSendCompleted }
  } = node

  await delay(2000)

  if (data.model.password !== "123456") {
    throw new Error("Incorrect password. (try 123456)")
  } else {
    onSendCompleted()
  }
}
