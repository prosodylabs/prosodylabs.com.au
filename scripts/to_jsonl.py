#!/usr/bin/env python3
"""Convert Kairos firing data from split JSON files to streaming JSONL format.

Input:  public/kairos/meta.json, sample_0.json .. sample_4.json
Output: public/kairos/meta.jsonl, sample_0.jsonl .. sample_4.jsonl

Each output line is a self-contained JSON object so the visualization can
start rendering incrementally without loading the entire file.
"""

import json
import sys
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent.parent / "public" / "kairos"


def write_meta_jsonl(src: Path, dst: Path) -> None:
    with open(src) as f:
        meta = json.load(f)

    with open(dst, "w") as out:
        # First line: metadata (everything except weights)
        meta_line = {
            "type": "meta",
            "timesteps": meta["timesteps"],
            "neurons_per_layer": meta["neurons_per_layer"],
            "layers": meta["layers"],
            "model": meta["model"],
            "magnitude_range": meta["magnitude_range"],
            "sample_count": meta["sample_count"],
            "samples": meta["samples"],
        }
        out.write(json.dumps(meta_line, separators=(",", ":")) + "\n")

        # One line per layer pair for weights
        for layer_key, connections in meta["weights"].items():
            weight_line = {
                "type": "weights",
                "layer": layer_key,
                "connections": connections,
            }
            out.write(json.dumps(weight_line, separators=(",", ":")) + "\n")

    print(f"  {dst.name}: {meta_line['sample_count']} samples, "
          f"{len(meta['weights'])} weight layers")


def write_sample_jsonl(src: Path, dst: Path) -> None:
    with open(src) as f:
        sample = json.load(f)

    with open(dst, "w") as out:
        # Sample metadata
        out.write(json.dumps({
            "type": "sample_meta",
            "name": sample["name"],
            "text": sample["text"],
        }, separators=(",", ":")) + "\n")

        # Spikes — one line per layer
        for layer_key, data in sample["spikes"].items():
            out.write(json.dumps({
                "type": "spikes",
                "layer": layer_key,
                "data": data,
            }, separators=(",", ":")) + "\n")

        # Membrane potentials — one line per layer
        for layer_key, data in sample["membrane"].items():
            out.write(json.dumps({
                "type": "membrane",
                "layer": layer_key,
                "data": data,
            }, separators=(",", ":")) + "\n")

        # Residual aggregates — one line per layer
        for layer_key, data in sample["residual"].items():
            out.write(json.dumps({
                "type": "residual",
                "layer": layer_key,
                "data": data,
            }, separators=(",", ":")) + "\n")

    spike_layers = len(sample["spikes"])
    membrane_layers = len(sample["membrane"])
    residual_layers = len(sample["residual"])
    total_lines = 1 + spike_layers + membrane_layers + residual_layers
    print(f"  {dst.name}: {total_lines} lines "
          f"({spike_layers} spike + {membrane_layers} membrane + "
          f"{residual_layers} residual)")


def main() -> None:
    if not DATA_DIR.exists():
        print(f"Error: data directory not found: {DATA_DIR}", file=sys.stderr)
        sys.exit(1)

    meta_src = DATA_DIR / "meta.json"
    if not meta_src.exists():
        print(f"Error: {meta_src} not found", file=sys.stderr)
        sys.exit(1)

    print("Converting meta.json ...")
    write_meta_jsonl(meta_src, DATA_DIR / "meta.jsonl")

    # Discover sample files by looking at sample_count in meta
    with open(meta_src) as f:
        sample_count = json.load(f)["sample_count"]

    for i in range(sample_count):
        src = DATA_DIR / f"sample_{i}.json"
        if not src.exists():
            print(f"Warning: {src} not found, skipping", file=sys.stderr)
            continue
        print(f"Converting sample_{i}.json ...")
        write_sample_jsonl(src, DATA_DIR / f"sample_{i}.jsonl")

    # Summary
    jsonl_files = sorted(DATA_DIR.glob("*.jsonl"))
    total_bytes = sum(f.stat().st_size for f in jsonl_files)
    json_files = sorted(DATA_DIR.glob("*.json"))
    orig_bytes = sum(f.stat().st_size for f in json_files)
    print(f"\nDone. {len(jsonl_files)} JSONL files, "
          f"{total_bytes / 1_000_000:.1f}MB total "
          f"(original JSON: {orig_bytes / 1_000_000:.1f}MB)")


if __name__ == "__main__":
    main()
