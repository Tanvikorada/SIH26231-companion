import React from "react";
import { StampBadge } from "./proposed_StampBadge";

// Verify various prop invocations pass TypeScript typechecking
const test1 = <StampBadge status="positive" />;
const test2 = <StampBadge status="negative" />;
const test3 = <StampBadge status="inconclusive" />;
const test4 = <StampBadge variant="navy" text="FORM 4A CERTIFIED" />;
const test5 = <StampBadge variant="brass" text="CAUTION" size="lg" />;
const test6 = <StampBadge variant="saffron" text="AUDIT PENDING" size="sm" />;
const test7 = <StampBadge variant="green" text="SAMPLE VERIFIED" />;

console.log("TypeScript test assertions passed!");
