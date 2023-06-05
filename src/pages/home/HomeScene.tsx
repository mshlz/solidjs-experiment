import { A } from "@solidjs/router"
import { Component } from "solid-js"

export const HomeScene: Component = () => {
  return (
    <>
      <h1>Home sweet home</h1>
      <A href="/login">Back to login</A>
    </>
  )
}

export default HomeScene
