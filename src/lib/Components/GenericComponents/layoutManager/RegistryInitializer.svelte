<script lang="ts">
	import { InitializeRegistryDefault, InitializeRegistryPlaceholder, StaticBaselineComponents } from "./ComponentRegistry.svelte";
	import PlaceHolderComponent from "./PlaceHolderComponent.svelte";
	import ResizeableComponent from "./ResizeableComponent.svelte";
	import TopLevelComponent from "./TopLevelComponent.svelte";
	import WizardComponent from "./WizardComponent.svelte";


  /* 
  Bit counter-intuitive to intialize from here instead of the registry directly.
  Doing so will cause a circular import error since ComponentRegistry requires TopLevelComponent import 
  and TopLevelComponent requires component registry which causes the entire thing to fail.
  */

  StaticBaselineComponents.set('SplitPanel', ResizeableComponent);
  StaticBaselineComponents.set('WizardPanel', WizardComponent);
  StaticBaselineComponents.set('TopLevelComponent', TopLevelComponent); 
  StaticBaselineComponents.set('PlaceholderPanel', PlaceHolderComponent);

  InitializeRegistryDefault();
  InitializeRegistryPlaceholder();

</script>