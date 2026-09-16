The final solution must be a public GitHub repository, and its root folder must contain the following three files, which are required for evaluation:
- README.md — instructions for project setup, running, and debugging.
- REASONING.md — an explanation of the thought process behind the solution.
- AI_LOGS.md — a complete copy of the candidate's conversation with the AI tool (Copilot or any other). This log must be pasted as-is and not modified in any way; any alteration will lead to a deduction of marks.

I’ll add the three required root files first, then check the available GitHub connection and publish the repository publicly if the workspace has an authorized GitHub integration. I’ll preserve the AI transcript as a raw conversation log rather than summarizing it.

The required files are now at the repository root. To create the public GitHub repository and push the project, GitHub authorization is required in this workspace; I found the GitHub connector and will open its secure connection flow now.

GitHub is connected. I’ll now create the public repository, push the current project files including the three required root documents, and verify the repository metadata and default branch through GitHub’s API.

There is already a public repository named `Auriga-Assessment`, so I’ll use that instead of creating a duplicate. I’m checking its current branch and contents first, then I’ll update it with this solution and verify the required files are present at the root.

User accepted the proposed integration connection:conn_github_01M2MRY6PYRE71AV7YEJGHSAH5 (GitHub). It is attached to this environment and ready to use. The connection_information block below belongs in application code written to disk, not in the codeExecution sandbox — in a conversation, ignore it and call the connection's API with the connectorFetch callback instead.

# Connection: GitHub

**Integration ID:** `connection:conn_github_01M2MRY6PYRE71AV7YEJGHSAH5`
**Status:** added
**Connector:** `github`

Connect to GitHub to manage repositories, issues, pull requests, and more.

Documentation: https://docs.github.com/en/rest

## SDK setup

### JavaScript

Package: `@octokit/rest` @ `21.1.1`

```js
import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

// Make authenticated requests to GitHub
// The SDK handles identity, token refresh, and auth headers automatically.
const response = await connectors.proxy("github", "/your/api/endpoint", {
  method: "GET",
});
```

### Python

Package: `replit-connectors` @ `latest`

```python
from replit_connectors import ReplitConnectors

connectors = ReplitConnectors()

# Make authenticated requests to GitHub
# The SDK handles identity, token refresh, and auth headers automatically.
response = connectors.proxy("github", "/your/api/endpoint", method="GET")

print(response)
```

## Setup instructions

Call the GitHub REST API through the authenticated proxy: connectors.proxy("github", "/path"). Paths are relative to the connection's API base URL — https://api.github.com by default, or https://<your-host>/api/v3 for GitHub Enterprise Server. Credentials are injected automatically. The proxy returns a raw Response object — check response.ok, then call .json().

queryId: inv_1dEn8fgJIj9o3dnrpxgjRczV2Sv3TzQY8N:call_w1bZcj3qlwOky1NVKJimLBnA

GitHub is connected. I’ll now create the public repository, push the current project files including the three required root documents, and verify the repository metadata and default branch through GitHub’s API.

There is already a public repository named `Auriga-Assessment`, so I’ll use that instead of creating a duplicate. I’m checking its current branch and contents first, then I’ll update it with this solution and verify the required files are present at the root.

so can i run this app

Yes. The app is already running in the Replit preview through the `Start application` workflow.

### Run it locally

```bash
git clone https://github.com/AmanSharma-dot/Auriga-Assessment.git
cd Auriga-Assessment
npm install
npm run dev
```

Then open:

```text
http://localhost:5000
```

Requirements:

- Node.js 20+
- npm

To verify the production build:

```bash
npm run build
```

You can also run it directly from the Replit workspace by opening the Preview panel.

is it static or dynamic

It is **interactive but not fully dynamic**.

### Dynamic in the current app

These work live in the browser:

- Selecting different showtimes
- Updating Silver, Gold, and Recliner quantities
- Disabling sold-out tiers
- Applying/removing festival and member discounts
- Recalculating convenience fee, GST, and final total
- Showing the line-by-line bill breakup
- Confirming and clearing a booking

### Currently static

The following data is stored in `src/App.tsx` as in-memory sample data:

- Movie name
- Showtimes
- Seat availability
- Ticket prices
- Discount rules
- Convenience fee
- GST rate

That means the data resets when the page refreshes. It does not currently have:

- A backend API
- Database persistence
- User authentication
- Multi-counter inventory synchronization
- Permanent booking storage
- Real payment processing

so make it dynamic

I’m converting the prototype into a real client/server flow: showtimes and inventory will come from an API, quotes will be calculated server-side in paise, and confirmed bookings will persist in a local data store so refreshes do not reset the booking state.

The frontend now reads live showtimes, configuration, and quote totals from the server, and confirmation writes a booking back to the store. I’m checking the new server/client wiring now, then I’ll restart the workflow and exercise the API directly before updating the GitHub repository.

The live preview now loads showtimes from `/api/shows`, asks the server for every quote, and the API returns the same paise-perfect breakdown shown in the UI. I’m updating the project docs to reflect the new backend and then I’ll verify the production server path before syncing the changes to GitHub.

The API and development preview are working. The production start check found one Express 5 compatibility issue in the SPA fallback route (`*` is no longer accepted); I’m replacing that route with a middleware fallback, then I’ll rerun the production check and sync the fix.

The production server now starts cleanly on its own port, and the Replit workflow has been restarted on the dynamic server. I’m recording this implementation step in the required transcript, then I’ll push the full-stack version to the public repository and verify the new files remotely.

use gsap and framer motion for animation

I’ll add both animation systems without changing the pricing behavior: Framer Motion for component transitions and interaction feedback, and GSAP for the live inventory/progress and summary-card entrance choreography. Then I’ll rebuild, restart the preview, and check the rendered result.

The animation layer is wired in: Framer Motion handles page/card entrances, hover/tap feedback, the summary layout transition, and confirmation toast; GSAP handles the progress bars, summary entrance, and total amount emphasis when the quote changes. I’m building now to catch any JSX or typing issues before previewing it.

The build passes with both animation libraries included. I’m restarting the running workflow once so the dependency change is active, then I’ll capture the final preview and inspect the browser log.

The animated preview is clean with no browser errors. I’m syncing the animation changes and documentation to the public GitHub repository so the repository stays aligned with the running app.

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