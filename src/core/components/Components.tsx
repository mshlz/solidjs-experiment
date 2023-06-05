import { Show, createSignal, getOwner, onCleanup, onMount, runWithOwner } from "solid-js"
import { registerComponent, renderBranchesElements } from "../builder/StageBuilder"

import { A } from "@solidjs/router"
import { Alert, Button, Card, CardContent, CircularProgress, IconButton, Stack, TextField, useTheme } from "@suid/material"
import { joinNodePath } from "../builder/Node"
import { Visibility, VisibilityOff } from "@suid/icons-material"

registerComponent({
  key: "form",
  configure: (node) => {
    !node.inset && (node.inset = [])
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })
    return (
      <form ref={(it) => (props.node.ref = it)} onsubmit={(event) => event.preventDefault()}>
        {renderBranchesElements(props.root, props.node)}
      </form>
    )
  }
})

registerComponent({
  key: "submit-field",
  configure: (node) => {
    node.transient = true
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })

    const isBusy = () => (props.node.props?.disabled as boolean) || props.root.state.isFetching || props.root.state.isSending
    const attr = props.node.props?._ as any

    return (
      <Button
        ref={(it) => (props.node.ref = it)}
        onClick={() => {
          props.root.actions?.submit?.()
        }}
        fullWidth={attr?.fullWidth ?? true}
        variant={attr?.variant ?? "contained"}
        color={attr?.color}
        size={attr?.size}
        startIcon={(isBusy() && <CircularProgress size={16} />) || attr?.startIcon}
        endIcon={attr?.endIcon}
        disabled={isBusy()}
      >
        {attr?.text as string}
      </Button>
    )
  }
})

registerComponent({
  key: "button",
  configure: (node) => {
    node.transient = true
  },
  renderer: (props) => {
    const owner = getOwner()
    const node = props.node
    const actions = node.actions

    onMount(() => {
      node.mounted = true
    })
    onCleanup(() => {
      node.mounted = false
    })

    const isBusy = () => (node.props?.disabled as boolean) || props.root.state.isFetching || props.root.state.isSending
    const attr = props.node.props?._ as any

    return (
      <Button
        ref={(it) => (props.node.ref = it)}
        onClick={() => {
          if (actions?.onClick) {
            runWithOwner(owner, () => {
              const res = actions.onClick(props.root, node)
              if (res instanceof Promise) {
                res.catch((e) =>
                  runWithOwner(owner, () => {
                    throw e
                  })
                )
              }
            })
          }
        }}
        fullWidth={attr?.fullWidth ?? true}
        variant={attr?.variant}
        color={attr?.color}
        size={attr?.size}
        startIcon={attr?.startIcon}
        endIcon={attr?.endIcon}
        disabled={isBusy()}
      >
        {attr?.text as string}
      </Button>
    )
  }
})

registerComponent({
  key: "card",
  configure: (node) => {
    !node.inset && (node.inset = [])
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })
    return (
      <Card class={props.node.visuals?._?.self} ref={(it) => (props.node.ref = it)}>
        <CardContent>{renderBranchesElements(props.root, props.node)}</CardContent>
      </Card>
    )
  }
})

registerComponent({
  key: "space",
  configure: (node) => {
    !node.inset && (node.inset = [])
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })

    const attr = props.node.props?._ as any
    const dir = () =>
      $act(() => {
        switch (attr?.direction) {
          case "vertical":
            return "column"
          case "horizontal":
            return "row"
          default:
            return undefined
        }
      })
    const size = () =>
      $act(() => {
        switch (attr?.size) {
          case "small":
            return 1
          case "middle":
            return 2
          case "large":
            return 3
          default:
            return undefined
        }
      })
    return (
      <Stack class={props.node.visuals?._?.self} ref={(it) => (props.node.ref = it)} direction={dir()} spacing={size()}>
        {renderBranchesElements(props.root, props.node)}
      </Stack>
    )
  }
})

