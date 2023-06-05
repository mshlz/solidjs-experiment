import { Component, JSX, Show, createEffect, createSignal, on, onCleanup, onMount } from "solid-js"
import { CircularProgress } from "@suid/material"
import {
  CompositeConstraintSchema,
  ConstraintSchema,
  joinNodePath,
  Node,
  NodeComponentEntry,
  NodeStaticKey,
  resolveNodePath,
  RootNode,
  rootNodeTrans
} from "./Node"

export interface RendererProps {
  root: StageNode
  node: Node
  children?: any
}

export type Renderer = (props: RendererProps) => JSX.Element

export type ComponentEntry = NodeComponentEntry & {
  key: string
  configure?: (node: Node) => void
  renderer: Renderer
}

const componentRegistry: { [key: string]: ComponentEntry } = {}

export const registerComponent = (entry: ComponentEntry) => (componentRegistry[entry.key] = entry)

export const ComponentRenderer: Component<RendererProps> = (props) => {
  const root = props.node.root as StageNode
  const component = root.registry[props.node.component]

  if (!component) {
    throw new Error(`Component not registered: ${props.node.component}`)
  } else {
    if (!props.node.configured) {
      component.configure && component.configure(props.node)
      props.node.configured = true
    }

    props.node.path = resolveNodePath(props.node)
    const result = component.renderer(props)

    if (!props.node.assembled) {
      props.node.assembled = true
    }

    return result
  }
}

export const componentElement = (root: StageNode, parent: Node, node: Node, key: string | number) => {
  if (!node.bootstraped) {
    node.bootstraped = true

    if (node.key) {
      if (!(node.key instanceof NodeStaticKey)) {
        node.key = new NodeStaticKey(node.key)
      }
    } else {
      node.key = key
    }
  } else if (!(node.key instanceof NodeStaticKey)) {
    node.key = key
  }

  node.root = root
  node.parent = parent
  return <ComponentRenderer node={node} root={root} />
}

export const renderBranchesElements = (root: StageNode, node: Node) =>
  $opt(
    node?.branches,
    (it) =>
      it instanceof Array
        ? it.map((it, index) => componentElement(root, node, it, index))
        : Object.entries(it).map(([key, it]) => componentElement(root, node, it, key)),
    () => [] as JSX.Element[]
  )

export interface StageState {
  isFetching: boolean
  isSending: boolean
  pendencies: Record<string, any>
  errors: {
    general: any
    validation: any
  }
}

export interface StageNodeAssembly extends Partial<Node> {
  registry?: ComponentEntry[]
}

export interface AssembledStageNode<State extends StageState> extends Omit<StageNodeAssembly, "registry">, RootNode {
  registry: Record<string, ComponentEntry>
  component: string
  state: State
}

export interface StageNode extends AssembledStageNode<StageState> {
  actions: {
    update: () => void
    submit: () => Promise<void>
  }
}

export type InitFn<InitState = Record<string, any>> = (state: StageState) => InitState
export type FetchFn<InitState = Record<string, any>, Packet = any> = (state: StageState & InitState) => Packet | Promise<Packet>
export type AssembleFn<InitState = Record<string, any>, Packet = any> = (
  state: StageState & InitState,
  packet?: Packet
) =>
  | StageNodeAssembly
  | [
      StageNodeAssembly,
      (root: StageNode & AssembledStageNode<StageState & InitState>) => StageNode & AssembledStageNode<StageState & InitState>
    ]
export type TransFn<Data = any> = (root: RootNode, includeTransient: boolean) => Data
export type SendFn<InitState = Record<string, any>, Data = any> = (
  root: StageNode & AssembledStageNode<StageState & InitState>,
  data: Data
) => Promise<void>
export type RawRenderFn<InitState = Record<string, any>> = (root: StageNode & AssembledStageNode<StageState & InitState>) => JSX.Element

export interface StageBuilderParams<InitState, Packet, Data = any> {
  init?: InitFn<InitState>
  fetch?: FetchFn<InitState, Packet>
  assemble?: AssembleFn<InitState, Packet>
  trans?: TransFn<Data>
  send?: SendFn<InitState, Data>
  render?: {
    err?: RawRenderFn<InitState>
    pre?: RawRenderFn<InitState>
    mid?: RawRenderFn<InitState>
    pos?: RawRenderFn<InitState>
  }
  options?: {
    key?: string
  }
}

export const StageRenderer = (props: { root: StageNode; children?: any }) => {
  return <div ref={(it) => (props.root.ref = it)}>{props.children}</div>
}

export const transformValidationErrors = (errors: any[]): any => {
  const result = {}
  errors.forEach((it) => (result[joinNodePath(it.path)] = it))
  return result
}

const validateData = (schema: ConstraintSchema, data: any) =>
  $let(schema.validate(data, { allowUnknown: true, abortEarly: false }), (it) =>
    it.error ? transformValidationErrors(it.error.details) : {}
  )

