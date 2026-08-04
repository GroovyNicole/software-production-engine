"""Planted-failure fixture for the silent-failure gate."""

import json


def violation_bare_except(path):
    try:
        return json.loads(open(path).read())
    except:                     # VIOLATION — bare except catches bugs and interrupts
        return {}


def violation_pass_body(client):
    try:
        client.refresh()
    except ConnectionError:
        pass                    # VIOLATION — error discarded entirely


def violation_return_none(client):
    try:
        return client.fetch()
    except TimeoutError:
        return None             # VIOLATION — failure indistinguishable from empty result


def violation_continue(items, client):
    results = []
    for item in items:
        try:
            results.append(client.send(item))
        except ValueError:
            continue            # VIOLATION — item silently dropped from the batch
    return results


def clean_logged(client, log):
    try:
        client.refresh()
    except ConnectionError as exc:
        log.warning("refresh failed: %s", exc)      # CLEAN — failure is recorded


def clean_reraised(client):
    try:
        client.refresh()
    except ConnectionError:
        raise                                        # CLEAN — failure propagates


def clean_meaningful_default(config, key):
    try:
        return config[key]
    except KeyError:
        return "default-value"                       # CLEAN — deliberate fallback value


def waived_optional_config(path):
    try:
        return open(path).read()
    # spe:allow silent-failure — optional settings file; absence is a supported state
    except FileNotFoundError:
        pass                                         # CLEAN — declared and justified