registerComponent({
  key: "col",
  configure: (node) => {
    node.inset = []
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })
    const attr = props.node.props?._ as any

    return (
      <div
        ref={(it) => (props.node.ref = it)}
        style={{
          display: "flex",
          "align-items": attr?.alignItems,
          "justify-content": attr?.justifyContent
        }}
      >
        {renderBranchesElements(props.root, props.node)}
      </div>
    )
  }
})

registerComponent({
  key: "alert-error",
  configure: (node) => {
    node.inset = []
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })
    const getErrorMessage = () => props.root.state.errors?.general?.message
    const [visible, setVisible] = createSignal(!!getErrorMessage())
    return (
      <Show
        when={visible() && !!getErrorMessage()}
        children={
          <Alert
            ref={(it) => (props.node.ref = it)}
            severity="error"
            closeText=""
            onClose={() => {
              setVisible(false)
            }}
          >
            {getErrorMessage()}
          </Alert>
        }
      />
    )
  }
})

registerComponent({
  key: "nav-link-field",
  configure: (node) => {
    node.inset = []
  },
  renderer: (props) => {
    onMount(() => {
      props.node.mounted = true
    })
    onCleanup(() => {
      props.node.mounted = false
    })
    const attr = props.node.props?._ as any

    return (
      <Button variant="text" as={A} href={attr?.to} fullWidth={!!attr?.fullWidth}>
        {attr?.text}
      </Button>
    )
  }
})

registerComponent({
  key: "password-field-b",
  renderer: (props) => {
    const node = props.node
    const root = props.root

    onMount(() => {
      node.mounted = true
    })
    onCleanup(() => {
      node.mounted = false
    })

    const [value, setValue] = createSignal(node.value || "")
    const [type, setType] = createSignal("password")
    const theme = useTheme()

    const helperText = () =>
      $opt(
        root.state?.errors?.validation?.[joinNodePath(node.path)]?.message,
        (it) => <span style={{ color: theme.palette.error.main }}>{it}</span>,
        () => null
      )

    const attr = node.props?._ as any

    return (
      <TextField
        autoComplete={attr?.autoComplete}
        inputRef={(it) => (props.node.ref = it)}
        size={attr?.size}
        color={attr?.color}
        defaultValue={attr?.defaultValue}
        fullWidth={attr?.fullWidth ?? true}
        multiline={attr?.multiline}
        name={attr?.name || node.key}
        placeholder={attr?.placeholder}
        required={attr?.required}
        type={type()}
        disabled={attr?.disabled || props.root.state.isSending}
        value={value()}
        onChange={(e, value) => {
          node.value = value
          setValue(() => node.value)
        }}
        variant={attr?.variant || "outlined"}
        label={attr?.label}
        error={!!helperText()}
        helperText={helperText()}
        InputProps={{
          endAdornment: (
            <IconButton onClick={() => setType((prev) => (prev === "password" ? "text" : "password"))}>
              {type() === "password" ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          )
        }}
      />
    )
  }
})

registerComponent({
  key: "input-field-b",
  renderer: (props) => {
    const node = props.node
    const root = props.root

    onMount(() => {
      node.mounted = true
    })
    onCleanup(() => {
      node.mounted = false
    })

    const [value, setValue] = createSignal(node.value || "")
    const theme = useTheme()

    const helperText = () =>
      $opt(
        root.state?.errors?.validation?.[joinNodePath(node.path)]?.message,
        (it) => <span style={{ color: theme.palette.error.main }}>{it}</span>,
        () => null
      )

    const attr = node.props?._ as any

    return (
      <TextField
        autoComplete={attr?.autoComplete}
        inputRef={(it) => (props.node.ref = it)}
        size={attr?.size}
        color={attr?.color}
        defaultValue={attr?.defaultValue}
        fullWidth={attr?.fullWidth ?? true}
        multiline={attr?.multiline}
        name={attr?.name || node.key}
        placeholder={attr?.placeholder}
        required={attr?.required}
        type={attr?.type}
        disabled={attr?.disabled || props.root.state.isSending}
        value={value()}
        onChange={(e, value) => {
          node.value = value
          setValue(() => node.value)
        }}
        variant={attr?.variant || "outlined"}
        label={attr?.label}
        error={!!helperText()}
        helperText={helperText()}
      />
    )
  }
})
