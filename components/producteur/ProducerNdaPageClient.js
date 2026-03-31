"use client";

import NdaPageClient from "../nda/NdaPageClient";

export default function ProducerNdaPageClient(props) {
  return <NdaPageClient {...props} nextPathOverride={props.nextPathOverride || "/catalogue"} />;
}
