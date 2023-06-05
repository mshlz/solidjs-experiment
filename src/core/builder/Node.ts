import "../utils"
import Joi from "joi"

export class NodeStaticKey {
  constructor(public value: string | number) {}
  toString = () => this.value.toString()
}

export interface NodeTemplate {
  component: string
  constraint?: {
    trigger?: string
    schema: any
  }
  transient?: boolean
  inset?: string[]
  props?: Record<string, Record<string, any> | string | number | boolean>
  visuals?: Record<string, Record<string, string>>
  behaviors?: Record<string, Record<string, any>>
  value?: any
  key?: string | number
  branches?: NodeTemplate[] | Record<string | number, NodeTemplate>
}

export type ConstraintSchema = Joi.Schema<any>

export class CompositeConstraintSchema {
  constructor(public transient: ConstraintSchema, public final: ConstraintSchema) {}
}

export type NodeComponentEntry = {
  key: string
  configure?: (node: Node) => void
}

export type NodePath = (string | number)[]

export interface Node extends Omit<NodeTemplate, "key" | "branches"> {
  constraint?: {
    trigger?: string
    schema: CompositeConstraintSchema | ConstraintSchema
  }
  key?: string | number | NodeStaticKey
  branches?: Node[] | Record<string | number, Node>
  bootstraped?: boolean
  state?: any
  configured?: boolean
  assembled?: boolean
  mounted?: boolean
  path?: NodePath
  ref?: any
  root?: RootNode
  parent?: Node
  actions?: Record<string, (...args: any[]) => Promise<any> | any>
}

export interface RootNode extends Node {
  registry: Record<string, NodeComponentEntry>
}

export const resolveNodePath = (node: Node) => {
  const { inset, parent, key } = node
  //TODO: rich inset expressions

  if (inset && (inset.length == 0 || inset[0] === "...")) {
    return parent?.path ? [...parent.path] : []
  } else if (parent?.path) {
    return [...parent.path, key instanceof NodeStaticKey ? key.value : key]
  } else {
    return [key instanceof NodeStaticKey ? key.value : key]
  }
}

export const fillDataTrans = (data: any, node: Node) => {
  const inset = node.inset

  if (!inset || inset.length > 0) {
    const lastIndex = node.path.length - 1
    let entries = data

    node.path.forEach((it, index) => {
      if (index == lastIndex) {
        entries[it] = inset && inset[0] === "..." ? _.merge(entries[it] || {}, node.value) : node.value
      } else {
        let entry = entries[it]

        if (entry === undefined) {
          if (typeof it == "number") {
            entry = []
          } else {
            entry = {}
          }

          entries[it] = entry
        }

        entries = entry
      }
    })
  }
}

export const traverseNodeTrans = (data: any, node: Node, transientParenting: boolean, includeTransient: boolean) => {
  node.path = resolveNodePath(node)
  const transient = transientParenting || node.transient

  if (includeTransient || !transient) {
    fillDataTrans(data, node)
  }

  const branches = node.branches

  if (branches) {
    branches instanceof Array
      ? branches.forEach((it, index) => traverseNodeTrans(data, it, transient, includeTransient))
      : Object.entries(branches).forEach(([key, it], index) => traverseNodeTrans(data, it, transient, includeTransient))
  }
}

export const rootNodeTrans = (root: RootNode, includeTransient: boolean): any => {
  const data = {}
  traverseNodeTrans(data, root, !!root.transient, includeTransient)
  return data
}

export const findNodeByPathKey = (branches: Node[] | Record<string | number, Node>, pathKey: string) =>
  branches instanceof Array
    ? branches.find((it, index) => getNodeByPathKey(it, pathKey))
    : Object.entries(branches).find(([key, it], index) => getNodeByPathKey(it, pathKey))

export const joinNodePath = (path: NodePath) => path.join(".")

export const getNodeByPathKey = (node: Node, pathKey: string) => {
  node.path = resolveNodePath(node)

  if (joinNodePath(node.path) == pathKey) {
    return node
  } else if (node.branches) {
    return findNodeByPathKey(node.branches, pathKey)
  } else {
    return null
  }
}

export const getNodeByPath = (node: Node, path: (string | number)[]) => getNodeByPathKey(node, joinNodePath(path))