export const stageBuilder = <InitState, Packet, Data = any>(params: StageBuilderParams<InitState, Packet, Data>): Component<any> => {
  const { init, fetch, assemble, trans, send, render, options } = params

  return () => {
    const scope = {
      root: null as StageNode
    }

    const [main, setMain] = createSignal({
      root: {
        component: "stage",
        key: options?.key || "model",
        state: {
          isFetching: false,
          isSending: false,
          pendencies: {},
          errors: {
            general: {},
            validation: {}
          }
        },
        actions: {
          update: () => {
            setMain({ root: scope.root })
          },
          submit: async () => {
            const root = scope.root as StageNode & AssembledStageNode<StageState & InitState>

            if (root.state.isSending) {
              console.log("submit isSending:", true)
            } else {
              root.state.isSending = true
              const data = trans ? trans(root, false) : rootNodeTrans(root, false)

              if (!data.lang) {
                data.lang = langEngine.language
              }

              console.log("submit data:", data)
              const constraintSchema = root?.constraint?.schema
              console.log(`Constraint schema:`, constraintSchema)

              const [validationErrors, validationErrorsType] = constraintSchema
                ? $act(() => {
                    if (constraintSchema instanceof CompositeConstraintSchema) {
                      const transientData = trans ? trans(root, true) : rootNodeTrans(root, true)
                      console.log("submit transientData:", transientData)
                      const transientValidationErrors = validateData(constraintSchema.transient, transientData)

                      if (Object.keys(transientValidationErrors).length > 0) {
                        return [transientValidationErrors, "transient"]
                      } else {
                        return [validateData(constraintSchema.final, data), "final"]
                      }
                    } else {
                      return [validateData(constraintSchema, data), "final"]
                    }
                  })
                : [{}, "empty"]

              root.state.errors.general = {}
              root.state.errors.validation = validationErrors

              if (Object.keys(validationErrors).length > 0) {
                console.log(`submit validation errors [${validationErrorsType}]:`, validationErrors)
                root.state.isSending = false
              } else {
                console.log(`submit validation passed [${validationErrorsType}]:`, validationErrors)
                setMain({ root })

                try {
                  await send(root, data)
                } catch (e) {
                  // if (e instanceof GqlException) {
                  //   const error = e.graphQLErrors[0]
                  //   const extensions = error.extensions as any
                  //   console.error("submit GqlException:", error)

                  //   if (extensions.errorType == "ValidationException") {
                  //     root.state.errors.validation = transformValidationErrors(extensions.errorInfo)
                  //   } else {
                  //     root.state.errors.general = {
                  //       message: extensions?.errorInfo?.message ?? error.message
                  //     }
                  //   }
                  // } else {
                  console.error(`submit GeneralException:`, e)
                  root.state.errors.general = { message: e.message }
                  // }
                } finally {
                  root.state.isSending = false
                }
              }
            }

            setMain({ root })
          }
        }
      } as StageNode
    })

    scope.root = main().root
    scope.root.state = {
      ...scope.root.state,
      ...(init ? init(scope.root.state) : ({} as InitState))
    }

    createEffect(
      on(main, () => {
        onMount(() => {
          scope.root.mounted = true
        })

        onCleanup(() => {
          scope.root.mounted = false
        })

        if (!scope.root.bootstraped) {
          scope.root.bootstraped = true

          const runAssemble = (runSetMain: boolean, packet?: Packet) => {
            scope.root.state.isFetching = false

            if (assemble) {
              try {
                scope.root = assemble
                  ? ($act(() => {
                      const assembled = assemble(scope.root.state as StageState & InitState, packet)

                      const processAssembled = (it: any): typeof assembled => {
                        if (!it.registry) {
                          it.registry = { ...componentRegistry }
                        } else if (it.registry instanceof Array) {
                          const result = { ...componentRegistry }

                          it.registry.forEach((entry) => {
                            result[entry.key] = entry
                          })

                          it.registry = result
                        } else {
                          it.registry = { ...componentRegistry, ...it.registry }
                        }

                        return it
                      }

                      return assembled instanceof Array
                        ? assembled[1]({
                            ...scope.root,
                            ...processAssembled(assembled[0])
                          } as StageNode & AssembledStageNode<StageState & InitState>)
                        : {
                            ...scope.root,
                            ...processAssembled(assembled)
                          }
                    }) as StageNode)
                  : $act(() => {
                      scope.root.registry = { ...componentRegistry }
                      return scope.root
                    })

                main().root = scope.root
                scope.root.assembled = true

                if (runSetMain) {
                  setMain({ root: scope.root })
                }
              } catch (e) {
                console.error("assemble error:", e)
                runSetMain && setMain({ root: scope.root })
              }
            } else {
              scope.root.registry = { ...componentRegistry }
              runSetMain && setMain({ root: scope.root })
            }

            scope.root.assembled = true
            scope.root.configured = true
            scope.root.path = resolveNodePath(scope.root)
          }

          if (fetch) {
            scope.root.state.isFetching = true
            const packet = fetch(scope.root.state as StageState & InitState)

            if (packet instanceof Promise) {
              packet
                .then((packet) => {
                  runAssemble(true, packet)
                })
                .catch((e) => {
                  //TODO: error treatment
                  console.error("fetch promise error:", e)
                  scope.root.state.isFetching = false
                  setMain({ root: scope.root })
                })
            } else {
              runAssemble(true, packet)
            }
          } else {
            runAssemble(false)
          }
        }
      })
    )

    const getRoot = () => main().root as StageNode & AssembledStageNode<StageState & InitState>
    console.log("stageNode log:", getRoot())

    const isLoading = () => (assemble && !getRoot().assembled) || getRoot().state.isFetching

    return (
      <Show when={!isLoading()} fallback={<CircularProgress />}>
        {$let(getRoot(), (root) => (
          <>
            {render?.err ? render.err(root) : null}

            <StageRenderer root={root}>
              {render?.pre && render.pre(root)}
              {render?.mid ? render.mid(root) : renderBranchesElements(root, root)}
              {render?.pos && render.pos(root)}
            </StageRenderer>
          </>
        ))}
      </Show>
    )
  }
}
