import subprocess
import time
import requests
import asyncio
import websockets
import json
import base64
import os

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9222
USER_DATA_DIR = os.path.join(os.environ.get("TEMP", "C:/Temp"), "edge_cdp_profile")

cmd = [
    EDGE_PATH,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    f"--remote-debugging-port={PORT}",
    f"--user-data-dir={USER_DATA_DIR}",
    "--window-size=1280,1000",
    "http://localhost:4173"
]

proc = subprocess.Popen(cmd)
time.sleep(2)

try:
    resp = requests.get(f"http://127.0.0.1:{PORT}/json")
    tabs = resp.json()
    ws_url = tabs[0]["webSocketDebuggerUrl"]

    async def run_cdp():
        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                mid = msg_id
                msg_id += 1
                await ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == mid:
                        return data.get("result", {})

            await send("Page.enable")
            await send("Runtime.enable")
            await send("Console.enable")

            # Wait for page to render
            await asyncio.sleep(2)

            # 1. Capture moods section
            await send("Runtime.evaluate", {
                "expression": "document.getElementById('view-moods')?.scrollIntoView({behavior: 'instant', block: 'start'})"
            })
            await asyncio.sleep(1)
            res1 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scratch/cdp_moods.png", "wb") as f:
                f.write(base64.b64decode(res1["data"]))
            print("Saved scratch/cdp_moods.png")

            # 2. Capture sky section
            await send("Runtime.evaluate", {
                "expression": "document.getElementById('view-sky')?.scrollIntoView({behavior: 'instant', block: 'start'})"
            })
            await asyncio.sleep(1)
            res2 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scratch/cdp_sky.png", "wb") as f:
                f.write(base64.b64decode(res2["data"]))
            print("Saved scratch/cdp_sky.png")

            # 3. Capture tapri wall section
            await send("Runtime.evaluate", {
                "expression": "document.getElementById('view-wall')?.scrollIntoView({behavior: 'instant', block: 'start'})"
            })
            await asyncio.sleep(1)
            res3 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scratch/cdp_wall.png", "wb") as f:
                f.write(base64.b64decode(res3["data"]))
            print("Saved scratch/cdp_wall.png")

    asyncio.run(run_cdp())
finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except:
        proc.kill()

