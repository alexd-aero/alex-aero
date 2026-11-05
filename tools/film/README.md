# Re-shooting the film's real screens

The film on the home page shows the real Aegis × Burrow and Bulwark interfaces
(`assets/real/`). To refresh them after their UIs change:

1. **Burrow / Aegis / Machines**: `python3 burrow-mock.py` serves aegis-burrow's
   `public/` with a stand-in API full of demo data (`AEGIS_PUBLIC`, `BIND`, `PORT`).
2. **Bulwark**: run a scratch Bulwark that touches nothing real — its own
   `BULWARK_CONFIG` (port, key, `home` in a temp folder), `BULWARK_HOME`,
   `BULWARK_OFFLINE=1`, and temp `XDG_CONFIG_HOME` / `XDG_DATA_HOME` / `MESH` —
   then `MINUTES=11 node bulwark-traffic.mjs` with the same environment. It feeds
   made-up requests from documentation addresses through Bulwark's real guard.
   Keep a short run going while snapshotting, or the dashboard says "no sensor".
3. `node snap.mjs plan-*.json out.json` (Chromium with DevTools on `CDP`), after
   replacing `MOCK_URL` / `BULWARK_URL` in the plans.
4. `python3 shadowcss.py <their css> ../../assets/real/<name>.css` for
   `aegis-ui`, `aegis-login` and `bulwark`, then `python3 build-screens.py <dir with
   the snapshots> ../..` writes `assets/real/screens.json` and refuses anything
   that looks like real data.
