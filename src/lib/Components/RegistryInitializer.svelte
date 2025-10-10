<script lang="ts">
  import ResizeableComponent from "../../routes/categories/[CategoryName]/Problems/[ProblemName]/Solve/editor/ResizeableComponent.svelte";
  import WizardComponent from "../../routes/categories/[CategoryName]/Problems/[ProblemName]/Solve/editor/WizardComponent.svelte";
  import TopLevelComponent from "../../routes/categories/[CategoryName]/Problems/[ProblemName]/Solve/editor/TopLevelComponent.svelte";
  import PlaceholderComponent from "../../routes/categories/[CategoryName]/Problems/[ProblemName]/Solve/editor/Placeholders/PlaceholderComponent.svelte";
	import { InitializeRegistryDefault, InitializeRegistryPlaceholder, StaticBaselineComponents } from "../../routes/categories/[CategoryName]/Problems/[ProblemName]/Solve/editor/ComponentRegistry.svelte";

  /* 
  Bit counter-intuitive to intialize from here instead of the registry directly.
  Doing so will cause a circular import error since ComponentRegistry requires TopLevelComponent import 
  and TopLevelComponent requires component registry which causes the entire thing to fail.
  */

  StaticBaselineComponents.set('SplitPanel', ResizeableComponent);
  StaticBaselineComponents.set('WizardPanel', WizardComponent);
  StaticBaselineComponents.set('TopLevelComponent', TopLevelComponent); 
  StaticBaselineComponents.set('PlaceholderPanel', PlaceholderComponent);

  InitializeRegistryDefault();
  InitializeRegistryPlaceholder();

</script>