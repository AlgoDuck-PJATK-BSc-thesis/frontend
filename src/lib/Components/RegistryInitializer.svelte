<script lang="ts">
	import { ComponentRegistry } from "../../routes/editor/ComponentRegistry";
  import ResizeableComponent from "../../routes/editor/ResizeableComponent.svelte";
  import WizardComponent from "../../routes/editor/WizardComponent.svelte";
  import TopLevelComponent from "../../routes/editor/TopLevelComponent.svelte";
  import PlaceholderComponent from "../../routes/editor/Placeholders/PlaceholderComponent.svelte";

  /* 
  Bit counter-intuitive to intialize from here instead of the registry directly.
  Doing so will cause a circular import error since ComponentRegistry requires TopLevelComponent import 
  and TopLevelComponent requires component registry which causes the entire thing to fail.
  */

  ComponentRegistry.set('SplitPanel', ResizeableComponent);
  ComponentRegistry.set('WizardPanel', WizardComponent);
  ComponentRegistry.set('TopLevelComponent', TopLevelComponent); 
  ComponentRegistry.set('PlaceholderPanel', PlaceholderComponent);

</script>