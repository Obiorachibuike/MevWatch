# **App Name**: MevWatch

## Core Features:

- Mempool Indexing: Index pending Ethereum transactions (mempool) using ethers.providers.WebSocketProvider.
- Sandwich Attack Detection: Detect sandwich attacks by analyzing transaction ordering, gas premiums and slippage, using a Rust WASM tool for efficient computation.
- Time Analysis Detection: Analyze time proximity of transactions to identify bots submitting transactions within 2 blocks of a victim; performed by a Rust WASM tool for transaction clustering.
- The Graph Validation: Validate detected MEV attacks against historical attacks indexed in The Graph subgraph.
- Alert Deduplication: Deduplicate alerts using Redis to prevent duplicate notifications within a 5-minute window.
- Kafka Alerting: Send alerts to a Kafka topic in JSON format, including victim, attacker, profit in ETH, and timestamp.
- Real-time Dashboard: Dashboard for displaying real-time MEV attack statistics and historical trends.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to convey the serious and watchful nature of the app, akin to security systems.
- Background color: Light Gray (#E0E0E0) to provide a neutral backdrop that highlights data.
- Accent color: Teal (#008080) as a contrasting color to draw attention to alerts and key data points.
- Body and headline font: 'Inter', a grotesque-style sans-serif known for its modern, neutral, and objective appearance, suitable for both headlines and body text.
- Use a set of consistent, simple icons to represent different types of MEV attacks and entities (e.g., bots, victims).
- Employ a clear, data-centric layout to highlight key metrics and detected attacks.
- Use subtle animations to indicate real-time data updates.