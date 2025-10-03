<script lang="ts">
  let { path, cls, alt = "description" }: { path: string, cls: string, alt?: string } = $props(); 

  const cloudfrontDistributionDomainName: string = "d3018wbyyxg1xc.cloudfront.net";

  const wrapDuckIdInHttpsCloudfrontCall = (duckId: string) : string => {
      return `https://${cloudfrontDistributionDomainName}/${path}`;
  }

</script>

<img class={cls} src={wrapDuckIdInHttpsCloudfrontCall(path)} alt={alt}>