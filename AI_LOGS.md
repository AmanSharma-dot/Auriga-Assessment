The final solution must be a public GitHub repository, and its root folder must contain the following three files, which are required for evaluation:
- README.md — instructions for project setup, running, and debugging.
- REASONING.md — an explanation of the thought process behind the solution.
- AI_LOGS.md — a complete copy of the candidate's conversation with the AI tool (Copilot or any other). This log must be pasted as-is and not modified in any way; any alteration will lead to a deduction of marks.

I’ll add the three required root files first, then check the available GitHub connection and publish the repository publicly if the workspace has an authorized GitHub integration. I’ll preserve the AI transcript as a raw conversation log rather than summarizing it.

The required files are now at the repository root. To create the public GitHub repository and push the project, GitHub authorization is required in this workspace; I found the GitHub connector and will open its secure connection flow now.

GitHub is connected. I’ll now create the public repository, push the current project files including the three required root documents, and verify the repository metadata and default branch through GitHub’s API.

There is already a public repository named `Auriga-Assessment`, so I’ll use that instead of creating a duplicate. I’m checking its current branch and contents first, then I’ll update it with this solution and verify the required files are present at the root.

Friday night at the multiplex
The multiplex booking counter keeps mis-pricing tickets and the queue is getting angry. Seats come in tiers — Silver, Gold, Recliner — at different prices, and by showtime some tiers sell out and shouldn’t be bookable. There are offers on: a flat festival discount and a percentage off for members (capped). Every booking then adds a small per-ticket convenience fee and GST on top, and it all has to total to the exact paisa. Customers keep demanding a clear line-by-line breakup of the bill.
Build a pricing engine the counter can trust.
(The messy real-world money rules are the point — handle each correctly, and build it for any cinema counter, not one show. Get a plain booking total right first, then layer on the offers, the fee and the tax.)
Above is my problem of auriga assessment round they want me to build this website for above problem and could you please design this website for me ans used techstack like web development.

I’ll first inspect the starter project, then I’ll build the booking counter UI and pricing engine around the actual app structure. I’ll keep the money math explicit and make the bill breakup easy to verify at a glance.

The workspace is blank, so I’m going to scaffold a focused React/Vite web app rather than retrofit an existing codebase. I’m also checking the artifact setup rules so the finished counter is visible in the Replit preview and behaves like a real reusable tool, not a static mockup.

I’ve got the structure: a counter-first screen with showtime inventory, tier controls, offer toggles, and a precise receipt panel. I’m writing the core calculation in integer paise so discounts, fees, GST, and the displayed breakup all come from the same source of truth.

The first pass is in place. I’m doing the practical verification now: install the React type definitions, run a production build, then start the Replit preview workflow and inspect the rendered page for layout or runtime issues.

The build caught one setup issue, not a pricing issue: TypeScript needs Vite’s CSS import declarations. I’m adding that small type shim, then I’ll rerun the build and launch the preview.

The preview is rendering cleanly and the counter flow is visible at a glance. The only browser log is the usual missing favicon request, so I’m cleaning that up and then I’ll do one final build/log check before handing it over.

The final preview is clean: the missing-resource log is gone, the workflow is running, and the production build passes. The main assessment surface is complete; I’m noting two worthwhile next steps separately so the current build stays focused.

Built a complete React/Vite cinema pricing counter called **Cine Ledger**.

### Included

- Showtime selection with live seat availability
- Silver, Gold, and Recliner ticket tiers
- Sold-out seat tiers disabled automatically
- Ticket quantity steppers with availability limits
- Festival flat discount: ₹150
- Auriga member discount: 12%, capped at ₹180
- Convenience fee: ₹22 per ticket
- GST: 18% calculated after discounts and convenience fee
- Integer-paise pricing calculations for exact totals
- Clear line-by-line booking summary
- Ticket subtotal, discounts, fee, GST, and final amount
- Booking confirmation toast
- Reset booking action
- Responsive layout for smaller screens
- Live inventory sync indicator and counter status
- Custom branding, favicon, and polished counter-console UI

### Tech stack

- React
- TypeScript
- Vite
- Lucide React icons
- CSS with responsive layouts
- Replit workflow on port 5000

### Verification

- `npm run build` passes successfully
- Preview workflow is running
- Browser preview loads without console errors
- The pricing engine calculates values in paise to avoid floating-point money issues

The app is ready to preview and publish.

The final solution must be a public GitHub repository, and its root folder must contain the following three files, which are required for evaluation:
- README.md — instructions for project setup, running, and debugging.
- REASONING.md — an explanation of the thought process behind the solution.
- AI_LOGS.md — a complete copy of the candidate's conversation with the AI tool (Copilot or any other). This log must be pasted as-is and not modified in any way; any alteration will lead to a deduction of marks.