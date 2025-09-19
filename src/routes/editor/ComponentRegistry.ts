import type { Component } from "svelte";
import type { ComponentConfig, ComponentType } from "./ResizableComponentArg";

export const ComponentRegistry = new Map<ComponentType, Component<any>>();
