#!/usr/bin/env python3
"""
Push values from api/local.settings.json up to an Azure Function App or
Static Web App as Application Settings (environment variables).

Requires the Azure CLI (`az`) to be installed and logged in:
    az login
    az account set --subscription "<subscription-name-or-id>"

Usage (Static Web App):
    python scripts/sync_local_settings_to_azure.py \
        --target staticwebapp --name midnight-maniac

Usage (Function App):
    python scripts/sync_local_settings_to_azure.py \
        --target functionapp --name <name> --resource-group <rg>
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

# Keys that should NOT be pushed to Azure. FUNCTIONS_WORKER_RUNTIME is managed
# by the Function App itself; AzureWebJobsStorage is set via the storage
# account binding, not app settings.
DEFAULT_EXCLUDES = {"FUNCTIONS_WORKER_RUNTIME", "AzureWebJobsStorage"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--target",
        choices=("staticwebapp", "functionapp"),
        default="staticwebapp",
        help="Which Azure resource type to push to (default: staticwebapp)",
    )
    parser.add_argument("--name", required=True, help="Name of the Static Web App or Function App")
    parser.add_argument(
        "--resource-group",
        help="Resource group (required for --target functionapp, optional for staticwebapp)",
    )
    parser.add_argument(
        "--settings-file",
        default="api/local.settings.json",
        help="Path to local.settings.json (default: api/local.settings.json)",
    )
    parser.add_argument(
        "--exclude",
        nargs="*",
        default=[],
        help="Extra keys to skip (in addition to the defaults)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the keys that would be pushed without calling az",
    )
    args = parser.parse_args()
    if args.target == "functionapp" and not args.resource_group:
        parser.error("--resource-group is required when --target is functionapp")
    return args


def load_settings(path: Path) -> dict[str, str]:
    if not path.exists():
        sys.exit(f"error: settings file not found: {path}")
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as err:
        sys.exit(f"error: could not parse {path}: {err}")

    values = data.get("Values")
    if not isinstance(values, dict):
        sys.exit(f"error: {path} has no 'Values' object")
    return {k: "" if v is None else str(v) for k, v in values.items()}


def ensure_az_available() -> None:
    if shutil.which("az") is None:
        sys.exit("error: Azure CLI (`az`) not found on PATH. Install it and run `az login` first.")


def push_settings(target: str, name: str, resource_group: str | None, settings: dict[str, str]) -> None:
    kv_pairs = [f"{k}={v}" for k, v in settings.items()]
    if target == "functionapp":
        cmd = [
            "az", "functionapp", "config", "appsettings", "set",
            "--name", name,
            "--resource-group", resource_group,
            "--settings", *kv_pairs,
            "--output", "none",
        ]
    else:  # staticwebapp
        cmd = [
            "az", "staticwebapp", "appsettings", "set",
            "--name", name,
            "--setting-names", *kv_pairs,
            "--output", "none",
        ]
        if resource_group:
            cmd.extend(["--resource-group", resource_group])
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as err:
        sys.exit(f"error: az command failed with exit code {err.returncode}")


def main() -> None:
    args = parse_args()
    settings_path = Path(args.settings_file)
    all_values = load_settings(settings_path)

    excludes = DEFAULT_EXCLUDES | set(args.exclude)
    to_push = {k: v for k, v in all_values.items() if k not in excludes and v != ""}
    skipped = sorted(set(all_values) - set(to_push))

    if not to_push:
        sys.exit("error: no settings to push after applying excludes / empty filters")

    print(f"Target type  : {args.target}")
    print(f"Name         : {args.name}")
    print(f"Resource Grp : {args.resource_group or '(auto)'}")
    print(f"Source file  : {settings_path}")
    print(f"Pushing {len(to_push)} setting(s):")
    for key in sorted(to_push):
        print(f"  + {key}")
    if skipped:
        print(f"Skipping {len(skipped)}:")
        for key in skipped:
            print(f"  - {key}")

    if args.dry_run:
        print("\n[dry-run] no changes made.")
        return

    ensure_az_available()
    confirm = input("\nProceed? [y/N] ").strip().lower()
    if confirm not in {"y", "yes"}:
        print("aborted.")
        return

    push_settings(args.target, args.name, args.resource_group, to_push)
    print("done.")


if __name__ == "__main__":
    main()
