# SuperSID Next API

## GET /status
Returns system status.

**Response**
```json
{
  "running": true,
  "data_path": "./data"
}
```
---

## GET /channels
Lists available channels.

**Response**
```json
{
  "channels": ["DHO38", "GQD22"]
}
```

---

## GET /features?channel=CH1
Returns computed features for a channel.

**Response**
```json
{
  "items": [
    {"ts": "2025-10-25T18:00:00Z", "rms": 0.012, "mad": 0.003}
  ]
}
```

---

## GET /data?channel=CH1
Returns raw or processed data in JSON/Parquet.

### `docs/cli.md`
```markdown

# SuperSID Next CLI

## Main commands

### `supersid ingest`
Starts data acquisition from the sound card.

### `supersid api`
Launches the FastAPI server (default port 8000).

### `supersid --help`
Shows general help and available commands.
