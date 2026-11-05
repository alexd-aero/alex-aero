# The film's real screens

The Aegis, Burrow, Machines and Bulwark screens in the film on alex-aero.com are
the real interfaces: each product's own stylesheet (`*.css` here, with `:root`,
`html` and `body` renamed so they work inside a shadow root) and the DOM its own
front-end code rendered (`screens.json`).

None of it is anybody's real data:

- Aegis × Burrow's `public/` ran against a stand-in API that answered with demo
  tunnels (`*.example.com`) and demo machines.
- Bulwark's dashboard is a scratch copy (its own config, data folder and port,
  offline, no keys) after its real guard judged about eleven minutes of made-up
  traffic: documentation addresses only (192.0.2.0/24, 198.51.100.0/24,
  203.0.113.0/24, 2001:db8::/32).
